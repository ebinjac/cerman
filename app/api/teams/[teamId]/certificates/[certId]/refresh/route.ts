import { NextResponse } from 'next/server';

import { revalidatePath } from 'next/cache';
import { getCertificateById } from '@/src/app/actions';
import { updateCertificate } from '@/src/app/actions';

export async function POST(
  request: Request,
  { params }: { params: { teamId: string; certId: string } }
) {
  try {
    const { teamId, certId } = params;
    const certificate = await getCertificateById(certId);

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    if (!certificate.isAmexCert) {
      return NextResponse.json(
        { error: 'Only AMEX certificates can be refreshed' },
        { status: 400 }
      );
    }

    // Call CertaaS API to get fresh certificate data
    const certaasResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/certaas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serialNumber: certificate.serialNumber,
        commonName: certificate.commonName
      })
    });

    if (!certaasResponse.ok) {
      throw new Error('Failed to fetch certificate from CertaaS');
    }

    const certaasData = await certaasResponse.json();
    if (!certaasData.length) {
      throw new Error('Certificate not found in CertaaS');
    }

    // Update certificate with fresh data from CertaaS
    const refreshedCert = {
      ...certificate,
      ...certaasData[0],
      updatedAt: new Date()
    };

    // Persist the updated certificate
    await updateCertificate(certId, refreshedCert);

    revalidatePath(`/teams/${teamId}/certificates`);
    
    return NextResponse.json(refreshedCert);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Refresh failed' },
      { status: 500 }
    );
  }
}