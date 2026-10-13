import fs from 'fs';
import path from 'path';

if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const { seedDatabase } = await import('../src/lib/seedData.js');
const { firebaseConfig } = await import('../src/lib/firebase.js');

console.log(`🌱 Starting Firestore seeding to target project: [${firebaseConfig.projectId}] ...`);
try {
  const result = await seedDatabase();
  console.log(`✅ Firestore seeding completed! Inserted/Updated ${result.seededCount} documents.`);
  process.exit(0);
} catch (error) {
  console.error('❌ Firestore seeding error:', error);
  process.exit(1);
}
