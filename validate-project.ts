// validate-project.ts
// Quick validation script to check project structure and configuration

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const results: ValidationResult[] = [];

function checkFile(filePath: string, description: string): boolean {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  
  results.push({
    name: description,
    status: exists ? 'pass' : 'fail',
    message: exists ? `✅ ${filePath}` : `❌ Missing: ${filePath}`
  });
  
  return exists;
}

function checkFileContent(filePath: string, searchString: string, description: string): boolean {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    results.push({
      name: description,
      status: 'fail',
      message: `❌ File not found: ${filePath}`
    });
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  const found = content.includes(searchString);
  
  results.push({
    name: description,
    status: found ? 'pass' : 'warning',
    message: found ? `✅ ${description}` : `⚠️  ${description} - not found`
  });
  
  return found;
}

function printResults() {
  console.log('\n🔍 Project Validation Results\n');
  console.log('='.repeat(70));
  
  const grouped = {
    'Core Files': [] as ValidationResult[],
    'API Implementation': [] as ValidationResult[],
    'Configuration': [] as ValidationResult[],
    'Documentation': [] as ValidationResult[],
  };
  
  // Group results
  results.forEach((result, index) => {
    if (index < 3) grouped['Core Files'].push(result);
    else if (index < 8) grouped['API Implementation'].push(result);
    else if (index < 11) grouped['Configuration'].push(result);
    else grouped['Documentation'].push(result);
  });
  
  // Print grouped results
  for (const [group, items] of Object.entries(grouped)) {
    console.log(`\n${group}:`);
    items.forEach(item => console.log(`  ${item.message}`));
  }
  
  // Summary
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  
  console.log('\n' + '='.repeat(70));
  console.log(`\n📊 Summary: ${passed} passed, ${failed} failed, ${warnings} warnings\n`);
  
  if (failed === 0) {
    console.log('✅ Project structure is valid!\n');
  } else {
    console.log('❌ Project has missing files. Please check the errors above.\n');
    process.exit(1);
  }
}

// Run validations
console.log('🔍 Validating project structure...\n');

// Core files
checkFile('package.json', 'Package configuration');
checkFile('test-payload.json', 'Test payload');
checkFile('.env.example', 'Environment template');

// API implementation
checkFile('api/webhook-handler.ts', 'Next.js API handler');
checkFile('lib/boldsign.ts', 'BoldSign client library');
checkFile('workers/webhook-handler.ts', 'Cloudflare Workers handler');

// Check for key code patterns
checkFileContent('api/webhook-handler.ts', 'export const runtime = \'edge\'', 'Edge runtime configured');
checkFileContent('lib/boldsign.ts', 'BOLDSIGN_API_KEY', 'BoldSign API key handling');

// Configuration
checkFile('wrangler.toml', 'Cloudflare Workers config');
checkFileContent('package.json', 'next', 'Next.js dependency');
checkFileContent('.env.example', 'BOLDSIGN_API_KEY', 'API key in env template');

// Documentation
checkFile('README.md', 'Project README');
checkFile('TEST_RESULTS.md', 'Test results documentation');

// Additional checks
console.log('\n📋 Additional Checks:');

// Check if test-payload has valid structure
try {
  const testPayload = JSON.parse(fs.readFileSync('test-payload.json', 'utf-8'));
  if (testPayload.signingRequests && Array.isArray(testPayload.signingRequests)) {
    console.log('  ✅ Test payload has valid structure');
    results.push({ name: 'Test payload structure', status: 'pass', message: '✅ Valid JSON structure' });
  } else {
    console.log('  ⚠️  Test payload missing signingRequests array');
    results.push({ name: 'Test payload structure', status: 'warning', message: '⚠️  Missing signingRequests' });
  }
} catch (e) {
  console.log('  ❌ Test payload is not valid JSON');
  results.push({ name: 'Test payload structure', status: 'fail', message: '❌ Invalid JSON' });
}

// Check TypeScript files for syntax errors (basic check)
const tsFiles = [
  'api/webhook-handler.ts',
  'lib/boldsign.ts',
  'workers/webhook-handler.ts'
];

let syntaxErrors = 0;
for (const file of tsFiles) {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    // Basic syntax checks
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      console.log(`  ⚠️  ${file} may have unmatched braces`);
      syntaxErrors++;
    }
  } catch (e) {
    // File doesn't exist, already reported
  }
}

if (syntaxErrors === 0) {
  console.log('  ✅ No obvious syntax errors detected');
}

printResults();

// Print next steps
console.log('📝 Next Steps:\n');
console.log('  1. Set BOLDSIGN_API_KEY in your environment');
console.log('  2. Run tests: npx tsx test-workflow.ts');
console.log('  3. Deploy to Vercel or Cloudflare Workers');
console.log('  4. Test with real webhook data\n');
