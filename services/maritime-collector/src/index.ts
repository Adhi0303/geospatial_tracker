import WebSocket from 'ws';
import { DataBus } from '@worldwideview/databus';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.AISSTREAM_API_KEY;

if (!API_KEY || API_KEY === 'your_api_key_here') {
  console.warn('⚠️  [Maritime Collector] AISSTREAM_API_KEY is not set or is invalid. Maritime collector will not start.');
  console.warn('⚠️  Please get a free API key at https://aisstream.io and set it in services/maritime-collector/.env');
} else {
  console.log('🚢 Starting Maritime Collector service...');
  
  const socket = new WebSocket('wss://stream.aisstream.io/v0/stream');

  socket.on('open', () => {
    console.log('[Maritime Collector] Connected to AISStream.');
    
    // Subscribe to a bounding box (Europe: [[LatSW, LonSW], [LatNE, LonNE]])
    const subscriptionMessage = {
      APIKey: API_KEY,
      BoundingBoxes: [[[35, -10], [60, 30]]], // Europe
      FilterMessageTypes: ["PositionReport"]
    };
    
    socket.send(JSON.stringify(subscriptionMessage));
  });

  const shipBatch = new Map<string, any>();

  setInterval(() => {
    if (shipBatch.size > 0) {
      const ships = Array.from(shipBatch.values());
      console.log(`[Maritime Collector] Publishing batch of ${ships.length} ships.`);
      DataBus.publish('ships', ships);
      shipBatch.clear();
    }
  }, 60000);

  socket.on('message', (data: WebSocket.RawData) => {
    try {
      const parsedMessage = JSON.parse(data.toString());
      
      if (parsedMessage.MessageType === "PositionReport") {
        const report = parsedMessage.Message.PositionReport;
        
        const ship = {
          id: String(report.UserID), // MMSI
          latitude: report.Latitude,
          longitude: report.Longitude,
          speed: report.Sog, // Speed over ground
          heading: report.TrueHeading,
          navStatus: report.NavigationalStatus
        };

        // Accumulate in batch
        shipBatch.set(ship.id, ship);
      }
    } catch (err) {
      console.error('[Maritime Collector] Parse error:', err);
    }
  });

  socket.on('error', (err) => {
    console.error('[Maritime Collector] WebSocket Error:', err.message);
  });

  socket.on('close', () => {
    console.log('[Maritime Collector] WebSocket Closed. Attempting to reconnect in 5s...');
    // Simple reconnect could be implemented here
  });
}
