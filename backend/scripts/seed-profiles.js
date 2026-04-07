import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../src/models/userModel.js';
import { Profile } from '../src/models/profileModel.js';
import { Trip } from '../src/models/tripModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// ── 20 Dummy Users ──────────────────────────────────────────────
const dummyUsers = [
  
  { name: 'Priya Patel',     email: 'priya.patel@example.com'     },
  { name: 'Rohan Mehta',     email: 'rohan.mehta@example.com'     },
  { name: 'Sneha Gupta',     email: 'sneha.gupta@example.com'     },
  { name: 'Vikram Singh',    email: 'vikram.singh@example.com'    },
  { name: 'Ananya Reddy',    email: 'ananya.reddy@example.com'    },
  { name: 'Karan Joshi',     email: 'karan.joshi@example.com'     },
  { name: 'Meera Nair',      email: 'meera.nair@example.com'      },
  { name: 'Arjun Kumar',     email: 'arjun.kumar@example.com'     },
  { name: 'Ishita Desai',    email: 'ishita.desai@example.com'    },
  { name: 'Rahul Verma',     email: 'rahul.verma@example.com'     },
  { name: 'Kavya Iyer',      email: 'kavya.iyer@example.com'      },
  { name: 'Siddharth Rao',   email: 'siddharth.rao@example.com'   },
  { name: 'Nisha Agarwal',   email: 'nisha.agarwal@example.com'   },
  { name: 'Aditya Pillai',   email: 'aditya.pillai@example.com'   },
  { name: 'Pooja Choudhury', email: 'pooja.choudhury@example.com' },
  { name: 'Manish Tiwari',   email: 'manish.tiwari@example.com'   },
  { name: 'Divya Saxena',    email: 'divya.saxena@example.com'    },
  { name: 'Nikhil Bhat',     email: 'nikhil.bhat@example.com'     },
  { name: 'Riya Kapoor',     email: 'riya.kapoor@example.com'     },
];

// ── Profile extras ──────────────────────────────────────────────
const bios = [
  
  'Foodie traveler who lives for street food adventures.',
  'Solo backpacker documenting every sunrise.',
  'Mountain lover, always chasing the next peak.',
  'Digital nomad working from beaches around the world.',
  'Cultural enthusiast & history geek.',
  'Weekend trekker and wildlife photographer.',
  'Road-trip junkie with a playlist for every highway.',
  'Yoga retreat seeker and wellness explorer.',
  'Travel blogger with 50+ countries visited.',
  'Scuba diver exploring underwater worlds.',
  'Architecture nerd who loves city walks.',
  'Budget traveler who makes every rupee count.',
  'Adventure sports addict – skydiving, bungee, rafting!',
  'Luxury traveler with a taste for fine dining.',
  'Camping under the stars is my therapy.',
  'Festival hopper – Holi, Tomatina, Carnival!',
  'Train journey enthusiast, loves slow travel.',
  'Wildlife safari lover and birdwatcher.',
  'Travel photographer chasing golden hours.',
];

const genders = ['male', 'female', 'non_binary'];
const languagePool = ['English', 'Hindi', 'Tamil', 'Bengali', 'Marathi', 'Telugu', 'Kannada', 'French', 'Spanish', 'German'];
const interestPool = ['Trekking', 'Photography', 'Food', 'Culture', 'Adventure', 'Beaches', 'Mountains', 'Wildlife', 'History', 'Nightlife', 'Yoga', 'Camping', 'Scuba', 'Cycling', 'Road Trips'];

const pick = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// ── Trips data ──────────────────────────────────────────────────
const tripTemplates = [
 
  { title: 'Goa Beach Hopping',         destination: 'Goa',                       description: 'Explore hidden beaches, shacks, and the vibrant nightlife of Goa.' },
  { title: 'Rajasthan Heritage Tour',   destination: 'Jaipur, Rajasthan',         description: 'Walk through majestic forts and taste authentic Rajasthani cuisine.' },
  { title: 'Kerala Backwaters Cruise',  destination: 'Alleppey, Kerala',          description: 'Serene houseboat cruise through the enchanting Kerala backwaters.' },
  { title: 'Ladakh Bike Expedition',    destination: 'Leh, Ladakh',               description: 'Ride through the highest motorable passes in the world.' },
  { title: 'Rishikesh Adventure Camp',  destination: 'Rishikesh, Uttarakhand',    description: 'White-water rafting, bungee jumping, and riverside camping.' },
  { title: 'Meghalaya Cave Exploration',destination: 'Cherrapunji, Meghalaya',    description: 'Discover living root bridges and massive limestone caves.' },
  { title: 'Andaman Island Escape',     destination: 'Port Blair, Andaman',       description: 'Snorkeling, scuba diving, and pristine white-sand beaches.' },
];

// ── Seed function ───────────────────────────────────────────────
const seed = async () => {
  try {
    const DB = process.env.MONGO_URI;
    if (!DB) {
      console.error('❌ MONGO_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(DB);
    console.log('✅ DB connected');

    // Remove previous seed data (only example.com emails)
    const existingUsers = await User.find({ email: /@example\.com$/ });
    const existingIds = existingUsers.map((u) => u._id);
    if (existingIds.length) {
      await Profile.deleteMany({ user: { $in: existingIds } });
      await Trip.deleteMany({ creator: { $in: existingIds } });
      await User.deleteMany({ _id: { $in: existingIds } });
      console.log(`🧹 Cleaned ${existingIds.length} previous seed users`);
    }

    const createdUserIds = [];

    for (let i = 0; i < dummyUsers.length; i++) {
      const { name, email } = dummyUsers[i];

      // Create user (password will be auto-hashed by the pre-save hook)
      const user = await User.create({
        name,
        email,
        password: 'Test@1234',
        role: 'user',
        isVerified: true,
      });

      // Create matching profile
      await Profile.create({
        user: user._id,
        displayName: name,
        bio: bios[i],
        gender: genders[i % genders.length],
        dateOfBirth: randomDate(new Date(1990, 0, 1), new Date(2002, 11, 31)),
        languages: pick(languagePool, 2 + Math.floor(Math.random() * 3)),
        interests: pick(interestPool, 3 + Math.floor(Math.random() * 4)),
        emergencyContacts: [
          {
            name: `Emergency Contact of ${name}`,
            phone: `+91 98765${String(i).padStart(5, '0')}`,
            relationship: 'Friend',
            isPrimary: true,
          },
        ],
      });

      createdUserIds.push(user._id);
      console.log(`  👤 ${i + 1}. ${name} (${user.role})`);
    }

    // Create trips assigned to random users
    for (let t = 0; t < tripTemplates.length; t++) {
      const tmpl = tripTemplates[t];
      const creatorId = createdUserIds[t % createdUserIds.length];

      const start = randomDate(new Date(2026, 4, 1), new Date(2026, 8, 30));
      const end = new Date(start.getTime() + (3 + Math.floor(Math.random() * 7)) * 86400000);

      await Trip.create({
        creator: creatorId,
        title: tmpl.title,
        description: tmpl.description,
        destination: tmpl.destination,
        startDate: start,
        endDate: end,
        budgetMin: 5000 + Math.floor(Math.random() * 10000),
        budgetMax: 20000 + Math.floor(Math.random() * 30000),
        maxParticipants: 4 + Math.floor(Math.random() * 8),
        visibility: 'public',
        status: 'active',
        interests: pick(interestPool, 2),
      });

      console.log(`  🗺️  Trip: ${tmpl.title}`);
    }

    console.log('\n🎉 Seeding complete!');
    console.log(`   • ${dummyUsers.length} users + profiles created`);
    console.log(`   • ${tripTemplates.length} trips created`);
    console.log('\n📧 All dummy users share password: Test@1234');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('💥 Seed error:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();
