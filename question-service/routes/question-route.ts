import express from 'express';
import {
  fetchAllQuestions,
  addQuestion,
  updateQuestionById,
  deleteQuestionById,
  getQuestionById,
  getQuestionsByDifficulty
} from '../controllers/question-controller';
import { fetchQuestionDifficulties, fetchQuestionTopics } from '../controllers/question-metadata-controller';

const router = express.Router();

// Routes for the frontend to query for matching parameters
// router.get('/difficulties', (req, res) => {
//   res.json(['easy', 'medium', 'hard']);
// });
// router.get('/topics', (req, res) => {
//   res.json(['math', 'english', 'science']);
// });
router.get('/difficulties', fetchQuestionDifficulties);
router.get('/topics', fetchQuestionTopics);

// Routes for the question service
router.get('/', fetchAllQuestions);
router.post('/', addQuestion);
router.get('/filter', getQuestionsByDifficulty);
router.put('/:id', updateQuestionById);
router.delete('/:id', deleteQuestionById);
router.get('/:id', getQuestionById);

export default router;
