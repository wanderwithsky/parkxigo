import mongoose from 'mongoose';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

async function updateUserRoles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/parking-app');
    console.log('Connected to MongoDB');

    // Update all users that don't have a role
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user', isAdmin: false } }
    );

    console.log(`Updated ${result.modifiedCount} users with default role`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error updating user roles:', error);
    process.exit(1);
  }
}

// Run the migration
updateUserRoles(); 