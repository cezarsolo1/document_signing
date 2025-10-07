// lib/boldsign.ts
export interface BoldSignRequest {
  document_type: string;     // used as templateId
  patient_name: string;
  patient_email: string;
  operation_name: string;
  due_date: string;
  language: string;
}

export interface BoldSignResponse {
  requestId?: string;
  [k: string]: any;
}

// map document names to template IDs if your input isn't already an ID
const TEMPLATE_MAP: Record<string, string> = {
  // "consent-form": "tmpl_123",
  // "pre-op-instructions": "tmpl_456",
};

const API_URL = process.env.BOLDSIGN_API_URL || 'https://api.boldsign.com/v1/template/send';

export async function createBoldSignRequest(record: BoldSignRequest): Promise<BoldSignResponse> {
  const apiKey = process.env.BOLDSIGN_API_KEY;
  if (!apiKey) throw new Error('BoldSign API key not configured');

  const templateId = TEMPLATE_MAP[record.document_type] ?? record.document_type;

  const payload = {
    templateId,
    title: `${record.document_type} for ${record.patient_name}`,
    message: '',
    expiryDays: 60,
    enableAutoReminder: true,
    reminderDays: 7,
    reminderCount: 3,
    isSandbox: true, // flip to false in production

    signers: [
      {
        name: record.patient_name,
        emailAddress: record.patient_email,
        signerType: 'Signer',
        signerRole: 'patient',
        formFields: [
          { fieldType: 'TextBox',  fieldId: 'TextBox11', value: record.operation_name },
          { fieldType: 'TextBox',  fieldId: 'TextBox12', value: record.document_type },
          { fieldType: 'Dropdown', fieldId: 'Dropdown1', value: 'Noselift' },
          { fieldType: 'TextBox',  fieldId: 'TextBox25', value: '/' },
          { fieldType: 'CheckBox', fieldId: 'CheckBox1', isChecked: false },
          { fieldType: 'CheckBox', fieldId: 'CheckBox2', isChecked: false },
          { fieldType: 'CheckBox', fieldId: 'CheckBox3', isChecked: false },
          { fieldType: 'CheckBox', fieldId: 'CheckBox4', isChecked: false },
          { fieldType: 'CheckBox', fieldId: 'CheckBox5', isChecked: false },
          { fieldType: 'CheckBox', fieldId: 'CheckBox6', isChecked: false },
        ],
      },
    ],
    cc: [],
    brandId: null,
    useTextTags: false,
    hideDocumentId: false,
  };

  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`BoldSign API error: ${resp.status} - ${text}`);
  }

  const result = await resp.json();
  return { requestId: result.requestId || result.id, ...result };
}
