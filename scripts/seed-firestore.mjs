import { seedDatabase } from '../src/lib/seedData.js';

console.log('🌱 Starting Firestore seeding with initial demo data...');
try {
  const result = await seedDatabase();
  console.log(`✅ Firestore seeding completed! Inserted/Updated ${result.seededCount} documents.`);
  process.exit(0);
} catch (error) {
  console.error('❌ Firestore seeding error:', error);
  process.exit(1);
}
