const amqp = require('amqplib');

async function consumeMessages() {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // Exchange, queue, and routing key must match the publisher's values
    const exchangeName = 'notifications_exchange';
    const queueName = 'notifications_queue';
    const routingKey = 'notification.new';

    // Ensure the exchange exists
    await channel.assertExchange(exchangeName, 'direct', { durable: true });
    
    // Create a durable queue and bind it to the exchange using the routing key
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchangeName, routingKey);

    console.log("Waiting for messages in queue:", queueName);

    // Consume messages from the queue
    channel.consume(queueName, (msg) => {
      if (msg !== null) {
        const messageContent = msg.content.toString();
        const message = JSON.parse(messageContent);
        console.log("Received message:", message);

        // Acknowledge receipt after processing
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Error consuming messages:", error);
  }
}

consumeMessages();
