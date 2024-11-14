import express from "express";
import { Kafka } from "kafkajs";
import cors from "cors";

const app = express();

const kafka = new Kafka({ brokers: ["kafka:9092"], retry: { retries: 5 } });
const kafkaProducer = kafka.producer();
const kafkaConsumer = kafka.consumer({ groupId: "matcher-service" });
const dequeueConsumer = kafka.consumer({ groupId: "matcher-service-dequeue" }); // New consumer for dequeue-events

app.use(express.json());
app.use(cors());

interface MatchRequestData {
  userID: string;
  topic: string;
  difficulty: string;
}

// Use a Map to store a queue per topic
const matchRequestsByTopic: Map<string, MatchRequestData[]> = new Map();

// Helper function to print the current state of topic queues
const printTopicQueues = () => {
  console.log("Current match requests by topic:");
  for (const [topic, queue] of matchRequestsByTopic.entries()) {
    console.log(`Topic: ${topic}, Queue Length: ${queue.length}`);
    queue.forEach((request) => {
      console.log(
        `  - userID: ${request.userID}, difficulty: ${request.difficulty}`
      );
    });
  }
  console.log("------------------------------------------------");
};

// Start the Kafka Consumer, listen to match events.
(async () => {
  await kafkaConsumer.connect();
  await kafkaConsumer.subscribe({
    topic: "match-events",
    fromBeginning: false,
  });

  await kafkaConsumer.run({
    eachMessage: async ({ message }) => {
      const matchRequestData: MatchRequestData = message.value
        ? JSON.parse(message.value.toString())
        : {};
      console.log(
        `Received match request: ${JSON.stringify(matchRequestData)}`
      );

      const { topic } = matchRequestData;

      // Add the match request to the appropriate queue for the topic
      if (!matchRequestsByTopic.has(topic)) {
        matchRequestsByTopic.set(topic, []); // Create a queue for the topic if not exists
      }
      matchRequestsByTopic.get(topic)?.push(matchRequestData); // Push the request to the topic queue

      // Print the current state of the topic queues
      printTopicQueues();
    },
  });
})();

// Listen to dequeue events
(async () => {
  await dequeueConsumer.connect();
  await dequeueConsumer.subscribe({
    topic: "dequeue-events",
    fromBeginning: false,
  });

  await dequeueConsumer.run({
    eachMessage: async ({ message }) => {
      const { userID, topic } = message.value
        ? JSON.parse(message.value.toString())
        : {};
      console.log(
        `Received dequeue event for userID: ${userID} and topic: ${topic}`
      );

      // Remove the user's match request from the topic-specific queue
      if (matchRequestsByTopic.has(topic)) {
        matchRequestsByTopic.set(
          topic,
          matchRequestsByTopic
            .get(topic)
            ?.filter((request) => request.userID !== userID) || []
        );
        console.log(
          `User ${userID} removed from match queue for topic: ${topic}.`
        );

        // Print the current state of the topic queues
        printTopicQueues();
      }
    },
  });
})();

const isValidDifficultyPair = (difficultyA: string, difficultyB: string) => {
  if (difficultyA === "Hard" && difficultyB === "Easy") {
    return false;
  } else if (difficultyA === "Easy" && difficultyB === "Hard") {
    return false;
  }
  return true;
};

// Continuous function to periodically run the matching algorithm per topic
const runMatchingAlgorithm = async () => {
  setInterval(async () => {
    for (const [topic, queue] of matchRequestsByTopic.entries()) {
      let i = 0; // Start from the first request

      // Loop through the queue to find matches
      while (i < queue.length - 1) {
        const matchReqDataA = queue[i];
        let matchFound = false;

        // Try to find a match for matchReqDataA with every subsequent request
        for (let j = i + 1; j < queue.length; j++) {
          const matchReqDataB = queue[j];

          // Ensure both requests are valid, have the same difficulty, and have different userIDs
          if (
            matchReqDataA &&
            matchReqDataB &&
            isValidDifficultyPair(
              matchReqDataA.difficulty,
              matchReqDataB.difficulty
            ) &&
            matchReqDataA.userID !== matchReqDataB.userID
          ) {
            // Match found, remove both from the queue
            queue.splice(j, 1); // Remove matchReqDataB (adjust index first)
            queue.splice(i, 1); // Remove matchReqDataA

            const matchResult = {
              userA: matchReqDataA.userID,
              userADifficulty: matchReqDataA.difficulty,
              userB: matchReqDataB.userID,
              userBDifficulty: matchReqDataB.difficulty,
              topic: matchReqDataA.topic,
              difficulty: matchReqDataA.difficulty,
            };

            console.log(
              `Match found in topic '${topic}' with difficulty '${
                matchReqDataA.difficulty
              }': ${JSON.stringify(matchResult)}`
            );

            // Produce a `match-found-event`
            await kafkaProducer.send({
              topic: "match-found-events",
              messages: [{ value: JSON.stringify(matchResult) }],
            });

            // Print the current state of the topic queues
            printTopicQueues();

            // Set the flag to indicate a match was found and break the inner loop
            matchFound = true;
            break;
          }
        }

        // If no match was found for matchReqDataA, move to the next request
        if (!matchFound) {
          i++;
        }
      }
    }
  }, 2000);
};

// Start the producer and the continuous matching algorithm
(async () => {
  await kafkaProducer.connect();
  runMatchingAlgorithm();
})();

app.listen(3003, () => {
  console.log("Server started on port 3003");
});
