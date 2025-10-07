// supabase/functions/webhook-handler/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface SigningRequest {
  patient: { name: string; email: string }
  treatments: string
  documents: string // comma-separated
  language: string
  deadline: string
}

interface WebhookPayload {
  signingRequests: SigningRequest[]
}

interface DocumentRecord {
  document_type: string
  patient_name: string
  patient_email: string
  operation_name: string
  due_date: string
  language: string
}

interface BoldSignResponse {
  requestId?: string
  [k: string]: any
}

// BoldSign API client
async function createBoldSignRequest(
  record: DocumentRecord,
  apiKey: string
): Promise<BoldSignResponse> {
  const payload = {
    templateId: record.document_type,
    title: `${record.document_type} for ${record.patient_name}`,
    message: '',
    expiryDays: 60,
    enableAutoReminder: true,
    reminderDays: 7,
    reminderCount: 3,
    isSandbox: true, // Change to false for production

    signers: [
      {
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
      },
    ],
    cc: [],
    brandId: null,
    useTextTags: false,
    hideDocumentId: false,
  }

  const resp = await fetch('https://api.boldsign.com/v1/template/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify(payload),
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`BoldSign API error: ${resp.status} - ${text}`)
  }

  const result = await resp.json()
  return { requestId: result.requestId || result.id, ...result }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Get BoldSign API key from environment
    const apiKey = Deno.env.get('BOLDSIGN_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'BoldSign API key not configured' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Step 1: Parse webhook
    const payload = (await req.json()) as WebhookPayload
    if (!payload?.signingRequests?.length) {
      return new Response(
        JSON.stringify({ error: 'signingRequests[] required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Step 2-4: loop patients, split documents, build records
    const documentRecords: DocumentRecord[] = []
    for (const sr of payload.signingRequests) {
      const patientData = {
        patient_name: sr.patient?.name ?? '',
        patient_email: sr.patient?.email ?? '',
        operation_name: sr.treatments ?? '',
        due_date: sr.deadline ?? '',
        language: sr.language ?? '',
      }

      const docs = (sr.documents ?? '')
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean)

      for (const document_type of docs) {
        documentRecords.push({ document_type, ...patientData })
      }
    }

    // Step 5: BoldSign calls
    const results = []
    for (const rec of documentRecords) {
      try {
        const res = await createBoldSignRequest(rec, apiKey)
        results.push({ success: true, record: rec, requestId: res.requestId })
      } catch (e: any) {
        results.push({ success: false, record: rec, error: e?.message ?? String(e) })
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: documentRecords.length, results }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: 'Processing failed', details: e?.message ?? String(e) }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
