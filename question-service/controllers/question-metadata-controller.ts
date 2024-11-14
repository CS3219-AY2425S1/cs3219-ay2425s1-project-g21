import { Request, Response } from "express";
import Question from "../models/question-model";

export const fetchQuestionDifficulties = async (req: Request, res: Response): Promise<void> => {
    const category = req.query.category as string | undefined;

    try {
        // Build the query object to filter by category if provided
        const query = category ? { category: category } : {};

        const questionDifficulties = await Question.distinct('difficulty', query);
        if (questionDifficulties.length > 0) {
            res.status(200).json(questionDifficulties);
        } else {
            res.status(404).json({ message: 'No question difficulties found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch question difficulties', error });
    }
};


export const fetchQuestionTopics = async (req: Request, res: Response): Promise<void> => {
    const difficulty = req.query.difficulty as string | undefined;

    try {
        // Build the query object to filter by difficulty if provided
        const query = difficulty ? { difficulty: difficulty } : {};

        const questionTopics = await Question.distinct('category', query);
        if (questionTopics.length > 0) {
            res.status(200).json(questionTopics);
        } else {
            res.status(404).json({ message: 'No question topics found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch question topics', error });
    }
};
