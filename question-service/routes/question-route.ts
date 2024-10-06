import express from 'express';
import {
  fetchAllQuestions,
  addQuestion,
  updateQuestionById,
  deleteQuestionById,
  getQuestionById,
  getQuestionsByDifficulty
} from '../controllers/question-controller';

const router = express.Router();

// Routes for the question service
router.get('/', fetchAllQuestions);
router.post('/', addQuestion);
router.get('/filter', getQuestionsByDifficulty);
router.put('/:id', updateQuestionById);
router.delete('/:id', deleteQuestionById);
router.get('/:id', getQuestionById);

export default router;
