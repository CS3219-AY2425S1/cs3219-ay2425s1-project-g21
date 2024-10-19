import { Router } from 'express';
import { Kafka } from 'kafkajs';

const router = Router();

const kafka = new Kafka({ brokers: ['kafka:9092'] });
const kafkaProducer = kafka.producer();
const kafkaConsumer = kafka.consumer({ groupId: 'request-service' });
const dequeueConsumer = kafka.consumer({ groupId: 'request-service-dequeue' });

const matchesMap = new Map();
const statusMap = new Map();
const matchTimestamps = new Map();  // New map to store request timestamps

// TODO: When `cancel-match-event`, set user status to `isNotMatching`

(async () => {
    await kafkaProducer.connect();

    // Setup Kafka consumer to update matchesMap and status map once any match has been found
    await kafkaConsumer.connect();
    await kafkaConsumer.subscribe({ topic: 'match-found-events', fromBeginning: false });
    kafkaConsumer.run({
        eachMessage: async ({ message }) => {
            if (message.value) {
                const matchFoundData = JSON.parse(message.value.toString());
                matchesMap.set(matchFoundData.userA, matchFoundData);
                matchesMap.set(matchFoundData.userB, matchFoundData);
                statusMap.set(matchFoundData.userA, 'isMatched');
                statusMap.set(matchFoundData.userB, 'isMatched');
            }
        },
    });
})();

// Listen to dequeue events
(async () => {
  await dequeueConsumer.connect();
  await dequeueConsumer.subscribe({ topic: 'dequeue-events', fromBeginning: false });

  await dequeueConsumer.run({
    eachMessage: async ({ message }) => {
      const { userID } = message.value ? JSON.parse(message.value.toString()) : {};
      console.log(`Received dequeue event for userID: ${userID}`);
      
      // Set the user's status to `unsuccessful` instead of `isNotMatching`
      statusMap.set(userID, 'unsuccessful');
      console.log(`User ${userID} status set to unsuccessful.`);
    },
  });
})();

const verifyJWT = async (authorizationHeader: string | undefined) => {
    try {
        const response = await fetch("http://user-service:3001/auth/verify-token", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${authorizationHeader}`,
            },
        });
        const data = await response.json();
        if (data.message !== "Token verified") {
            throw new Error(`JWT verification failed: ${data.message}`);
        }
        return data.data; // Return user data if verification is successful
    } catch (error) {
        throw new Error("Failed to verify JWT");
    }
};

router.post('/find-match', async (req, res) => {
    try {
        const userData = await verifyJWT(req.headers.authorization);

        // Create match request data
        const matchRequestData = {
            userID: userData.id,
            topic: req.body.topic,
            difficulty: req.body.difficulty,
            timestamp: Date.now().toString(),
        }

        // Produce a `match-event`
        await kafkaProducer.send({
            topic: "match-events",
            messages: [{ key: userData.id, value: JSON.stringify(matchRequestData) }],
        });

        // Set user status to `isMatching`
        statusMap.set(userData.id, 'isMatching');
        res.json({ message: "Received match request" });
        matchTimestamps.set(userData.id, Date.now());  // Store the time when the match was requested

    } catch (error) {
        // TODO: Improve error handling
        console.error("Error: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/match-status', async (req, res) => {
    const userData = await verifyJWT(req.headers.authorization);

    if (statusMap.has(userData.id)) {
        res.json({ matchStatus: `${statusMap.get(userData.id)}` });
    } else {
        res.json({ matchStatus: 'isNotMatching' });
    }
});

router.get('/waiting-time', async (req, res) => {
    try {
        const userData = await verifyJWT(req.headers.authorization);

        if (matchTimestamps.has(userData.id)) {
            const currentTime = Date.now();
            const requestTime = matchTimestamps.get(userData.id);

            const waitingTimeInSeconds = Math.floor((currentTime - requestTime) / 1000);  // Time in seconds
            res.json({ waitingTime: waitingTimeInSeconds });
        } else {
            res.status(404).json({ message: "User is not in the match queue" });
        }
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/reset-status', async (req, res) => {
    try {
        const userData = await verifyJWT(req.headers.authorization);

        statusMap.set(userData.id, 'isNotMatching');
        res.json({ message: "Reset match status to not matching" });

    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/reset-match-statuses', async (req, res) => {
    statusMap.clear();
    res.json({ message: "Match status reset successfully" });
});

export default router;
