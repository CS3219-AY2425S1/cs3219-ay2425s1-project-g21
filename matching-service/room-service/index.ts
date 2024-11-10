import express from "express";
import { Kafka } from "kafkajs";
import cors from "cors";

const app = express();

const kafka = new Kafka({ brokers: ["kafka:9092"], retry: { retries: 5 } });
const kafkaConsumer = kafka.consumer({ groupId: "room-service" });

app.use(express.json());
app.use(cors());

// Helper function to create a room from the collaboration service
const createRoom = async (
  userA: string,
  userADifficulty: string,
  userB: string,
  userBDifficulty: string,
  topic: string
): Promise<void> => {
  try {
    const response = await fetch(
      "http://collaboration-service:5001/room/createRoom",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId1: userA,
          difficulty1: userADifficulty,
          userId2: userB,
          difficulty2: userBDifficulty,
          topic: topic,
        }),
      }
    );
    if (response.status === 201) {
      const data = await response.json();
      const roomId = data.roomId;
      console.log(
        `Room ID ${roomId} created successfully for users ${userA} (Difficulty: ${userADifficulty}) and ${userB} (Difficulty: ${userBDifficulty}).`
      );
      return roomId;
    } else {
      const errorMsg = await response.text();
      console.error(
        `Failed to create room. Status ${response.status}, Response: ${errorMsg}`
      );
    }
  } catch (error: any) {
    console.error(`Error creating room for users ${userA} and ${userB}`);
    console.error(error);
  }
};

// Listens to match found events
(async () => {
  await kafkaConsumer.connect();
  await kafkaConsumer.subscribe({
    topic: "match-found-events",
    fromBeginning: false,
  });

  await kafkaConsumer.run({
    eachMessage: async ({ message }) => {
      if (message.value) {
        try {
          const matchFoundEvent = JSON.parse(message.value.toString());
          const {
            userA: userA,
            userADifficulty,
            userB: userB,
            userBDifficulty,
            topic,
          } = matchFoundEvent;

          console.log(
            `Received match-found-event between User A: ${userA} (Difficulty: ${userADifficulty}) and User B: ${userB} (Difficulty: ${userBDifficulty})`
          );

          // Calling the helper function
          await createRoom(userA, userADifficulty, userB, userBDifficulty, topic);
        } catch (error: any) {
          console.error("Error processing match-found-event:", error.message);
        }
      }
    },
  });
})();

app.listen(3005, () => {
  console.log("Server started on port 3005");
});
