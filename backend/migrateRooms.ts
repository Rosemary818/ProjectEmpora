import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Room } from './src/models/room.model';

dotenv.config();

async function migrateRooms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/empora');
    
    const result = await Room.updateMany(
      { status: 'Available' as any },
      { $set: { status: 'Active' as any } }
    );
    
    console.log(`Migration successful. Modified ${result.modifiedCount} rooms.`);
    process.exit(0);
  } catch (error) {
    console.error('Error migrating rooms:', error);
    process.exit(1);
  }
}

migrateRooms();
