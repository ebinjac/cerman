import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { serialNumber, commonName } = await request.json();
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Scenario 1: Certificate not found
  if (serialNumber === 'notfound') {
    return NextResponse.json(
      { error: 'Certificate not found' },
      { status: 404 }
    );
  }

  // Scenario 2: Certificate expired
  if (serialNumber === 'expired') {
    return NextResponse.json([{
      certificateIdentifier: `expired_cert_${commonName.replace(/\./g, '_')}`,
      commonName,
      serialNumber,
      certificateStatus: 'Expired',
      validFrom: new Date(Date.now() - 365 * 86400000).toISOString(),
      validTo: new Date(Date.now() - 30 * 86400000).toISOString(),
      environment: 'E1',
      certificatePurpose: 'Internal TLS',
      issuerCertAuthName: 'Certaas CA',
      zeroTouch: false,
      requestId: 'RITM1000001',
      requestedByUser: 'user1@aexp.com',
      requestedForUser: 'recipient1@aexp.com',
      approvedByUser: 'admin1@aexp.com',
      hostingTeamName: 'TechCare',
      requestChannelName: 'BlueCerts',
      taClientName: 'SNW',
      applicationId: 'APP-20000001',
      revokeRequestId: null,
      revokeDate: null
    }]);
  }

  // Scenario 3: Certificate expiring soon (less than 30 days)
  if (serialNumber === 'expiring') {
    return NextResponse.json([{
      certificateIdentifier: `expiring_cert_${commonName.replace(/\./g, '_')}`,
      commonName,
      serialNumber,
      certificateStatus: 'Active',
      validFrom: new Date(Date.now() - 30 * 86400000).toISOString(),
      validTo: new Date(Date.now() + 15 * 86400000).toISOString(), // Expires in 15 days
      environment: 'E2',
      certificatePurpose: 'External API',
      issuerCertAuthName: 'GlobalSign',
      zeroTouch: true,
      requestId: 'RITM1000002',
      requestedByUser: 'user2@aexp.com',
      requestedForUser: 'recipient2@aexp.com',
      approvedByUser: 'admin2@aexp.com',
      hostingTeamName: 'SecurityTeam',
      requestChannelName: 'ServiceNow',
      taClientName: 'TAM',
      applicationId: 'APP-20000002',
      revokeRequestId: null,
      revokeDate: null
    }]);
  }

  // Scenario 4: Valid certificate
  if (serialNumber === 'valid') {
    return NextResponse.json([{
      certificateIdentifier: `valid_cert_${commonName.replace(/\./g, '_')}`,
      commonName,
      serialNumber,
      certificateStatus: 'Active',
      validFrom: new Date(Date.now() - 30 * 86400000).toISOString(),
      validTo: new Date(Date.now() + 365 * 86400000).toISOString(),
      environment: 'E3',
      certificatePurpose: 'Database Encryption',
      issuerCertAuthName: 'DigiCert',
      zeroTouch: false,
      requestId: 'RITM1000003',
      requestedByUser: 'user3@aexp.com',
      requestedForUser: 'recipient3@aexp.com',
      approvedByUser: 'admin3@aexp.com',
      hostingTeamName: 'NetworkOps',
      requestChannelName: 'Manual Entry',
      taClientName: 'ClientPortal',
      applicationId: 'APP-20000003',
      revokeRequestId: null,
      revokeDate: null
    }]);
  }

  // Default scenario: Return multiple mock certificates
  const mockCerts = Array.from({ length: 5 }, (_, i) => {
    const certNumber = i + 1;
    const environments = ['E1', 'E2', 'E3', 'PROD', 'STAGE'];
    const statuses = ['Issued', 'Expired', 'Revoked', 'Pending'];
    const teams = ['TechCare', 'SecurityTeam', 'NetworkOps', 'CloudTeam'];
    
    return {
      certificateIdentifier: `mock_cert_${certNumber}_${commonName.replace(/\./g, '_')}`,
      commonName: `${commonName}-${certNumber}.aexp.com`,
      serialNumber: `${serialNumber}`,
      certificateStatus: statuses[certNumber % statuses.length],
      certificatePurpose: ['Internal TLS', 'External API', 'Database Encryption', 'Mobile App'][certNumber % 4],
      validFrom: new Date(Date.now() - (certNumber * 86400000)).toISOString(),
      validTo: new Date(Date.now() + (certNumber * 86400000 * 365)).toISOString(),
      environment: environments[certNumber % environments.length],
      issuerCertAuthName: ['Certaas CA', 'GlobalSign', 'DigiCert'][certNumber % 3],
      zeroTouch: certNumber % 4 === 0,
      requestId: `RITM${1000000 + certNumber}`,
      requestedByUser: `user${certNumber}@aexp.com`,
      requestedForUser: `recipient${certNumber}@aexp.com`,
      approvedByUser: `admin${certNumber}@aexp.com`,
      hostingTeamName: teams[certNumber % teams.length],
      requestChannelName: ['BlueCerts', 'ServiceNow', 'Manual Entry'][certNumber % 3],
      taClientName: ['SNW', 'TAM', 'ClientPortal'][certNumber % 3],
      applicationId: `APP-${20000000 + certNumber}`,
      revokeRequestId: certNumber % 5 === 0 ? `REVOKE-${certNumber}` : null,
      revokeDate: certNumber % 5 === 0 ? new Date().toISOString() : null
    };
  });

  return NextResponse.json(mockCerts);
}