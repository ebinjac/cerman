'use server';

import { getDb } from '@/db/server';
import { certificatesTable, serviceIds, teamsTable, notificationHistory } from '@/db/schema';
import { addDays, differenceInDays } from 'date-fns';
import { sendEmail } from './email';
import { eq, and, isNull, lte, gt, sql, isNotNull } from 'drizzle-orm';

const NOTIFICATION_DAYS = [90, 60, 30, 15, 7, 1];

interface ExpiringItem {
  id: string;
  name: string;
  type: 'certificate' | 'serviceId';
  expiryDate: string;
  teamId: string;
  daysRemaining: number;
}

async function getExpiringCertificates() {
  const db = await getDb();
  const now = new Date();
  const maxDays = 90;

  console.log('Fetching expiring certificates...');
  console.log('Current date:', now.toISOString());
  console.log('Max days to check:', maxDays);

  const certificates = await db
    .select({
      id: certificatesTable.id,
      name: certificatesTable.commonName,
      expiryDate: certificatesTable.validTo,
      teamId: certificatesTable.teamId,
    })
    .from(certificatesTable)
    .where(
      and(
        isNull(certificatesTable.deletedAt),
        lte(certificatesTable.validTo, addDays(now, maxDays)),
        gt(certificatesTable.validTo, now)
      )
    );

  console.log('Found certificates:', certificates.length);
  
  const processedCertificates = certificates.map(cert => {
    const daysRemaining = differenceInDays(new Date(cert.expiryDate), now);
    console.log(`Certificate: ${cert.name}, Expiry: ${cert.expiryDate}, Days remaining: ${daysRemaining}`);
    
    return {
      ...cert,
      type: 'certificate' as const,
      expiryDate: cert.expiryDate.toISOString(),
      daysRemaining,
    };
  });

  return processedCertificates;
}

async function getExpiringServiceIds() {
  const db = await getDb();
  const now = new Date();
  const maxDays = 90;

  console.log('Fetching expiring service IDs...');
  console.log('Current date:', now.toISOString());
  console.log('Max days to check:', maxDays);

  const svcIds = await db
    .select({
      id: serviceIds.id,
      name: serviceIds.svcid,
      expiryDate: serviceIds.expDate,
      teamId: serviceIds.renewingTeamId,
    })
    .from(serviceIds)
    .where(
      and(
        lte(serviceIds.expDate, sql`${addDays(now, maxDays).toISOString().split('T')[0]}`),
        gt(serviceIds.expDate, sql`${now.toISOString().split('T')[0]}`),
        isNotNull(serviceIds.renewingTeamId)
      )
    );

  console.log('Found service IDs:', svcIds.length);

  const processedServiceIds = svcIds.map(sid => {
    const daysRemaining = differenceInDays(new Date(sid.expiryDate), now);
    console.log(`Service ID: ${sid.name}, Expiry: ${sid.expiryDate}, Days remaining: ${daysRemaining}`);
    
    return {
      ...sid,
      type: 'serviceId' as const,
      expiryDate: sid.expiryDate,
      daysRemaining,
      teamId: sid.teamId || '',
    };
  });

  return processedServiceIds;
}

async function getTeamContacts(teamId: string, daysRemaining: number) {
  const db = await getDb();
  const team = await db
    .select({
      alert1: teamsTable.alert1,
      alert2: teamsTable.alert2,
      alert3: teamsTable.alert3,
      escalation: teamsTable.escalation,
    })
    .from(teamsTable)
    .where(eq(teamsTable.id, teamId))
    .limit(1);

  console.log('Team data:', team[0]);
  console.log('Days remaining:', daysRemaining);

  if (!team[0]) {
    console.log('No team found for ID:', teamId);
    return [];
  }

  // Get emails based on days remaining
  let contacts: string[] = [];
  
  if (daysRemaining >= 60) {
    // 90 days - use alert3
    console.log('Using alert3 for 90 days');
    if (team[0].alert3) {
      contacts = team[0].alert3.split(',').map(email => email.trim());
      console.log('Alert3 contacts:', contacts);
    }
  } else if (daysRemaining >= 30) {
    // 60 days - use alert2
    console.log('Using alert2 for 60 days');
    if (team[0].alert2) {
      contacts = team[0].alert2.split(',').map(email => email.trim());
      console.log('Alert2 contacts:', contacts);
    }
  } else if (daysRemaining >= 10) {
    // 30 days - use alert1
    console.log('Using alert1 for 30 days');
    if (team[0].alert1) {
      contacts = team[0].alert1.split(',').map(email => email.trim());
      console.log('Alert1 contacts:', contacts);
    }
  } else {
    // 10, 7, 1 days - use escalation
    console.log('Using escalation for 10, 7, 1 days');
    if (team[0].escalation) {
      contacts = team[0].escalation.split(',').map(email => email.trim());
      console.log('Escalation contacts:', contacts);
    }
  }

  console.log('Final contacts:', contacts);
  return contacts.filter(Boolean);
}

async function processExpiringItem(item: ExpiringItem, triggeredBy: 'system' | 'admin' = 'system') {
  const db = await getDb();
  
  // Check if notification was already sent for this item and days remaining
  const existingNotification = await db
    .select()
    .from(notificationHistory)
    .where(
      and(
        eq(notificationHistory.itemId, item.id),
        eq(notificationHistory.daysUntilExpiry, item.daysRemaining.toString()),
        eq(notificationHistory.status, 'success')
      )
    )
    .limit(1);

  if (existingNotification.length > 0) {
    console.log(`Notification already sent for ${item.type} ${item.name} with ${item.daysRemaining} days remaining`);
    return;
  }

  const contacts = await getTeamContacts(item.teamId, item.daysRemaining);
  
  if (contacts.length === 0) {
    await db.insert(notificationHistory).values({
      itemId: item.id,
      itemType: item.type,
      itemName: item.name,
      teamId: item.teamId,
      daysUntilExpiry: item.daysRemaining.toString(),
      notificationType: 'email',
      recipients: JSON.stringify([]),
      status: 'failed',
      errorMessage: 'No contacts found for team',
      triggeredBy,
    });
    return;
  }

  try {
    const subject = `${item.type === 'certificate' ? 'Certificate' : 'Service ID'} Expiry Alert: ${item.name}`;
    const isCertificate = item.type === 'certificate';
    const primaryColor = isCertificate ? '#2563eb' : '#7c3aed'; // Blue for certs, Purple for service IDs
    const secondaryColor = isCertificate ? '#1e40af' : '#5b21b6';
    const icon = isCertificate ? '🔒' : '🆔';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: ${primaryColor}; margin: 0; font-size: 24px;">Cerser</h1>
            <p style="color: #6b7280; margin: 5px 0; font-size: 16px;">Certificate & Service ID Management</p>
          </div>
          
          <div style="background-color: ${isCertificate ? '#eff6ff' : '#f5f3ff'}; padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid ${primaryColor};">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
              <span style="font-size: 24px;">${icon}</span>
              <h2 style="color: ${secondaryColor}; margin: 0; font-size: 20px;">
                ${isCertificate ? 'Certificate' : 'Service ID'} Expiry Alert
              </h2>
            </div>
            <p style="color: #4b5563; margin: 0; font-size: 16px;">
              The ${isCertificate ? 'certificate' : 'service ID'} <strong style="color: ${primaryColor};">${item.name}</strong> will expire in ${item.daysRemaining} days.
            </p>
          </div>

          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; background-color: #f3f4f6; padding: 15px; border-radius: 6px;">
              <div>
                <p style="color: #4b5563; margin: 0 0 10px 0; font-size: 16px;">
                  <strong>Expiry Date:</strong> ${new Date(item.expiryDate).toLocaleDateString()}
                </p>
                <p style="color: #4b5563; margin: 0; font-size: 16px;">
                  <strong>Days Remaining:</strong> ${item.daysRemaining} days
                </p>
              </div>
              <div style="text-align: right;">
                <p style="color: #4b5563; margin: 0 0 10px 0; font-size: 16px;">
                  <strong>Type:</strong> ${isCertificate ? 'Certificate' : 'Service ID'}
                </p>
                <p style="color: #4b5563; margin: 0; font-size: 16px;">
                  <strong>Status:</strong> <span style="color: ${item.daysRemaining <= 30 ? '#dc2626' : '#16a34a'}">${item.daysRemaining <= 30 ? 'Urgent' : 'Active'}</span>
                </p>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              This is an automated notification from Cerser. Please take necessary action to renew or replace the ${isCertificate ? 'certificate' : 'service ID'}.
            </p>
            ${item.daysRemaining <= 30 ? `
              <p style="color: #dc2626; margin: 10px 0 0 0; font-size: 14px; font-weight: bold;">
                ⚠️ Immediate action required due to imminent expiry
              </p>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    for (const contact of contacts) {
      await sendEmail(contact, subject, html);
    }

    await db.insert(notificationHistory).values({
      itemId: item.id,
      itemType: item.type,
      itemName: item.name,
      teamId: item.teamId,
      daysUntilExpiry: item.daysRemaining.toString(),
      notificationType: 'email',
      recipients: JSON.stringify(contacts),
      status: 'success',
      triggeredBy,
    });
  } catch (error) {
    await db.insert(notificationHistory).values({
      itemId: item.id,
      itemType: item.type,
      itemName: item.name,
      teamId: item.teamId,
      daysUntilExpiry: item.daysRemaining.toString(),
      notificationType: 'email',
      recipients: JSON.stringify(contacts),
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      triggeredBy,
    });
    throw error;
  }
}

export async function checkAndSendNotifications(triggeredBy: 'system' | 'admin' = 'system') {
  console.log('Starting notification check...');
  
  const certificates = await getExpiringCertificates();
  const serviceIds = await getExpiringServiceIds();
  const allItems = [...certificates, ...serviceIds];

  console.log('Total items to process:', allItems.length);
  console.log('Notification days:', NOTIFICATION_DAYS);

  for (const item of allItems) {
    console.log(`Processing ${item.type} ${item.name} with ${item.daysRemaining} days remaining`);
    if (NOTIFICATION_DAYS.includes(item.daysRemaining)) {
      console.log(`Days remaining ${item.daysRemaining} matches notification criteria`);
      await processExpiringItem(item, triggeredBy);
    } else {
      console.log(`Days remaining ${item.daysRemaining} does not match notification criteria`);
    }
  }
} 