import { seedDatabase } from '../src/lib/seedData.js';
import { firebaseConfig } from '../src/lib/firebase.js';

console.log(`🌱 Starting Firestore seeding to target project: [${firebaseConfig.projectId}] ...`);
try {
  const result = await seedDatabase();
  console.log(`✅ Firestore seeding completed! Inserted/Updated ${result.seededCount} documents.`);
  process.exit(0);
} catch (error) {
  console.error('❌ Firestore seeding error:', error);
  process.exit(1);
}
