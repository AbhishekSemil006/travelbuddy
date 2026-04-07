import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/userModel.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const promoteUser = async (email) => {
  try {
    const DB = process.env.MONGO_URI;
    if (!DB) {
      console.error('❌ MONGO_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(DB);
    console.log('✅ DB connection successful!');

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
    } else {
      console.log(`🚀 User ${email} has been promoted to admin!`);
      console.log('User details:', {
        id: user._id,
        email: user.email,
        role: user.role,
      });
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('💥 Error promoting user:', err.message);
    process.exit(1);
  }
};

const email = process.argv[2];
if (!email) {
  console.log('Usage: node scripts/promote-admin.js <abhisheksemil700@gmail.com>');
  process.exit(1);
}

promoteUser(email);
