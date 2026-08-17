import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Room } from './src/models/room.model';

dotenv.config();

const rooms = [
  { name: 'Conference Room 1', type: 'Team / Conference', capacity: 10, status: 'Available' },
  { name: 'Conference Room 2', type: 'Team / Conference', capacity: 20, status: 'Available' },
  { name: 'Client Meeting Room', type: 'Client', capacity: 6, status: 'Available' },
  { name: 'Small Meeting Room', type: 'General', capacity: 4, status: 'Available' }
];

async function seedRooms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/empora');
    
    // Check if rooms already exist to avoid duplicates
    const count = await Room.countDocuments();
    if (count === 0) {
      await Room.insertMany(rooms);
      console.log('Rooms seeded successfully!');
    } else {
      console.log('Rooms already exist in DB.');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error seeding rooms:', error);
    process.exit(1);
  }
}

seedRooms();
