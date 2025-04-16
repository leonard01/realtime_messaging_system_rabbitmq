// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const amqp = require('amqplib');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the "public" directory
app.use(express.static('public'));

// Connect to RabbitMQ and consume messages
async function startRabbitMQConsumer() {
  try {
    // Connect to the local RabbitMQ server
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    // Define exchange, queue, and routing key (must match publisher settings)
    const exchangeName = 'notifications_exchange';
    const queueName = 'notifications_queue';
    const routingKey = 'notification.new';
    
    // Declare a durable exchange and queue, then bind them
    await channel.assertExchange(exchangeName, 'direct', { durable: true });
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchangeName, routingKey);
    
    console.log("RabbitMQ consumer is ready and waiting for messages...");

    // Consume messages from the queue and broadcast via Socket.IO
    channel.consume(queueName, (msg) => {
      if (msg !== null) {
        const message = JSON.parse(msg.content.toString());
        console.log("Received message from RabbitMQ:", message);
        
        // Emit the message to all connected clients
        io.emit('notification', message);
        
        // Acknowledge the message
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Error setting up RabbitMQ consumer:", error);
  }
}

// Start the RabbitMQ consumer
startRabbitMQConsumer();

// Setup Socket.IO connection events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the HTTP server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
