const { Kafka } = require('kafkajs');

const kafka = new Kafka({ brokers: ['kafka:9092'] });
const admin = kafka.admin();

async function createTopicsIfNotExists(topicsToCreate) {
  try {
    await admin.connect();

    // List existing topics
    const existingTopics = await admin.listTopics();

    // Filter out the topics that already exist
    const topicsToActuallyCreate = topicsToCreate.filter(topic => !existingTopics.includes(topic.topic));

    if (topicsToActuallyCreate.length > 0) {
      // Create topics that don't exist
      await admin.createTopics({
        topics: topicsToActuallyCreate,
      });
      console.log(`Created topics: ${topicsToActuallyCreate.map(t => t.topic).join(', ')}`);
    } else {
      console.log('All topics already exist.');
    }
  } catch (error) {
    console.error('Error creating topics:', error);
  } finally {
    await admin.disconnect();
  }
}

// Define the topics to create
const topics = [
  { topic: 'match-events', numPartitions: 3, replicationFactor: 1 },
  { topic: 'cancel-match-events', numPartitions: 3, replicationFactor: 1 },
  { topic: 'match-found-events', numPartitions: 3, replicationFactor: 1 },
  { topic: 'dequeue-events', numPartitions: 3, replicationFactor: 1 }
];

// Create the topics if they do not exist
createTopicsIfNotExists(topics);
