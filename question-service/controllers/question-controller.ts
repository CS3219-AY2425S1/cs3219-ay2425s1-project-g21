import express, { Request, Response } from "express";
import Question from "../models/question-model";

export const fetchAllQuestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const questions = await Question.find({});
    if (questions) {
      res.status(200).json(questions);
    } else {
      res.status(404).json({ message: "No questions found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch questions", error });
  }
};

export const addQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
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
  } catch (error: any) {
    if (error.code === 11000) {
      const dup = Object.keys(error.keyValue)[0];
      res.status(409).json({
        message: `Duplicate value for field: ${dup}.`
      });
    } else {
      res.status(500).json({ message: "Failed to create question", error });
    }
  }
};

export const updateQuestionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, description, category, difficulty } = req.body;

    const updatedQuestion = await Question.findOneAndUpdate(
      {
        questionId: req.params.id,
      },
      {
        title,
        description,
        category,
        difficulty,
      },
      {
        new: true,
      }
    );

    if (updatedQuestion) {
      res.status(200).json(updatedQuestion);
    } else {
      res.status(404).json({ message: "Question not found" });
    }
  } catch (error: any) {
    if (error.code === 11000) {
      const dup = Object.keys(error.keyValue)[0];
      res.status(409).json({
        message: `Duplicate value for field: ${dup}.`
      });
    } else {
      res.status(500).json({ message: "Failed to update question", error });
    }
  }
};

export const deleteQuestionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const questionFound = await Question.findOneAndDelete({
      questionId: req.params.id,
    });
    if (questionFound) {
      res.status(200).json({ message: "Question deleted successfully" });
    } else {
      res.status(404).json({ message: "Question not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete question", error });
  }
};

export const getQuestionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const question = await Question.findOne({
      questionId: req.params.id,
    });
    if (question) {
      res.status(200).json(question);
    } else {
      res.status(404).json({ message: "Question not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to get question", error });
  }
};

export const getQuestionsByDifficulty = async (
  req: Request,
  res: Response
): Promise<void> => {
  const level = req.query.difficulty;
  console.log("Difficulty level:", level);
  try {
    const questions = await Question.find({ difficulty: level });

    if (questions.length > 0) {
      res.status(200).json(questions);
    } else {
      res.status(404).json({ message: "No questions found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to get questions", error });
  }
};

export const getQuestionsByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const cat = req.query.category;
  console.log("Category:", cat);
  try {
    const questions = await Question.find({ category: {$in: [cat] } });

    if (questions.length > 0) {
      res.status(200).json(questions);
    } else {
      res.status(404).json({ message: "No questions found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to get questions", error });
  }
};
