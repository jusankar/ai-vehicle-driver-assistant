import fs from 'fs';
import path from 'path';
import { flutterProjectFiles } from './src/flutterCode.ts';

const outputDir = path.join(process.cwd(), 'flutter_app');

console.log('🚀 Exporting Flutter Mobile App files to:', outputDir);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let fileCount = 0;

for (const file of flutterProjectFiles) {
  const filePath = path.join(outputDir, file.path);
  const dirName = path.dirname(filePath);

  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
  }

  fs.writeFileSync(filePath, file.content, 'utf8');
  fileCount++;
  console.log(`  ✓ Written: ${file.path}`);
}

console.log(`\n✅ Success! Created ${fileCount} files in directory: ${outputDir}`);
console.log(`\nNext Steps for Flutter in Cursor:`);
console.log(` 1. cd flutter_app`);
console.log(` 2. flutter pub get`);
console.log(` 3. flutter build apk --release`);
