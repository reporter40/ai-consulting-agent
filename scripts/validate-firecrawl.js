const fs = require('fs');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node validate-firecrawl.js <path-to-json>');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const checks = [
  { field: 'branding.colors', test: () => data.branding?.colors?.length > 0 },
  { field: 'branding.typography', test: () => data.branding?.typography != null },
  { field: 'rawHtml', test: () => data.rawHtml?.length > 500 },
];

const failures = checks.filter(c => !c.test());
if (failures.length > 0) {
  console.error('VALIDATION FAILED:', failures.map(f => f.field));
  process.exit(1);
}
console.log('Firecrawl data validated successfully');
