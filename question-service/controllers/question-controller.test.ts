import request from "supertest";
import express from "express";
import Question from "../models/question-model";
import {
  fetchAllQuestions,
  addQuestion,
  getQuestionById,
  deleteQuestionById,
} from "./question-controller";

// Increase timeout for all tests in this suite
jest.setTimeout(10000);

// Sample Express setup
const app = express();
app.use(express.json());
app.get("/questions", fetchAllQuestions);
app.post("/questions", addQuestion);
app.get("/questions/:id", getQuestionById);
app.delete("/questions/:id", deleteQuestionById);

describe("Question Controller", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("fetchAllQuestions", () => {
    it("should return a list of questions", async () => {
      const sampleQuestion = {
        questionId: "q1",
        questionText: "What is an algorithm?",
      };

      jest.spyOn(Question, "find").mockResolvedValue([sampleQuestion] as any);

      const response = await request(app).get("/questions");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([sampleQuestion]);
    });

    it("should return 404 if no questions are found", async () => {
      jest.spyOn(Question, "find").mockResolvedValue([] as any);

      const response = await request(app).get("/questions");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "No questions found" });
    });
  });

  describe("addQuestion", () => {
    it("should add a new question and return it", async () => {
      // Mock findOne for getting the last question ID
      jest.spyOn(Question, "findOne").mockReturnValue({
        sort: () => ({
          exec: () => Promise.resolve({ questionId: 0 }),
        }),
      } as any);

      const newQuestionData = {
        title: "Algorithm Basics",
        description: "What is an algorithm?",
        category: ["algorithms"],
        difficulty: "Medium",
      };

      // Mock the save operation
      jest
        .spyOn(Question.prototype, "save")
        .mockResolvedValue({ ...newQuestionData, questionId: 1 } as any);

      const response = await request(app)
        .post("/questions")
        .send(newQuestionData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        ...newQuestionData,
        questionId: 1,
      });
    });

    it("should return 409 for duplicate question", async () => {
      console.log("Testing duplicate question");
      // Mock findOne for getting the last question ID
      jest.spyOn(Question, "findOne").mockReturnValue({
        sort: () => ({
          exec: () => Promise.resolve({ questionId: 0 }),
        }),
      } as any);

      const error = { code: 11000, keyValue: { title: "Duplicate Title" } };
      jest.spyOn(Question.prototype, "save").mockRejectedValue(error as any);

      const response = await request(app)
        .post("/questions")
        .send({
          title: "Duplicate Title",
          description: "Test description",
          category: ["test"],
          difficulty: "Easy",
        });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        message: "Duplicate value for field: title.",
      });
    });
  });

  describe("getQuestionById", () => {
    it("should return a question by ID", async () => {
      const sampleQuestion = {
        questionId: "q1",
        questionText: "What is an algorithm?",
      };
      jest.spyOn(Question, "findOne").mockResolvedValue(sampleQuestion as any);

      const response = await request(app).get("/questions/q1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(sampleQuestion);
    });

    it("should return 404 if question not found", async () => {
      jest.spyOn(Question, "findOne").mockResolvedValue(null);

      const response = await request(app).get("/questions/q99");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Question not found" });
    });
  });

  describe("deleteQuestionById", () => {
    it("should delete a question and return success message", async () => {
      const sampleQuestion = {
        questionId: "q1",
        questionText: "What is an algorithm?",
      };
      jest
        .spyOn(Question, "findOneAndDelete")
        .mockResolvedValue(sampleQuestion as any);

      const response = await request(app).delete("/questions/q1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Question deleted successfully",
      });
    });

    it("should return 404 if question to delete is not found", async () => {
      jest.spyOn(Question, "findOneAndDelete").mockResolvedValue(null);

      const response = await request(app).delete("/questions/q99");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Question not found" });
    });
  });
});
