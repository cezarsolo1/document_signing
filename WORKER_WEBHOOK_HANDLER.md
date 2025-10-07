# `workers/webhook-handler.ts`

```ts
// workers/webhook-handler.ts
export interface Env {
  BOLDSIGN_API_KEY: string;
}

interface SigningRequest {
  patient: { name: string; email: string };
  treatments: string;
  documents: string;
  language: string;
  deadline: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    try {
      const payload = (await request.json()) as { signingRequests: SigningRequest[] };
      if (!payload?.signingRequests?.length) {
        return Response.json({ error: 'signingRequests[] required' }, { status: 400 });
      }

      const records: any[] = [];
      for (const sr of payload.signingRequests) {
        const base = {
          patient_name: sr.patient?.name ?? '',
          patient_email: sr.patient?.email ?? '',
          operation_name: sr.treatments ?? '',
          due_date: sr.deadline ?? '',
          language: sr.language ?? '',
        };
        const docs = (sr.documents ?? '').split(',').map(d => d.trim()).filter(Boolean);
        for (const document_type of docs) records.push({ document_type, ...base });
      }

      const results: any[] = [];
      for (const rec of records) {
        try {
          const res = await createBoldSignRequest(rec, env.BOLDSIGN_API_KEY);
          results.push({ success: true, record: rec, requestId: res.requestId });
        } catch (e: any) {
          results.push({ success: false, record: rec, error: e?.message ?? String(e) });
        }
      }

      return Response.json({ success: true, processed: records.length, results });
    } catch (e: any) {
      return Response.json({ error: 'Processing failed', details: e?.message ?? String(e) }, { status: 500 });
    }
  }
};

async function createBoldSignRequest(record: any, apiKey: string) {
  const resp = await fetch('https://api.boldsign.com/v1/template/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      templateId: record.document_type,
      title: `${record.document_type} for ${record.patient_name}`,
      message: '',
      expiryDays: 60,
      enableAutoReminder: true,
      reminderDays: 7,
      reminderCount: 3,
      isSandbox: true,
      signers: [{
        name: record.patient_name,
        emailAddress: record.patient_email,
        signerType: 'Signer',
        signerRole: 'patient',
        formFields: [
          { fieldType: 'TextBox', fieldId: 'TextBox11', value: record.operation_name },
          { fieldType: 'TextBox', fieldId: 'TextBox12', value: record.document_type },
          { fieldType: 'Dropdown', fieldId: 'Dropdown1', value: 'Noselift' },
          { fieldType: 'TextBox', fieldId: 'TextBox25', value: '/' },
          { fieldType: 'CheckBox', fieldId: 'CheckBox1', isChecked: false },
          { fieldType: 'CheckBox', fieldId: 'CheckBox2', isChecked: false },
          { fieldType: 'CheckBox', fieldId: 'CheckBox3', isChecked: false },
          { fieldType: 'CheckBox', fieldId: 'CheckBox4', isChecked: false },
          { fieldType: 'CheckBox', fieldId: 'CheckBox5', isChecked: false },
          { fieldType: 'CheckBox', fieldId: 'CheckBox6', isChecked: false },
        ],
      }],
      cc: [],
    }),
  });

  if (!resp.ok) throw new Error(`BoldSign API error: ${resp.status}`);
  const result = await resp.json();
  return { requestId: result.requestId || result.id, ...result };
}

```