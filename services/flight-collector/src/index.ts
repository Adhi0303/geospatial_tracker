import axios from 'axios';
import { DataBus } from '@worldwideview/databus';
import * as dotenv from 'dotenv';

dotenv.config();

const POLLING_INTERVAL = 60000; // 60s

// Default bounding box (Europe: lomin, lamin, lomax, lamax)
let currentBbox = {
  lomin: -10,
  lamin: 35,
  lomax: 30,
  lamax: 60
};

const OPENSKY_URL = 'https://opensky-network.org/api/states/all';

let currentInterval = POLLING_INTERVAL;

async function fetchFlights() {
  try {
    const auth = process.env.OPENSKY_CLIENT_ID ? {
      username: process.env.OPENSKY_CLIENT_ID,
      password: process.env.OPENSKY_CLIENT_SECRET || ''
    } : undefined;

    const response = await axios.get(OPENSKY_URL, {
      params: currentBbox,
      auth
    });

    if (response.data && response.data.states) {
      const flights = response.data.states.map((state: any) => ({
        id: state[0],
        callsign: state[1] ? state[1].trim() : '',
        country: state[2],
        time_position: state[3],
        last_contact: state[4],
        longitude: state[5],
        latitude: state[6],
        baro_altitude: state[7],
        on_ground: state[8],
        velocity: state[9],
        heading: state[10],
        vertical_rate: state[11],
      }));

      console.log(`[Flight Collector] Fetched ${flights.length} flights.`);
      DataBus.publish('flights', flights);
      
      // Reset interval on success
      if (currentInterval !== POLLING_INTERVAL) {
        currentInterval = POLLING_INTERVAL;
      }
    }
  } catch (error: any) {
    console.error('[Flight Collector] Error fetching flights:', error.message);
    if (error.response && error.response.status === 429) {
      console.warn('[Flight Collector] Rate limit hit. OpenSky might have temporarily blocked your IP. Falling back to Mock Data...');
      
      // Generate 150 mock flights over Europe to unblock UI development
      const mockFlights = Array.from({ length: 150 }).map((_, i) => ({
        id: `mock-${i}`,
        callsign: `MOCK${i}`,
        country: 'Mock Country',
        time_position: Math.floor(Date.now() / 1000),
        last_contact: Math.floor(Date.now() / 1000),
        longitude: -10 + Math.random() * 40, // Europe long
        latitude: 35 + Math.random() * 25, // Europe lat
        baro_altitude: 5000 + Math.random() * 5000,
        on_ground: false,
        velocity: 200 + Math.random() * 50,
        heading: Math.random() * 360,
        vertical_rate: 0,
      }));
      
      DataBus.publish('flights', mockFlights);
      
      // Keep polling every 20s to feed mock data
      currentInterval = POLLING_INTERVAL; 
    }
  }
  
  setTimeout(fetchFlights, currentInterval);
}

// Start polling loop
console.log('✈️ Starting Flight Collector service...');
fetchFlights();
