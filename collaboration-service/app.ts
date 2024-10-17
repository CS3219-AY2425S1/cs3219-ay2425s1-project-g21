import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import collaborationRoutes from './src/routes/collaborationRoutes';

dotenv.config();

const app = express();

// Allow cross-origin requests from your frontend at http://localhost:3000
app.use(cors());

// Allow JSON data in the request body to be parsed
app.use(express.json());

// Allow URL-encoded data in the request body to be parsed
app.use(express.urlencoded({ extended: false }));

// Use the question router to handle requests at http://localhost:5000/questions
app.use('/room', collaborationRoutes);

// Set the server to listen on a specific port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
