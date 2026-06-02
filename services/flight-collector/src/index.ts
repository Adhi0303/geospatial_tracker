import axios from 'axios';
import { DataBus } from '@worldwideview/databus';
import * as dotenv from 'dotenv';

dotenv.config();

const POLLING_INTERVAL = 60000; // Increased to 60s to avoid 429 Too Many Requests

// Default bounding box (Europe: lomin, lamin, lomax, lamax)
let currentBbox = {
  lomin: -10,
  lamin: 35,
  lomax: 30,
  lamax: 60
};

const OPENSKY_URL = 'https://opensky-network.org/api/states/all';

async function fetchFlights() {
  try {
    const auth = process.env.OPENSKY_USERNAME ? {
      username: process.env.OPENSKY_USERNAME,
      password: process.env.OPENSKY_PASSWORD || ''
    } : undefined;

    const response = await axios.get(OPENSKY_URL, {
      params: currentBbox,
      auth
    });

    if (response.data && response.data.states) {
      // OpenSky returns an array of arrays. We map it to a readable object.
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
        velocity: state[9], // m/s
        heading: state[10], // degrees
        vertical_rate: state[11], // m/s
      }));

      console.log(`[Flight Collector] Fetched ${flights.length} flights.`);
      
      // Publish to DataBus
      DataBus.publish('flights', flights);
    }
  } catch (error: any) {
    console.error('[Flight Collector] Error fetching flights:', error.message);
  }
}

// Start polling loop
console.log('✈️ Starting Flight Collector service...');
fetchFlights();
setInterval(fetchFlights, POLLING_INTERVAL);
