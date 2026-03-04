import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Theater from '../models/Theater.js';

dotenv.config();

const sampleTheaters = [
  {
    name: 'PVR Cinemas - Phoenix Mall',
    location: {
      address: 'Phoenix Palladium, Lower Parel',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400013',
      coordinates: { lat: 19.0176, lng: 72.8562 }
    },
    screens: [
      {
        screenNumber: 1,
        screenName: 'IMAX Screen',
        totalSeats: 120,
        seatLayout: { rows: 10, columns: 12 },
        seatTypes: [
          { type: 'VIP', rows: ['A', 'B'], basePrice: 500 },
          { type: 'Premium', rows: ['C', 'D', 'E', 'F'], basePrice: 350 },
          { type: 'Economy', rows: ['G', 'H', 'I', 'J'], basePrice: 250 }
        ]
      },
      {
        screenNumber: 2,
        screenName: 'Dolby Atmos',
        totalSeats: 100,
        seatLayout: { rows: 10, columns: 10 },
        seatTypes: [
          { type: 'Premium', rows: ['A', 'B', 'C', 'D', 'E'], basePrice: 300 },
          { type: 'Economy', rows: ['F', 'G', 'H', 'I', 'J'], basePrice: 200 }
        ]
      },
      {
        screenNumber: 3,
        screenName: 'Standard Screen',
        totalSeats: 80,
        seatLayout: { rows: 8, columns: 10 },
        seatTypes: [
          { type: 'Economy', rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], basePrice: 180 }
        ]
      }
    ],
    facilities: ['IMAX', 'Dolby Atmos', 'Parking', 'Food Court', 'Wheelchair Access'],
    isActive: true
  },
  {
    name: 'INOX - Riverside Mall',
    location: {
      address: 'Riverside Mall, Panvel',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      pincode: '410206',
      coordinates: { lat: 19.0330, lng: 73.1197 }
    },
    screens: [
      {
        screenNumber: 1,
        screenName: '4DX Experience',
        totalSeats: 90,
        seatLayout: { rows: 9, columns: 10 },
        seatTypes: [
          { type: 'VIP', rows: ['A', 'B', 'C'], basePrice: 600 },
          { type: 'Premium', rows: ['D', 'E', 'F'], basePrice: 400 },
          { type: 'Economy', rows: ['G', 'H', 'I'], basePrice: 280 }
        ]
      },
      {
        screenNumber: 2,
        screenName: 'Regular Screen',
        totalSeats: 100,
        seatLayout: { rows: 10, columns: 10 },
        seatTypes: [
          { type: 'Premium', rows: ['A', 'B', 'C', 'D'], basePrice: 250 },
          { type: 'Economy', rows: ['E', 'F', 'G', 'H', 'I', 'J'], basePrice: 180 }
        ]
      }
    ],
    facilities: ['4DX', 'Parking', 'Food Court'],
    isActive: true
  },
  {
    name: 'Cinepolis - Nexus Mall',
    location: {
      address: 'Nexus Seawoods, Seawoods',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      pincode: '400706',
      coordinates: { lat: 19.0270, lng: 73.0297 }
    },
    screens: [
      {
        screenNumber: 1,
        screenName: 'Premium Large',
        totalSeats: 150,
        seatLayout: { rows: 15, columns: 10 },
        seatTypes: [
          { type: 'VIP', rows: ['A', 'B', 'C'], basePrice: 450 },
          { type: 'Premium', rows: ['D', 'E', 'F', 'G', 'H', 'I'], basePrice: 300 },
          { type: 'Economy', rows: ['J', 'K', 'L', 'M', 'N', 'O'], basePrice: 220 }
        ]
      }
    ],
    facilities: ['Dolby Atmos', 'Parking', 'Food Court', 'Wheelchair Access'],
    isActive: true
  }
];

const seedTheater = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        //clear existing theaters
        await Theater.deleteMany({});
        console.log('Cleared existing theaters');

        //insert sample theaters
      const theaters=await Theater.insertMany(sampleTheaters);
       console.log(` Added ${theaters.length} theaters`);

        console.log('\n Theater Added:');
        sampleTheaters.forEach(t => {
            console.log(` -${t.name} (${t.screens.length} screens)`);
            t.screens.forEach(s => {
        console.log(`    • Screen ${s.screenNumber}: ${s.totalSeats} seats (${s.seatLayout.rows}x${s.seatLayout.columns})`);
      });
    });
        process.exit(0);
    } catch (error) {
        console.error(' Error seeding theaters:', error);
        process.exit(1);
    }
};

seedTheater();
