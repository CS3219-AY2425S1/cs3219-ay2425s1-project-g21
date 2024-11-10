import { Router } from "express";
import { Kafka } from "kafkajs";

const router = Router();

const kafka = new Kafka({ brokers: ["kafka:9092"], retry: { retries: 5 } });
const kafkaProducer = kafka.producer();
const kafkaConsumer = kafka.consumer({ groupId: "request-service" });
const dequeueConsumer = kafka.consumer({ groupId: "request-service-dequeue" });

const matchesMap = new Map();
const statusMap = new Map();
const matchTimestamps = new Map(); // New map to store request timestamps
const matchTopicsMap = new Map(); // New map to store topic based on userID

(async () => {
  await kafkaProducer.connect();

  // Setup Kafka consumer to update matchesMap and status map once any match has been found
  await kafkaConsumer.connect();
  await kafkaConsumer.subscribe({
    topic: "match-found-events",
    fromBeginning: false,
  });
  kafkaConsumer.run({
    eachMessage: async ({ message }) => {
      if (message.value) {
        const matchFoundData = JSON.parse(message.value.toString());
        matchesMap.set(matchFoundData.userA, matchFoundData);
        matchesMap.set(matchFoundData.userB, matchFoundData);
        statusMap.set(matchFoundData.userA, "isMatched");
        statusMap.set(matchFoundData.userB, "isMatched");

        matchTimestamps.delete(matchFoundData.userA);
        matchTopicsMap.delete(matchFoundData.userB);
        matchTimestamps.delete(matchFoundData.userA);
        matchTopicsMap.delete(matchFoundData.userB);
        console.log(
          "Cleared match request for users: ",
          matchFoundData.userA,
          matchFoundData.userB
        );
      }
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
      const { userID, reason } = message.value
        ? JSON.parse(message.value.toString())
        : {};
      console.log(
        `Received dequeue event for userID: ${userID} with reason: ${reason}`
      );

      // Check the reason for the dequeue event
      if (reason === "timeout") {
        // Set the user's status to `unsuccessful`
        statusMap.set(userID, "unsuccessful");
        console.log(
          `User ${userID} status set to unsuccessful due to timeout.`
        );
      } else if (reason === "cancel") {
        // Set the user's status to `isNotMatching` for cancellation
        statusMap.set(userID, "isNotMatching");
        console.log(
          `User ${userID} status set to isNotMatching due to cancel.`
        );
      } else {
        console.log(`Unknown reason: ${reason} for userID: ${userID}`);
      }
    },
  });
})();

const verifyJWT = async (authorizationHeader: string | undefined) => {
  if (!authorizationHeader) {
    throw new Error("Missing Authorization header");
  }

  try {
    const response = await fetch(
      `${process.env.VITE_USER_SERVICE_API_URL}/auth/verify-token`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationHeader,
        },
      }
    );

    const data = await response.json();

    if (data.message !== "Token verified") {
      throw new Error(`JWT verification failed: ${data.message}`);
    }

    return data.data; // Return user data if verification is successful
  } catch (error) {
    throw new Error("Failed to verify JWT");
  }
};

router.post("/find-match", async (req, res) => {
  try {
    const userData = await verifyJWT(req.headers.authorization);

    // Create match request data
    const matchRequestData = {
      userID: userData.id,
      topic: req.body.topic,
      difficulty: req.body.difficulty,
      timestamp: Date.now().toString(),
    };

    // Produce a `match-event`
    await kafkaProducer.send({
      topic: "match-events",
      messages: [{ key: userData.id, value: JSON.stringify(matchRequestData) }],
    });
    console.log(`Produced match request: ${JSON.stringify(matchRequestData)}`);

    // Set user status to `isMatching`
    statusMap.set(userData.id, "isMatching");
    matchTimestamps.set(userData.id, Date.now());
    matchTopicsMap.set(userData.id, req.body.topic);

    res.json({ message: "Received match request" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Failed to verify JWT")) {
        res
          .status(401)
          .json({ message: "Unauthorized. Please re-authenticate." });
      } else {
        console.error("Error: ", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }
});

// New cancel-matching endpoint
router.post("/cancel-matching", async (req, res) => {
  try {
    const userData = await verifyJWT(req.headers.authorization);

    // Retrieve the topic from matchTopicsMap based on userID
    const topic = matchTopicsMap.get(userData.id);
    if (!topic) {
      res.status(400).json({ message: "No matching request found for user" });
      return;
    }

    // Create cancel match data
    const cancelMatchData = {
      userID: userData.id,
      topic: topic, // Include the topic stored for this user
    };

    // Produce a `cancel-match-event`
    await kafkaProducer.send({
      topic: "cancel-match-events",
      messages: [{ key: userData.id, value: JSON.stringify(cancelMatchData) }],
    });

    // Clear user's status and remove from matchTimestamps and matchTopicsMap
    statusMap.delete(userData.id);
    matchTimestamps.delete(userData.id);
    matchTopicsMap.delete(userData.id);

    res.json({ message: "Match canceled successfully and status cleared" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Failed to verify JWT")) {
        res
          .status(401)
          .json({ message: "Unauthorized. Please re-authenticate." });
      } else {
        console.error("Error: ", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }
});

router.get("/match-status", async (req, res) => {
  try {
    const userData = await verifyJWT(req.headers.authorization);

    if (statusMap.has(userData.id)) {
      res.json({ matchStatus: `${statusMap.get(userData.id)}` });
    } else {
      res.json({ matchStatus: "isNotMatching" });
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Failed to verify JWT")) {
        res
          .status(401)
          .json({ message: "Unauthorized. Please re-authenticate." });
      } else {
        console.error("Error: ", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }
});

router.get("/waiting-time", async (req, res) => {
  try {
    const userData = await verifyJWT(req.headers.authorization);

    if (matchTimestamps.has(userData.id)) {
      const currentTime = Date.now();
      const requestTime = matchTimestamps.get(userData.id);

      const waitingTimeInSeconds = Math.floor(
        (currentTime - requestTime) / 1000
      ); // Time in seconds
      res.json({ waitingTime: waitingTimeInSeconds });
    } else {
      res.status(404).json({ message: "User is not in the match queue" });
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Failed to verify JWT")) {
        res
          .status(401)
          .json({ message: "Unauthorized. Please re-authenticate." });
      } else {
        console.error("Error: ", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }
});

router.post("/reset-status", async (req, res) => {
  try {
    const userData = await verifyJWT(req.headers.authorization);

    statusMap.set(userData.id, "isNotMatching");
    res.json({ message: "Reset match status to not matching" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Failed to verify JWT")) {
        res
          .status(401)
          .json({ message: "Unauthorized. Please re-authenticate." });
      } else {
        console.error("Error: ", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }
});

router.get("/reset-match-statuses", async (req, res) => {
  statusMap.clear();
  res.json({ message: "Match status reset successfully" });
});

export default router;
