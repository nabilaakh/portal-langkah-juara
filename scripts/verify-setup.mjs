import fs from 'fs';
import path from 'path';

const root = process.cwd();

console.log('Testing Task 1: Next.js & Tailwind setup verification...');

// 1. Check package.json
const pkgPath = path.join(root, 'package.json');
if (!fs.existsSync(pkgPath)) {
  console.error('FAIL: package.json does not exist');
  process.exit(1);
}
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const requiredDeps = ['next', 'react', 'react-dom', 'tailwindcss', 'lucide-react', 'firebase'];
for (const dep of requiredDeps) {
  if (!pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]) {
    console.error(`FAIL: Missing dependency: ${dep}`);
    process.exit(1);
  }
}

// 2. Check tailwind.config.js
const tailwindPath = path.join(root, 'tailwind.config.js');
if (!fs.existsSync(tailwindPath)) {
  console.error('FAIL: tailwind.config.js does not exist');
  process.exit(1);
}
const tailwindContent = fs.readFileSync(tailwindPath, 'utf8');
const requiredTokens = ['#EA580C', '#F7F5F2', '#1F2937', '#5A6B78', '#F59E0B', '#15A66A', '#E53935', '#6B7280'];
for (const token of requiredTokens) {
  if (!tailwindContent.includes(token)) {
    console.error(`FAIL: Missing color token in tailwind.config.js: ${token}`);
    process.exit(1);
  }
}

// 3. Check App router files
const requiredFiles = [
  'src/app/layout.jsx',
  'src/app/page.jsx',
  'src/app/globals.css',
  'src/app/not-found.jsx'
];
for (const file of requiredFiles) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: Missing file: ${file}`);
    process.exit(1);
  }
}

console.log('PASS: Task 1 verification test passed successfully!');
