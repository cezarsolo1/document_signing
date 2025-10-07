// api/webhook-handler.ts
import { NextRequest, NextResponse } from 'next/server';
import { createBoldSignRequest } from '../../../lib/boldsign';

export const runtime = 'edge'; // hint to deploy on the edge

interface SigningRequest {
  patient: { name: string; email: string };
  treatments: string;
  documents: string; // comma-separated
  language: string;
  deadline: string;
}

interface WebhookPayload {
  signingRequests: SigningRequest[];
}

interface DocumentRecord {
  document_type: string;
  patient_name: string;
  patient_email: string;
  operation_name: string;
  due_date: string;
  language: string;
}

export async function POST(request: NextRequest) {
  try {
    // Step 1: Parse webhook
    const payload = (await request.json()) as WebhookPayload;
    if (!payload?.signingRequests?.length) {
      return NextResponse.json({ error: 'signingRequests[] required' }, { status: 400 });
    }

    // Step 2–4: loop patients, split documents, build records
    const documentRecords: DocumentRecord[] = [];
    for (const sr of payload.signingRequests) {
      const patientData = {
        patient_name: sr.patient?.name ?? '',
        patient_email: sr.patient?.email ?? '',
        operation_name: sr.treatments ?? '',
        due_date: sr.deadline ?? '',
        language: sr.language ?? '',
      };

      const docs = (sr.documents ?? '')
        .split(',')
        .map(d => d.trim())
        .filter(Boolean);

      for (const document_type of docs) {
        documentRecords.push({ document_type, ...patientData });
      }
    }

    // Step 5: BoldSign calls
    const results = [];
    for (const rec of documentRecords) {
      try {
        const res = await createBoldSignRequest(rec);
        results.push({ success: true, record: rec, requestId: res.requestId });
      } catch (e: any) {
        results.push({ success: false, record: rec, error: e?.message ?? String(e) });
      }
    }

    return NextResponse.json({ success: true, processed: documentRecords.length, results });
  } catch (e: any) {
    return NextResponse.json({ error: 'Processing failed', details: e?.message ?? String(e) }, { status: 500 });
  }
}
