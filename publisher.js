const amqp = require('amqplib');

async function publishMessage() {
  try { 
    // Connect to RabbitMQ (adjust URL if necessary)
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // Define an exchange and a routing key for notifications
    const exchangeName = 'notifications_exchange';
    const routingKey = 'notification.new';

    // Declare a durable exchange (using 'direct' type for simplicity)
    await channel.assertExchange(exchangeName, 'direct', { durable: true });

    // Define a sample message, e.g., a notification payload
    const message = {
      id: Date.now(),
      text: 'This is a test notification',
      timestamp: new Date().toISOString()
    };

    // Publish the message to the exchange with the routing key
    channel.publish(
      exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    console.log("Message published:", message);

    // Close the connection shortly after publishing
    setTimeout(() => {
      channel.close();
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Error publishing message:", error);
  }
}

publishMessage();
