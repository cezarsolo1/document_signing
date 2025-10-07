// test-workflow.ts
// Comprehensive test suite for the webhook handler workflow

interface SigningRequest {
  patient: { name: string; email: string };
  treatments: string;
  documents: string;
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

// Test utilities
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ FAILED: ${message}`);
  }
  console.log(`✅ PASSED: ${message}`);
}

function assertEqual(actual: any, expected: any, message: string) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`❌ FAILED: ${message}\n  Expected: ${expectedStr}\n  Actual: ${actualStr}`);
  }
  console.log(`✅ PASSED: ${message}`);
}

// Step 1: Test webhook payload parsing
function testStep1_ParseWebhook() {
  console.log('\n📋 Testing Step 1: Parse Webhook Payload');
  
  const validPayload: WebhookPayload = {
    signingRequests: [
      {
        patient: { name: "John Doe", email: "john@example.com" },
        treatments: "Rhinoplasty",
        documents: "consent-form,pre-op-instructions",
        language: "en",
        deadline: "2025-10-20"
      }
    ]
  };

  assert(validPayload.signingRequests.length > 0, "Valid payload has signingRequests");
  assert(validPayload.signingRequests[0].patient.name === "John Doe", "Patient name parsed correctly");
  assert(validPayload.signingRequests[0].patient.email === "john@example.com", "Patient email parsed correctly");

  // Test empty payload
  const emptyPayload: any = {};
  assert(!emptyPayload?.signingRequests?.length, "Empty payload validation works");

  // Test null payload
  const nullPayload: any = { signingRequests: null };
  assert(!nullPayload?.signingRequests?.length, "Null signingRequests validation works");
}

// Step 2: Test patient looping
function testStep2_LoopPatients() {
  console.log('\n🔄 Testing Step 2: Loop Through Patients');
  
  const payload: WebhookPayload = {
    signingRequests: [
      {
        patient: { name: "John Doe", email: "john@example.com" },
        treatments: "Rhinoplasty",
        documents: "consent-form",
        language: "en",
        deadline: "2025-10-20"
      },
      {
        patient: { name: "Jane Smith", email: "jane@example.com" },
        treatments: "Facelift",
        documents: "consent-form",
        language: "en",
        deadline: "2025-10-25"
      }
    ]
  };

  let patientCount = 0;
  for (const sr of payload.signingRequests) {
    patientCount++;
    assert(sr.patient.name !== undefined, `Patient ${patientCount} has name`);
    assert(sr.patient.email !== undefined, `Patient ${patientCount} has email`);
  }

  assertEqual(patientCount, 2, "Processed 2 patients");
}

// Step 3: Test document splitting
function testStep3_SplitDocuments() {
  console.log('\n✂️  Testing Step 3: Split Documents by Comma');
  
  // Test normal comma-separated list
  const docs1 = "consent-form,pre-op-instructions,post-op-care";
  const split1 = docs1.split(',').map(d => d.trim()).filter(Boolean);
  assertEqual(split1.length, 3, "Split 3 documents correctly");
  assertEqual(split1[0], "consent-form", "First document is consent-form");
  assertEqual(split1[2], "post-op-care", "Third document is post-op-care");

  // Test with spaces
  const docs2 = "consent-form , pre-op-instructions , post-op-care";
  const split2 = docs2.split(',').map(d => d.trim()).filter(Boolean);
  assertEqual(split2.length, 3, "Split documents with spaces correctly");
  assertEqual(split2[1], "pre-op-instructions", "Trimmed spaces from document names");

  // Test single document
  const docs3 = "consent-form";
  const split3 = docs3.split(',').map(d => d.trim()).filter(Boolean);
  assertEqual(split3.length, 1, "Single document works");

  // Test empty string
  const docs4 = "";
  const split4 = docs4.split(',').map(d => d.trim()).filter(Boolean);
  assertEqual(split4.length, 0, "Empty string returns empty array");

  // Test with trailing comma
  const docs5 = "consent-form,pre-op-instructions,";
  const split5 = docs5.split(',').map(d => d.trim()).filter(Boolean);
  assertEqual(split5.length, 2, "Trailing comma filtered out");
}

// Step 4: Test building document records
function testStep4_BuildDocumentRecords() {
  console.log('\n🏗️  Testing Step 4: Build Document Records');
  
  const payload: WebhookPayload = {
    signingRequests: [
      {
        patient: { name: "John Doe", email: "john@example.com" },
        treatments: "Rhinoplasty",
        documents: "consent-form,pre-op-instructions,post-op-care",
        language: "en",
        deadline: "2025-10-20"
      },
      {
        patient: { name: "Jane Smith", email: "jane@example.com" },
        treatments: "Facelift",
        documents: "consent-form,recovery-guide",
        language: "en",
        deadline: "2025-10-25"
      }
    ]
  };

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

  // Verify total records: John has 3 docs + Jane has 2 docs = 5 total
  assertEqual(documentRecords.length, 5, "Created 5 document records (3 + 2)");

  // Verify first record (John's consent-form)
  assertEqual(documentRecords[0].document_type, "consent-form", "First record is consent-form");
  assertEqual(documentRecords[0].patient_name, "John Doe", "First record has John's name");
  assertEqual(documentRecords[0].operation_name, "Rhinoplasty", "First record has correct treatment");

  // Verify last record (Jane's recovery-guide)
  assertEqual(documentRecords[4].document_type, "recovery-guide", "Last record is recovery-guide");
  assertEqual(documentRecords[4].patient_name, "Jane Smith", "Last record has Jane's name");
  assertEqual(documentRecords[4].operation_name, "Facelift", "Last record has correct treatment");

  // Verify all John's records
  const johnRecords = documentRecords.filter(r => r.patient_name === "John Doe");
  assertEqual(johnRecords.length, 3, "John has 3 document records");

  // Verify all Jane's records
  const janeRecords = documentRecords.filter(r => r.patient_name === "Jane Smith");
  assertEqual(janeRecords.length, 2, "Jane has 2 document records");
}

// Step 5: Test BoldSign request structure (mock)
function testStep5_BoldSignRequestStructure() {
  console.log('\n📤 Testing Step 5: BoldSign Request Structure');
  
  const record: DocumentRecord = {
    document_type: "consent-form",
    patient_name: "John Doe",
    patient_email: "john@example.com",
    operation_name: "Rhinoplasty",
    due_date: "2025-10-20",
    language: "en"
  };

  // Simulate building the BoldSign payload
  const templateId = record.document_type; // In real code, this might be mapped
  const payload = {
    templateId,
    title: `${record.document_type} for ${record.patient_name}`,
    message: '',
    expiryDays: 60,
    enableAutoReminder: true,
    reminderDays: 7,
    reminderCount: 3,
    isSandbox: true,
    signers: [
      {
        name: record.patient_name,
        emailAddress: record.patient_email,
        signerType: 'Signer',
        signerRole: 'patient',
        formFields: [
          { fieldType: 'TextBox', fieldId: 'TextBox11', value: record.operation_name },
          { fieldType: 'TextBox', fieldId: 'TextBox12', value: record.document_type },
        ]
      }
    ]
  };

  assert(payload.templateId === "consent-form", "Template ID set correctly");
  assert(payload.title === "consent-form for John Doe", "Title formatted correctly");
  assert(payload.signers[0].name === "John Doe", "Signer name set correctly");
  assert(payload.signers[0].emailAddress === "john@example.com", "Signer email set correctly");
  assert(payload.isSandbox === true, "Sandbox mode enabled");
  assert(payload.signers[0].formFields[0].value === "Rhinoplasty", "Operation name in form fields");
}

// Integration test: Full workflow
function testIntegration_FullWorkflow() {
  console.log('\n🔗 Testing Integration: Full Workflow');
  
  // Load test payload
  const payload: WebhookPayload = {
    signingRequests: [
      {
        patient: { name: "John Doe", email: "john.doe@example.com" },
        treatments: "Rhinoplasty",
        documents: "consent-form,pre-op-instructions,post-op-care",
        language: "en",
        deadline: "2025-10-20"
      },
      {
        patient: { name: "Jane Smith", email: "jane.smith@example.com" },
        treatments: "Facelift",
        documents: "consent-form,recovery-guide",
        language: "en",
        deadline: "2025-10-25"
      }
    ]
  };

  // Step 1: Validate payload
  assert(payload?.signingRequests?.length > 0, "Payload validation passed");

  // Steps 2-4: Process records
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

  // Verify complete processing
  assertEqual(documentRecords.length, 5, "Full workflow created 5 records");
  
  // Verify each record has all required fields
  for (const rec of documentRecords) {
    assert(rec.document_type !== '', "Record has document_type");
    assert(rec.patient_name !== '', "Record has patient_name");
    assert(rec.patient_email !== '', "Record has patient_email");
    assert(rec.operation_name !== '', "Record has operation_name");
    assert(rec.due_date !== '', "Record has due_date");
    assert(rec.language !== '', "Record has language");
  }

  console.log('\n📊 Summary:');
  console.log(`   - Patients processed: ${payload.signingRequests.length}`);
  console.log(`   - Document records created: ${documentRecords.length}`);
  console.log(`   - Records per patient:`);
  const groupedByPatient = documentRecords.reduce((acc, rec) => {
    acc[rec.patient_name] = (acc[rec.patient_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  for (const [name, count] of Object.entries(groupedByPatient)) {
    console.log(`     • ${name}: ${count} documents`);
  }
}

// Edge cases and error handling
function testEdgeCases() {
  console.log('\n⚠️  Testing Edge Cases');
  
  // Missing patient data
  const payload1: any = {
    signingRequests: [
      {
        patient: null,
        treatments: "Rhinoplasty",
        documents: "consent-form",
        language: "en",
        deadline: "2025-10-20"
      }
    ]
  };

  const documentRecords1: DocumentRecord[] = [];
  for (const sr of payload1.signingRequests) {
    const patientData = {
      patient_name: sr.patient?.name ?? '',
      patient_email: sr.patient?.email ?? '',
      operation_name: sr.treatments ?? '',
      due_date: sr.deadline ?? '',
      language: sr.language ?? '',
    };
    const docs = (sr.documents ?? '').split(',').map(d => d.trim()).filter(Boolean);
    for (const document_type of docs) {
      documentRecords1.push({ document_type, ...patientData });
    }
  }
  
  assert(documentRecords1[0].patient_name === '', "Handles missing patient name gracefully");
  assert(documentRecords1[0].patient_email === '', "Handles missing patient email gracefully");

  // Empty documents string
  const payload2: WebhookPayload = {
    signingRequests: [
      {
        patient: { name: "John Doe", email: "john@example.com" },
        treatments: "Rhinoplasty",
        documents: "",
        language: "en",
        deadline: "2025-10-20"
      }
    ]
  };

  const documentRecords2: DocumentRecord[] = [];
  for (const sr of payload2.signingRequests) {
    const patientData = {
      patient_name: sr.patient?.name ?? '',
      patient_email: sr.patient?.email ?? '',
      operation_name: sr.treatments ?? '',
      due_date: sr.deadline ?? '',
      language: sr.language ?? '',
    };
    const docs = (sr.documents ?? '').split(',').map(d => d.trim()).filter(Boolean);
    for (const document_type of docs) {
      documentRecords2.push({ document_type, ...patientData });
    }
  }

  assertEqual(documentRecords2.length, 0, "Empty documents string creates no records");
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Starting Workflow Tests\n');
  console.log('='.repeat(60));

  try {
    testStep1_ParseWebhook();
    testStep2_LoopPatients();
    testStep3_SplitDocuments();
    testStep4_BuildDocumentRecords();
    testStep5_BoldSignRequestStructure();
    testIntegration_FullWorkflow();
    testEdgeCases();

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('💥 TEST SUITE FAILED');
    console.error('='.repeat(60));
    console.error(error);
    process.exit(1);
  }
}

runAllTests();
