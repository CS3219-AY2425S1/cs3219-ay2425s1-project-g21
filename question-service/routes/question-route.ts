import express from 'express';
import {
  fetchAllQuestions,
  addQuestion,
  updateQuestionById,
  deleteQuestionById,
  getQuestionById,
  getQuestionsByDifficulty,
  getQuestionsByCategory,
  getFiltered
} from '../controllers/question-controller';
import { fetchQuestionDifficulties, fetchQuestionTopics } from '../controllers/question-metadata-controller';

const router = express.Router();

router.get('/difficulties', fetchQuestionDifficulties);
router.get('/topics', fetchQuestionTopics);

// Routes for the question service
router.get('/', fetchAllQuestions);
router.post('/', addQuestion);
router.get('/difficulty', getQuestionsByDifficulty);
router.get('/category', getQuestionsByCategory);
router.get('/filter', getFiltered);
router.put('/:id', updateQuestionById);
router.delete('/:id', deleteQuestionById);
router.get('/:id', getQuestionById);

export default router;
