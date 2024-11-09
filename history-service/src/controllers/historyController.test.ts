import request from "supertest";
import express from "express";
import { Topic } from "../models/history-model";
import { getUserHistory, getUserHistoryByCategory } from "./historyController";
import { ref, get } from "firebase/database";
import { HistoryModel } from "../models/history-model";

jest.mock("../config/firebaseConfig", () => ({
  __esModule: true,
  default: {}, // Mock empty database object
}));

jest.mock("firebase/database", () => ({
  ref: jest.fn(),
  get: jest.fn(),
}));

const app = express();
app.use(express.json());
app.post("/getUserHistory", getUserHistory);
app.post("/getUserHistoryByCategory", getUserHistoryByCategory);

describe("History Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserHistory", () => {
    it("should return history data for a valid userId", async () => {
      const mockData = {
        room1: {
          category: Topic.ALGORITHMS,
          question: "What is an algorithm?",
        },
      };

      (ref as jest.Mock).mockReturnValueOnce({});
      (get as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        val: () => mockData,
      });

      const response = await request(app)
        .post("/getUserHistory")
        .send({ userId: "user123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });

    it("should return 404 if history data is not found", async () => {
      (ref as jest.Mock).mockReturnValueOnce({});
      (get as jest.Mock).mockResolvedValueOnce({
        exists: () => false,
      });

      const response = await request(app)
        .post("/getUserHistory")
        .send({ userId: "user123" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "History data not found." });
    });

    it("should return 400 for invalid userId", async () => {
      const response = await request(app)
        .post("/getUserHistory")
        .send({ userId: 123 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Invalid or missing userId." });
    });
  });

  describe("getUserHistoryByCategory", () => {
    it("should return history data filtered by category", async () => {
      const mockData = {
        room1: {
          category: [Topic.ALGORITHMS],
          question: "What is an algorithm?",
        },
        room2: { category: [Topic.ARRAYS], question: "What is an array?" },
      };

      const expectedResult = [
        {
          category: [Topic.ALGORITHMS],
          question: "What is an algorithm?",
        },
      ];

      (ref as jest.Mock).mockReturnValueOnce({});
      (get as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        val: () => mockData,
      });

      const response = await request(app)
        .post("/getUserHistoryByCategory")
        .send({ userId: "user123", category: Topic.ALGORITHMS });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResult);
    });

    it("should return 404 if no history data in the specified category", async () => {
      const mockData = {
        room1: { category: [Topic.ARRAYS], question: "What is an array?" },
      };

      (ref as jest.Mock).mockReturnValueOnce({});
      (get as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        val: () => mockData,
      });

      const response = await request(app)
        .post("/getUserHistoryByCategory")
        .send({ userId: "user123", category: Topic.ALGORITHMS });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: `No questions found in category '${Topic.ALGORITHMS}'.`,
      });
    });

    it("should return 400 for invalid userId", async () => {
      const response = await request(app)
        .post("/getUserHistoryByCategory")
        .send({ userId: 123, category: Topic.ALGORITHMS });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Invalid or missing userId." });
    });

    it("should return 400 for invalid category", async () => {
      const response = await request(app)
        .post("/getUserHistoryByCategory")
        .send({ userId: "user123", category: 123 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Invalid or missing category.",
      });
    });
  });
});
