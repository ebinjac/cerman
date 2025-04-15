"use server";
import { certificatesTable, notificationsTable, teamsTable, serviceIds as serviceIdsTable, NewServiceId, applications, certificatePlannings } from "../db/schema";
import { and, eq, sql, desc, lt, gt, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache"
import { parse } from 'csv-parse/sync';
import { format } from 'date-fns';
import { db } from "../db/client";
import { v4 as uuid } from 'uuid';

export async function getRecentTeamRequests() {
  return db.select()
    .from(teamsTable)
    .orderBy(sql`${teamsTable.createdAt} DESC`)
    .limit(5);
}

// Update createTeam to add notification
export async function createTeam(formData: FormData) {
  const data = {
    teamName: formData.get("teamName") as string,
    escalation: formData.get("escalation") as string,
    alert1: formData.get("alert1") as string,
    alert2: formData.get("alert2") as string,
    alert3: formData.get("alert3") as string,
    snowGroup: formData.get("snowGroup") as string,
    prcGroup: formData.get("prcGroup") as string,
    applications: (formData.get("applications") as string)?.split(",") || [],
    createdBy: formData.get("createdBy") as string,
    createdAt: new Date(),
    updatedAt: new Date(),
    approved: false,
  };

  try {
    const [result] = await db.insert(teamsTable).values(data).returning();
    
    // Add notification
    await db.insert(notificationsTable).values({
      message: `New team submission: ${data.teamName}`,
      type: 'submission',
      teamId: result.id
    });
    
    return result;
  } catch (error: any) {
    if (error.code === '23505') { // PostgreSQL unique violation code
      throw new Error('Team name already exists. Please choose a different name.');
    }
    throw new Error(`Failed to create team: ${error.message}`);
  }
}

// Admin approval actions
export async function approveTeam(teamId: string) {
  await db.update(teamsTable)
    .set({ approved: true })
    .where(eq(teamsTable.id, teamId));
}

export async function getPendingTeams() {
    return db.select()
      .from(teamsTable)
      .where(eq(teamsTable.status, 'pending'));
  }
  
  export async function updateTeamStatus(teamId: string, status: 'approved' | 'rejected') {
    const updateData = {
      status,
      [status === 'approved' ? 'approvedAt' : 'rejectedAt']: new Date()
    };
    
    await db.update(teamsTable)
      .set(updateData)
      .where(eq(teamsTable.id, teamId));
  }
  
  export async function deleteTeam(teamId: string) {
    await db.delete(teamsTable)
      .where(eq(teamsTable.id, teamId));
  }
  
  export async function updateTeam(
    teamId: string,
    data: {
      teamName: string;
      escalation: string;
      alert1: string;
      alert2?: string;
      alert3?: string;
      snowGroup: string;
      prcGroup: string;
      applications: string[];
    }
  ) {
    try {
      const [result] = await db
        .update(teamsTable)
        .set({
          ...data,
          updatedAt: new Date(),
          updatedBy: "user", // TODO: Replace with actual user email
        })
        .where(eq(teamsTable.id, teamId))
        .returning();

      return result;
    } catch (error: any) {
      if (error.code === "23505") {
        throw new Error("Team name already exists. Please choose a different name.");
      }
      throw new Error(`Failed to update team: ${error.message}`);
    }
  }

export async function getDashboardStats() {
  const [totalTeams, pendingRequests, rejectedRequests] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(teamsTable),
    db.select({ count: sql<number>`count(*)` }).from(teamsTable).where(eq(teamsTable.status, 'pending')),
    db.select({ count: sql<number>`count(*)` }).from(teamsTable).where(eq(teamsTable.status, 'rejected'))
  ]);

  return {
    total: totalTeams[0].count,
    pending: pendingRequests[0].count,
    rejected: rejectedRequests[0].count
  };
}

export async function getRecentActivities() {
  return db.select()
    .from(notificationsTable)
    .orderBy(sql`${notificationsTable.createdAt} DESC`)
    .limit(10);
}

// Update the importCertificateFromCertaas function
// Update in the importCertificateFromCertaas parameters
export async function importCertificateFromCertaas(data: {
  teamId: string
  isAmexCert: boolean
  validFrom?: Date
  validTo?: Date
  environment?: 'E1' | 'E2' | 'E3'  // Change from development/staging/production
  commonName: string
  serialNumber: string
  serverName: string
  keystorePath: string
  uri: string
  applicationId: string
  comment?: string
}) {
  try {
    // Check for existing certificate with same serial number AND common name
    const [existingCert] = await db.select()
      .from(certificatesTable)
      .where(
        and(
          eq(certificatesTable.teamId, data.teamId),
          eq(certificatesTable.serialNumber, data.serialNumber),
          eq(certificatesTable.commonName, data.commonName)
        )
      )
      .limit(1);

    if (existingCert) {
      throw new Error('Certificate with this serial number and common name combination already exists for this team');
    }

    let certificateData: typeof certificatesTable.$inferInsert;
    
    if (data.isAmexCert) {
      // CertaaS API call logic
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/certaas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumber: data.serialNumber,
          commonName: data.commonName
        })
      });

      if (!response.ok) throw new Error('Failed to fetch certificate from CertaaS');
      const certs = await response.json();
      if (!certs.length) throw new Error('No certificates found');

      const certaasData = certs[0];
      certificateData = {
        ...certaasData,
        teamId: data.teamId,
        isAmexCert: true, // Explicitly set to true for CertaaS certs
        certificateIdentifier: `${data.teamId}-${certaasData.certificateIdentifier}`,
        serverName: data.serverName,
        keystorePath: data.keystorePath,
        uri: data.uri,
        applicationId: data.applicationId,
        comment: data.comment,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        validFrom: new Date(certaasData.validFrom),
        validTo: new Date(certaasData.validTo)
      };
    } else {
      // Manual entry data
      certificateData = {
        ...data,
        isAmexCert: false, // Explicitly set to false for manual entries
        certificateIdentifier: `${data.teamId}-${data.serialNumber}`,
        teamId: data.teamId,
        commonName: data.commonName,
        serialNumber: data.serialNumber,
        serverName: data.serverName,
        keystorePath: data.keystorePath,
        uri: data.uri,
        applicationId: data.applicationId,
        comment: data.comment,
        environment: data.environment || 'E1', // Default to E1 if environment is undefined
        validFrom: data.validFrom || new Date(),
        validTo: data.validTo || new Date(),
        // Required schema fields
        createdBy: 'system',
        certificateStatus: 'active',
        certificatePurpose: 'Manual Entry',
        zeroTouch: false,
        requestId: uuid(),
        requestedByUser: 'system',
        requestedForUser: 'system',
        approvedByUser: 'system',
        hostingTeamName: 'Manual Entry',
        requestChannelName: 'Web Portal',
        taClientName: 'Direct Entry',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    const [certificate] = await db.insert(certificatesTable)
      .values(certificateData)
      .returning();

    revalidatePath(`/teams/${data.teamId}/certificates`);
    return certificate;
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      throw new Error('Certificate with this serial number and common name combination already exists');
    }
    throw new Error(`Certificate onboarding failed: ${error.message}`);
  }
}

export async function getAllCertificates() {
  return db.select().from(certificatesTable).orderBy(sql`${certificatesTable.createdAt} DESC`)
}

export async function getTeamCertificates(teamId: string) {
  return db.select()
    .from(certificatesTable)
    .where(eq(certificatesTable.teamId, teamId))
    .orderBy(sql`${certificatesTable.createdAt} DESC`)
}

export async function getTeamById(teamId: string) {
  const [team] = await db.select()
    .from(teamsTable)
    .where(eq(teamsTable.id, teamId));

  if (!team) return null;

  // Fetch applications for this team
  const teamApplications = await db.select()
    .from(applications)
    .where(eq(applications.teamId, teamId));

  return {
    ...team,
    applications: teamApplications
  };
}

export async function getCertificateById(certId: string) {
  const [cert] = await db.select()
    .from(certificatesTable)
    .where(eq(certificatesTable.id, certId))
    .limit(1);
    
  if (!cert) throw new Error("Certificate not found");
  return cert;
}

// Add to existing actions
export async function getAllTeams() {
  return db.select().from(teamsTable);
}


// Update the template content functions
export async function getAmexCertTemplateContent(teamId: string) {
  const team = await getTeamById(teamId);
  const teamApplications = team?.applications || [];
  
  return [
    '# Valid applications for this team: ' + teamApplications.join(', '),
    'isAmexCert,commonName,serialNumber,serverName,keystorePath,uri,applicationId,comment',
    'true,example.com,123456789,server1,/path/to/keystore,https://example.com,APP123,Optional comment'
  ].join('\n');
}

export async function getNonAmexCertTemplateContent(teamId: string) {
  const team = await getTeamById(teamId);
  const teamApplications = team?.applications || [];
  
  return [
    '# Valid applications for this team: ' + teamApplications.join(', '),
    'isAmexCert,commonName,serialNumber,environment,validFrom,validTo,serverName,keystorePath,uri,applicationId,comment',
    'false,example2.com,987654321,E2,2023-01-01,2024-01-01,server2,/another/path,https://example2.com,APP456,Another comment'
  ].join('\n');
}

// Update the bulkUploadCertificates function to include more validation
export async function bulkUploadCertificates(
  teamId: string, 
  file: File,
  onProgress?: (progress: number) => void
) {
  try {
    const team = await getTeamById(teamId);
    const teamApplications = team?.applications || [];
    const fileContent = await file.text();
    
    let records;
    if (fileContent.trim().startsWith('[') || fileContent.trim().startsWith('{')) {
      try {
        records = JSON.parse(fileContent);
        if (!Array.isArray(records)) records = [records];
      } catch (jsonError) {
        records = parse(fileContent, { columns: true, skip_empty_lines: true });
      }
    } else {
      records = parse(fileContent, { columns: true, skip_empty_lines: true });
    }

    const results = [];
    const totalRecords = records.length;
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      try {
        // Comprehensive validation
        const errors: string[] = [];
        
        // Common validations
        if (!record.commonName?.trim()) errors.push('Common name is required');
        if (!record.serialNumber?.trim()) errors.push('Serial number is required');
        if (!record.serverName?.trim()) errors.push('Server name is required');
        if (!record.keystorePath?.trim()) errors.push('Keystore path is required');
        if (!record.uri?.trim()) errors.push('URI is required');
        if (!record.applicationId?.trim()) errors.push('Application ID is required');
        
        // Application validation
        if (!teamApplications.includes(record.applicationId)) {
          errors.push(`Application ${record.applicationId} not found in team`);
        }

        const isAmexCert = record.isAmexCert === 'true';
        
        if (!isAmexCert) {
          // Non-AMEX specific validations
          if (!record.environment) errors.push('Environment is required for non-AMEX certs');
          if (!record.validFrom) errors.push('Valid from date is required');
          if (!record.validTo) errors.push('Valid to date is required');
          
          // Date validation
          if (record.validFrom && record.validTo) {
            const fromDate = new Date(record.validFrom);
            const toDate = new Date(record.validTo);
            
            if (isNaN(fromDate.getTime())) errors.push('Invalid valid from date format');
            if (isNaN(toDate.getTime())) errors.push('Invalid valid to date format');
            if (fromDate > toDate) errors.push('Valid from date must be before valid to date');
          }
        }

        if (errors.length > 0) {
          throw new Error(errors.join(', '));
        }

        const certificateData = {
          teamId,
          isAmexCert,
          commonName: record.commonName,
          serialNumber: record.serialNumber,
          ...(!isAmexCert && { 
            environment: record.environment as 'E1' | 'E2' | 'E3',
            validFrom: new Date(record.validFrom),
            validTo: new Date(record.validTo)
          }),
          serverName: record.serverName,
          keystorePath: record.keystorePath,
          uri: record.uri,
          applicationId: record.applicationId,
          comment: record.comment || undefined
        };

        const result = await importCertificateFromCertaas(certificateData);
        results.push({ success: true, data: result });
        if (onProgress) onProgress(Math.floor((i / totalRecords) * 100));
      } catch (error: any) {
        results.push({ 
          success: false, 
          data: record,
          error: error.message 
        });
      }
    }

    if (onProgress) onProgress(100);
    revalidatePath(`/teams/${teamId}/certificates`);
    return results;
  } catch (error: any) {
    throw new Error(`Bulk upload failed: ${error.message}`);
  }
}

export async function downloadBulkUploadTemplate() {
  const csvContent = [
    'isAmexCert,commonName,serialNumber,environment,serverName,keystorePath,uri,applicationId,comment',
    'true,example.com,123456789,E1,server1,/path/to/keystore,https://example.com,APP123,Optional comment',
    'false,example2.com,987654321,E2,server2,/another/path,https://example2.com,APP456,Another comment'
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'certificate-bulk-upload-template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


export async function updateCertificate(
  certId: string,
  data: Partial<typeof certificatesTable.$inferInsert>
) {
  try {
    // First get the existing certificate
    const existingCert = await getCertificateById(certId);
    
    // For AMEX certs, prevent editing of certain fields
    if (existingCert.isAmexCert) {
      if (data.validFrom || data.validTo || data.environment) {
        throw new Error('Cannot edit validity dates or environment for AMEX certificates');
      }
    }
    
    // For all certs, prevent editing of commonName and serialNumber
    if (data.commonName || data.serialNumber) {
      throw new Error('Cannot edit common name or serial number');
    }

    // Prepare update data with allowed fields
    const updateData = {
      serverName: data.serverName,
      keystorePath: data.keystorePath,
      uri: data.uri,
      applicationId: data.applicationId,
      comment: data.comment,
      updatedAt: new Date(),
      // Only include these for non-AMEX certs
      ...(!existingCert.isAmexCert && {
        validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
        validTo: data.validTo ? new Date(data.validTo) : undefined,
        environment: data.environment
      })
    };

    const [certificate] = await db.update(certificatesTable)
      .set(updateData)
      .where(eq(certificatesTable.id, certId))
      .returning();

    if (!certificate) {
      throw new Error('Certificate not found');
    }

    revalidatePath('/teams/[teamId]/certificates');
    return certificate;
  } catch (error: any) {
    throw new Error(`Failed to update certificate: ${error.message}`);
  }
}

export async function deleteCertificate(certId: string) {
  try {
    await db.delete(certificatesTable)
      .where(eq(certificatesTable.id, certId));
    
    revalidatePath('/teams/[teamId]/certificates');
    return { success: true };
  } catch (error: any) {
    throw new Error(`Failed to delete certificate: ${error.message}`);
  }
}

// Service ID Actions
export async function getServiceIds(teamId: string) {
  try {
    if (teamId === "all") {
      return db
        .select()
        .from(serviceIdsTable)
        .orderBy(desc(serviceIdsTable.createdAt));
    }
    
    return db
      .select()
      .from(serviceIdsTable)
      .where(eq(serviceIdsTable.renewingTeamId, teamId))
      .orderBy(desc(serviceIdsTable.createdAt));
  } catch (error: any) {
    throw new Error(`Failed to fetch service IDs: ${error.message}`);
  }
}

export async function createServiceId(data: NewServiceId) {
  try {
    const [serviceId] = await db.insert(serviceIdsTable)
      .values({
        ...data,
        id: uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath(`/teams/${data.renewingTeamId}/service-ids`);
    return serviceId;
  } catch (error: any) {
    throw new Error(`Failed to create service ID: ${error.message}`);
  }
}

export async function updateServiceId(id: string, data: Partial<NewServiceId>) {
  try {
    const [serviceId] = await db
      .update(serviceIdsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(serviceIdsTable.id, id))
      .returning();

    return serviceId;
  } catch (error) {
    console.error('Error updating service ID:', error);
    throw new Error('Failed to update service ID');
  }
}

export async function deleteServiceId(id: string) {
  try {
    await db
      .delete(serviceIdsTable)
      .where(eq(serviceIdsTable.id, id));
  } catch (error) {
    console.error('Error deleting service ID:', error);
    throw new Error('Failed to delete service ID');
  }
}

export async function getServiceIdTemplateContent(teamId: string) {
  const team = await getTeamById(teamId)
  const teamApplications = team?.applications || []
  
  return [
    '# Valid applications for this team: ' + teamApplications.join(', '),
    'scid,env,application,expDate,comment',
    'example-scid,E1,APP123,2024-12-31,Optional comment'
  ].join('\n')
}

export async function bulkUploadServiceIds(
  teamId: string,
  file: File,
  onProgress?: (progress: number) => void
) {
  try {
    const team = await getTeamById(teamId)
    const teamApplications = team?.applications || []
    const fileContent = await file.text()
    
    let records
    if (fileContent.trim().startsWith('[') || fileContent.trim().startsWith('{')) {
      try {
        records = JSON.parse(fileContent)
        if (!Array.isArray(records)) records = [records]
      } catch (jsonError) {
        records = parse(fileContent, { columns: true, skip_empty_lines: true })
      }
    } else {
      records = parse(fileContent, { columns: true, skip_empty_lines: true })
    }

    const results = []
    const totalRecords = records.length
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      try {
        // Comprehensive validation
        const errors: string[] = []
        
        // Common validations
        if (!record.svcid?.trim()) errors.push('Service ID is required')
        if (!record.env?.trim()) errors.push('Environment is required')
        if (!record.application?.trim()) errors.push('Application is required')
        if (!record.expDate?.trim()) errors.push('Expiry date is required')
        
        // Application validation
        if (!teamApplications.includes(record.application)) {
          errors.push(`Application ${record.application} not found in team`)
        }

        // Environment validation
        if (!['E1', 'E2', 'E3'].includes(record.env)) {
          errors.push('Environment must be E1, E2, or E3')
        }

        // Date validation
        const expDate = new Date(record.expDate)
        if (isNaN(expDate.getTime())) {
          errors.push('Invalid expiry date format')
        }

        if (errors.length > 0) {
          throw new Error(errors.join(', '))
        }

        const serviceIdData = {
          renewingTeamId: teamId,
          svcid: record.svcid,
          env: record.env,
          application: record.application,
          expDate: expDate.toISOString().split('T')[0],
          comment: record.comment || undefined,
          status: 'Active',
          renewalProcess: 'Manual',
        }

        const result = await createServiceId(serviceIdData)
        results.push({ success: true, data: result })
        if (onProgress) onProgress(Math.floor((i / totalRecords) * 100))
      } catch (error: any) {
        results.push({ 
          success: false, 
          data: record,
          error: error.message 
        })
      }
    }

    if (onProgress) onProgress(100)
    revalidatePath(`/teams/${teamId}/service-ids`)
    return results
  } catch (error: any) {
    throw new Error(`Bulk upload failed: ${error.message}`)
  }
}

export async function deleteApplication(teamId: string, applicationId: string) {
  try {
    await db
      .delete(applications)
      .where(
        and(
          eq(applications.id, applicationId),
          eq(applications.teamId, teamId)
        )
      )

    revalidatePath(`/teams/${teamId}/applications`)
    return { success: true }
  } catch (error) {
    throw new Error("Failed to delete application")
  }
}

export async function createApplication(data: {
  name: string
  carid: string
  tla: string
  tier: string
  engineeringDirector: string
  engineeringVP: string
  productionDirector: string
  productionVP: string
  snowGroup: string
  contactEmail: string
  slack: string
  confluence: string
  description: string
  metadata: Record<string, any>
  teamId: string
  isActive: boolean
}) {
  try {
    const [application] = await db
      .insert(applications)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system", // TODO: Replace with actual user
        updatedBy: "system", // TODO: Replace with actual user
      })
      .returning()

    revalidatePath(`/teams/${data.teamId}/applications`)
    return application
  } catch (error) {
    throw new Error("Failed to create application")
  }
}

export async function updateApplication(
  id: string,
  data: {
    name: string
    carid: string
    tla: string
    tier: string
    engineeringDirector: string
    engineeringVP: string
    productionDirector: string
    productionVP: string
    snowGroup: string
    contactEmail: string
    slack: string
    confluence: string
    description: string
    isActive: boolean
    teamId: string
  }
) {
  try {
    const [result] = await db
      .update(applications)
      .set({
        ...data,
        updatedAt: new Date(),
        updatedBy: "system", // TODO: Replace with actual user
      })
      .where(eq(applications.id, id))
      .returning();

    revalidatePath('/teams/[teamId]/settings', 'page');
    return result;
  } catch (error) {
    console.error("Error updating application:", error);
    throw error;
  }
}

export async function getTeamPlannings(teamId: string) {
  try {
    const plannings = await db.select()
      .from(certificatePlannings)
      .where(eq(certificatePlannings.teamId, teamId))
      .orderBy(sql`${certificatePlannings.plannedDate} ASC`);

    const certificates = await Promise.all(
      plannings.map(async (planning) => {
        const [certificate] = await db.select()
          .from(certificatesTable)
          .where(eq(certificatesTable.id, planning.certificateId));
        return { planning, certificate };
      })
    );

    return certificates;
  } catch (error) {
    console.error("Error fetching team plannings:", error);
    throw new Error("Failed to fetch team plannings");
  }
}

export async function createPlanning(data: {
  teamId: string
  certificateId: string
  plannedDate: Date
  status: string
  notes?: string
  assignedTo: string
}) {
  try {
    const [planning] = await db
      .insert(certificatePlannings)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system", // TODO: Replace with actual user
        updatedBy: "system", // TODO: Replace with actual user
      })
      .returning();

    revalidatePath(`/teams/${data.teamId}/certificates/planning`);
    return planning;
  } catch (error) {
    console.error("Error creating planning:", error);
    throw new Error("Failed to create planning");
  }
}

export async function updatePlanning(planningId: string, data: { status?: string; notes?: string; assignedTo?: string; updatedBy: string }) {
  try {
    await db.update(certificatePlannings)
      .set({
        status: data.status,
        notes: data.notes,
        assignedTo: data.assignedTo,
        updatedAt: new Date(),
        updatedBy: data.updatedBy,
      })
      .where(eq(certificatePlannings.id, planningId));

    revalidatePath("/teams/[teamId]/certificates/planning");
    return { success: true };
  } catch (error) {
    console.error("Error updating planning:", error);
    throw error;
  }
}

export async function deletePlanning(planningId: string) {
  try {
    const [planning] = await db
      .select()
      .from(certificatePlannings)
      .where(eq(certificatePlannings.id, planningId))

    if (!planning) {
      throw new Error('Planning not found')
    }

    const [deleted] = await db
      .delete(certificatePlannings)
      .where(eq(certificatePlannings.id, planningId))
      .returning()

    revalidatePath(`/teams/${planning.teamId}/certificates/planning`)
    return deleted
  } catch (error) {
    console.error('Error deleting planning:', error)
    throw new Error('Failed to delete planning')
  }
}

export async function getTeamReportStats(teamId: string, dateRange?: { from: Date; to: Date }) {
  try {
    const [certificates, serviceIdsList] = await Promise.all([
      db.select()
        .from(certificatesTable)
        .where(eq(certificatesTable.teamId, teamId)),
      db.select()
        .from(serviceIdsTable)
        .where(eq(serviceIdsTable.renewingTeamId, teamId))
    ]);

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiringSoonCerts = certificates.filter(cert => {
      const validTo = new Date(cert.validTo);
      return validTo > now && validTo <= thirtyDaysFromNow;
    });

    const expiringSoonServiceIds = serviceIdsList.filter(sid => {
      const expDate = new Date(sid.expDate);
      return expDate > now && expDate <= thirtyDaysFromNow;
    });

    // Calculate status distribution
    const statusDistribution = certificates.reduce((acc, cert) => {
      const validTo = new Date(cert.validTo);
      const daysRemaining = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let status;
      if (daysRemaining < 0) status = "Expired";
      else if (daysRemaining <= 90) status = "Expiring Soon";
      else status = "Valid";

      const existingStatus = acc.find(s => s.name === status);
      if (existingStatus) {
        existingStatus.value++;
      } else {
        acc.push({ name: status, value: 1 });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

    // Calculate environment distribution
    const environmentDistribution = certificates.reduce((acc, cert) => {
      const env = cert.environment;
      const existingEnv = acc.find(e => e.name === env);
      if (existingEnv) {
        existingEnv.value++;
      } else {
        acc.push({ name: env, value: 1 });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

    return {
      totalCertificates: certificates.length,
      expiringSoon: expiringSoonCerts.length,
      totalServiceIds: serviceIdsList.length,
      expiringServiceIds: expiringSoonServiceIds.length,
      statusDistribution,
      environmentDistribution
    };
  } catch (error) {
    console.error("Error fetching team report stats:", error);
    throw new Error("Failed to fetch team report stats");
  }
}

export async function getCertificateOverviewData(teamId: string, dateRange?: { from: Date; to: Date }) {
  try {
    const certificates = await db.select()
      .from(certificatesTable)
      .where(eq(certificatesTable.teamId, teamId));

    const serviceIds = await db.select()
      .from(serviceIdsTable)
      .where(eq(serviceIdsTable.renewingTeamId, teamId));

    const now = new Date();
    const next12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now);
      date.setMonth(now.getMonth() + i);
      return format(date, 'MMM yyyy');
    });

    // Initialize monthly data with all 12 months
    const monthlyData = next12Months.map(month => ({
      month,
      certificates: 0,
      serviceIds: 0,
      total: 0
    }));

    // Count certificates expiring in each month
    certificates.forEach(cert => {
      const validTo = new Date(cert.validTo);
      if (validTo >= now) {
        const month = format(validTo, 'MMM yyyy');
        const monthData = monthlyData.find(data => data.month === month);
        if (monthData) {
          monthData.certificates++;
          monthData.total++;
        }
      }
    });

    // Count service IDs expiring in each month
    serviceIds.forEach(svc => {
      const expDate = new Date(svc.expDate);
      if (expDate >= now) {
        const month = format(expDate, 'MMM yyyy');
        const monthData = monthlyData.find(data => data.month === month);
        if (monthData) {
          monthData.serviceIds++;
          monthData.total++;
        }
      }
    });

    return monthlyData;
  } catch (error) {
    console.error("Error fetching certificate overview data:", error);
    throw new Error("Failed to fetch certificate overview data");
  }
}

export async function getRecentTeamActivity(teamId: string) {
  try {
    const [certificates, serviceIdsList] = await Promise.all([
      db.select()
        .from(certificatesTable)
        .where(eq(certificatesTable.teamId, teamId))
        .orderBy(desc(certificatesTable.updatedAt))
        .limit(5),
      db.select()
        .from(serviceIdsTable)
        .where(eq(serviceIdsTable.renewingTeamId, teamId))
        .orderBy(desc(serviceIdsTable.updatedAt))
        .limit(5)
    ]);

    const activities = [
      ...certificates.map(cert => ({
        id: cert.id,
        type: 'certificate' as const,
        name: cert.commonName,
        action: new Date(cert.validTo) < new Date() ? 'expired' : 'updated',
        timestamp: cert.updatedAt
      })),
      ...serviceIdsList.map(sid => ({
        id: sid.id,
        type: 'serviceId' as const,
        name: sid.svcid,
        action: new Date(sid.expDate) < new Date() ? 'expired' : 'updated',
        timestamp: sid.updatedAt || new Date()
      }))
    ];

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 10);
  } catch (error) {
    console.error("Error fetching recent team activity:", error);
    throw new Error("Failed to fetch recent team activity");
  }
}
