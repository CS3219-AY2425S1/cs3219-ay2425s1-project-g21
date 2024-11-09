import request from "supertest";
import express from "express";
import * as questionController from "../controllers/question-controller";
import Question from "../models/question-model";

// Mock the Question model
jest.mock("../models/question-model");

const app = express();
app.use(express.json());

// Routes for testing
app.get("/questions", questionController.fetchAllQuestions);
app.post("/questions", questionController.addQuestion);
app.get("/questions/:id", questionController.getQuestionById);
app.delete("/questions/:id", questionController.deleteQuestionById);

// Sample data for testing
const sampleQuestion = {
  questionId: "q1",
  title: "Sample Question",
  description: "This is a sample question",
  category: "General",
  difficulty: "Easy",
};

describe("Question Controller", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  describe("fetchAllQuestions", () => {
    it("should return a list of questions", async () => {
      (Question.find as unknown as jest.Mock).mockResolvedValue([
        sampleQuestion,
      ]);

      const response = await request(app).get("/questions");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([sampleQuestion]);
    });

    it("should return 404 if no questions are found", async () => {
      // Mock `Question.find` to return an empty array
      (Question.find as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get("/questions");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "No questions found" });
    });
  });

  describe("addQuestion", () => {
    it("should add a new question and return it", async () => {
      const newQuestionData = {
        questionId: "q2",
        title: "New Question",
        description: "This is a new question",
        category: "Math",
        difficulty: "Medium",
      };

      (Question.prototype.save as jest.Mock).mockResolvedValue(newQuestionData);

      const response = await request(app)
        .post("/questions")
        .send(newQuestionData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(newQuestionData);
    });

    it("should return 409 for duplicate question", async () => {
      const error = { code: 11000, keyValue: { questionId: "q1" } };
      (Question.prototype.save as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .post("/questions")
        .send(sampleQuestion);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        message: `Duplicate value for field: questionId.`,
      });
    });
  });

  describe("getQuestionById", () => {
    it("should return a question by ID", async () => {
      (Question.findOne as jest.Mock).mockResolvedValue(sampleQuestion);

      const response = await request(app).get("/questions/q1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(sampleQuestion);
    });

    it("should return 404 if question not found", async () => {
      (Question.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get("/questions/q99");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Question not found" });
    });
  });

  describe("deleteQuestionById", () => {
    it("should delete a question and return success message", async () => {
      (Question.findOneAndDelete as jest.Mock).mockResolvedValue(
        sampleQuestion
      );

      const response = await request(app).delete("/questions/q1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Question deleted successfully",
      });
    });

    it("should return 404 if question to delete is not found", async () => {
      (Question.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      const response = await request(app).delete("/questions/q99");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Question not found" });
    });
  });
});
