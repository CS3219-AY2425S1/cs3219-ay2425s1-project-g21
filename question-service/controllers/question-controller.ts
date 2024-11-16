import express, { Request, Response } from "express";
import Question from "../models/question-model";

export const fetchAllQuestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const questions = await Question.find({});
    if (questions.length > 0) {
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
    const { title, description, category, difficulty } = req.body;

    const lastQuestion = await Question.findOne().sort({ questionId: -1 }).exec();
    const newQuestionId = lastQuestion ? lastQuestion.questionId + 1 : 1;

    const newQuestion = new Question({
      questionId: newQuestionId,
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
        message: `Duplicate value for field: ${dup}.`,
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
        message: `Duplicate value for field: ${dup}.`,
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
      questionId: Number(req.params.id),
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
    const questions = await Question.find({ category: { $in: [cat] } });

    if (questions.length > 0) {
      res.status(200).json(questions);
    } else {
      res.status(404).json({ message: "No questions found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to get questions", error });
  }
};

export const getFiltered = async (
  req: Request,
  res: Response
): Promise<void> => {
  const category = req.query.category as string | undefined;
  const difficulties = req.query.difficulty as string | string[] | undefined;

  console.log("Category:", category);
  console.log("Difficulties:", difficulties);

  try {
    // Convert difficulties to an array if it's a single string
    const difficultyArray = difficulties
      ? Array.isArray(difficulties)
        ? difficulties
        : [difficulties]
      : undefined;

    // Build the query object dynamically
    const query: { [key: string]: any } = {};
    if (category) {
      query.category = category;
    }
    if (difficultyArray) {
      query.difficulty = { $in: difficultyArray };
    }

    const questions = await Question.find(query);

    if (questions.length > 0) {
      res.status(200).json(questions);
    } else {
      res.status(404).json({ message: "No questions found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to get questions", error });
  }
};
