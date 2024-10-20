import { Request, Response } from "express";
import Question from "../models/question-model";

export const fetchQuestionDifficulties = async (req: Request, res: Response): Promise<void> => {
    try {
        const questionDifficulties = await Question.distinct('difficulty');
        if (questionDifficulties) {
            res.status(200).json(questionDifficulties);
        } else {
            res.status(404).json({ message: 'No question difficulties found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch question difficulties', error });
    }
}

export const fetchQuestionTopics = async (req: Request, res: Response): Promise<void> => {
    try {
        const questionTopics = await Question.distinct('category');
        if (questionTopics) {
            res.status(200).json(questionTopics);
        } else {
            res.status(404).json({ message: 'No question topics found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch question topics', error });
    }
}