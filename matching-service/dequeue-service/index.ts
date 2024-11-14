import express from "express";
import { Kafka } from "kafkajs";
import cors from "cors";

const app = express();

// Initialize Kafka
const kafka = new Kafka({ brokers: ["kafka:9092"], retry: { retries: 5 } });
const kafkaProducer = kafka.producer();
const kafkaConsumer = kafka.consumer({ groupId: "dequeue-service" });
const matchFoundConsumer = kafka.consumer({
  groupId: "dequeue-service-matchfound",
});
const cancelMatchConsumer = kafka.consumer({
  groupId: "dequeue-service-cancelmatch",
});

app.use(express.json());
app.use(cors());

// Timers Map to track match timers by userID and topic
interface TimerData {
  userID: string;
  topic: string;
  timerID: NodeJS.Timeout;
  status: "waiting" | "matched" | "cancelled"; // update timer data to indicate status
}

const timersMap = new Map<string, TimerData>();

const TIMEOUT_DURATION = 30000;

// Start Kafka Producer
(async () => {
  await kafkaProducer.connect();
})();

// Listen for `match-events`
(async () => {
  await kafkaConsumer.connect();
  await kafkaConsumer.subscribe({
    topic: "match-events",
    fromBeginning: false,
  });

  kafkaConsumer.run({
    eachMessage: async ({ message }) => {
      const matchRequest = message.value
        ? JSON.parse(message.value.toString())
        : {};
      const { userID, topic } = matchRequest;

            console.log(`Received match-event for user: ${userID}, topic: ${topic}`);
            console.log(`Received match request: ${JSON.stringify(matchRequest)}`);

            // Calculate the timeout duration relative to match request's timestamp
            const currentTime = Date.now();
            const requestTime = matchRequest.timestamp;
            const elapsedTime = currentTime - requestTime;

      // Start a timer for this match
      const timerID = setTimeout(async () => {
        const timerData = timersMap.get(userID);

        // trigger timeout dequeue if status is still waiting
        if (timerData && timerData.status === "waiting") {
          console.log(
            `Timer up for user: ${userID}, topic: ${topic}. Producing dequeue-event.`
          );
        }

        // Produce `dequeue-event` with userID, topic, and reason: 'timeout'
        await kafkaProducer.send({
          topic: "dequeue-events",
          messages: [
            {
              key: userID,
              value: JSON.stringify({ userID, topic, reason: "timeout" }),
            },
          ],
        });

                // Remove the timer reference
                timersMap.delete(userID);
            }, TIMEOUT_DURATION - elapsedTime); // If negative, will immediately produce a timeout event

      // Store the timer reference and topic in the map
      timersMap.set(userID, { userID, topic, timerID, status: "waiting" });
    },
  });
})();

// Listen for `match-found-events` to clear the timers for `userA` and `userB`
(async () => {
  await matchFoundConsumer.connect();
  await matchFoundConsumer.subscribe({
    topic: "match-found-events",
    fromBeginning: false,
  });

  matchFoundConsumer.run({
    eachMessage: async ({ message }) => {
      const matchFoundEvent = message.value
        ? JSON.parse(message.value.toString())
        : {};
      const { userA, userB } = matchFoundEvent;

      console.log(`Match found between userA: ${userA} and userB: ${userB}`);

      // Clear the timers for userA and userB if they exist
      [userA, userB].forEach((userID) => {
        const timerData = timersMap.get(userID);
        if (timerData) {
          clearTimeout(timerData.timerID); // Clear the timer
          timersMap.set(userID, { ...timerData, status: "matched" });
          timersMap.delete(userID); // Remove from the map
          console.log(
            `Cleared timer for user: ${userID}, reason: match found for user`
          );
        }
      });
    },
  });
})();

// Listen for `cancel-match-events` to produce a `dequeue-event`
(async () => {
  await cancelMatchConsumer.connect();
  await cancelMatchConsumer.subscribe({
    topic: "cancel-match-events",
    fromBeginning: false,
  });

  cancelMatchConsumer.run({
    eachMessage: async ({ message }) => {
      const cancelMatchEvent = message.value
        ? JSON.parse(message.value.toString())
        : {};
      const { userID, topic } = cancelMatchEvent;

      console.log(
        `Received cancel-match-event for user: ${userID}, topic: ${topic}`
      );

      // Produce a `dequeue-event` with userID, topic, and reason: 'cancel'
      await kafkaProducer.send({
        topic: "dequeue-events",
        messages: [
          {
            key: userID,
            value: JSON.stringify({ userID, topic, reason: "cancel" }),
          },
        ],
      });

      // Clear the timer for the canceled match
      if (timersMap.has(userID)) {
        const timerData = timersMap.get(userID);
        if (timerData) {
          clearTimeout(timerData.timerID); // Clear the timer
          timersMap.delete(userID); // Remove from the map
          console.log(
            `Cleared timer for canceled user: ${userID}, reason: user cancelled matching`
          );
        }
      }
    },
  });
})();

app.listen(3004, () => {
  console.log("Server started on port 3004");
});
