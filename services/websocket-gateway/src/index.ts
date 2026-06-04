import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { DataBus } from '@worldwideview/databus';

const app = express();
app.use(express.json({ limit: '50mb' }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // For development. Update for production.
    methods: ['GET', 'POST']
  }
});

// Internal IPC endpoint for collectors to publish data
app.post('/internal/publish', (req, res) => {
  const { channel, payload } = req.body;
  if (channel && payload) {
    io.emit(channel, payload);
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3001;

io.on('connection', (socket) => {
  console.log(`[WebSocket] Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`[WebSocket] Client disconnected: ${socket.id}`);
  });
});

// Subscribe to DataBus channels and broadcast to clients
DataBus.subscribe('flights').subscribe((event) => {
  // Broadcast to all connected clients
  io.emit('flights', event.payload);
});

DataBus.subscribe('ships').subscribe((event) => {
  io.emit('ships', event.payload);
});

httpServer.listen(PORT, () => {
  console.log(`🚀 WebSocket Gateway running on port ${PORT}`);
});
