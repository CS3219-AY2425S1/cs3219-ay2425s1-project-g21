import express, { Request, Response } from 'express';
import Question from '../models/question-model';

// @desc Fetch all questions
// @route GET /api/questions
// @access Public
export const fetchAllQuestions = async (req: Request, res: Response): Promise<void> => {
    try {
      const questions = await Question.find({});
      if (questions) {
        res.status(200).json(questions);
      } else {
        res.status(404).json({ message: 'No questions found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch questions', error });
    }
  };


// @desc Create a new question
// @route POST /api/questions
// @access Public
export const addQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { questionId, title, description, category, difficulty } = req.body;
      const newQuestion = new Question({
        questionId,
        title,
        description,
        category,
        difficulty,
      });
  
      const addedQuestion = await newQuestion.save();
      
      res.status(201).json(addedQuestion); 
    } catch (error) {
      res.status(500).json({ message: 'Failed to create question', error });
    }
  };


// @desc Update a question by ID
// @route PUT /api/questions/:id
// @access Public
export const updateQuestionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, category, difficulty } = req.body;
  
      const updatedQuestion = await Question.findOneAndUpdate(
        {
            questionId: req.params.id
        },
        { 
            title, 
            description, 
            category, 
            difficulty 
        },
        { 
            new: true 
        }
);
  
      if (updatedQuestion) {
        res.status(200).json(updatedQuestion);
      } else {
        res.status(404).json({ message: 'Question not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to update question', error });
    }
  };


// @desc Delete a question by ID
// @route DELETE /api/questions/:id
// @access Public
export const deleteQuestionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const questionFound = await Question.findOneAndDelete({
        questionId: req.params.id
    },
);
      if (questionFound) {
        res.status(200).json({message: 'Question deleted successfully'});
      } else {
        res.status(404).json({message: 'Question not found'});
      }
    } catch (error) {
      res.status(500).json({message: 'Failed to delete question', error});
    }
  };

// @desc Find a question by ID
// @route GET /api/questions/:id
// @access Public
export const getQuestionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const question = await Question.findOne({
        questionId: req.params.id
    },
);
      if (question) {
        res.status(200).json(question);
      } else {
        res.status(404).json({message: 'Question not found'});
      }
    } catch (error) {
      res.status(500).json({message: 'Failed to get question', error});
    }
  };

// @desc Get questions by difficulty level
// @route GET /api/questions?difficulty=<level>
// @access Public
export const getQuestionsByDifficulty = async (req: Request, res: Response): Promise<void> => {
    const level = req.query.difficulty;
    console.log("Difficulty level:", level);
    try {
        const questions = await Question.find({difficulty: level});

        if (questions.length > 0) {
            res.status(200).json(questions);
        } else {
            res.status(404).json({message: "No questions found"});
        }
    } catch (error) {
        res.status(500).json({message: "Failed to get questions", error})
    }
};
