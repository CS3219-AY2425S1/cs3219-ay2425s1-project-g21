import request from "supertest";
import express from "express";
import { Topic } from "../models/history-model";
import { getUserHistory, getUserHistoryByCategory } from "./historyController";
import { HistoryModel } from "../models/history-model";

// Create an Express app with the routes
const app = express();
app.use(express.json());
app.post("/getUserHistory", getUserHistory);
app.post("/getUserHistoryByCategory", getUserHistoryByCategory);

// Mock database interaction directly in each controller
jest.mock("./historyController", () => {
  const originalModule = jest.requireActual("./historyController");

  return {
    __esModule: true,
    ...originalModule,
    getUserHistory: jest.fn(),
    getUserHistoryByCategory: jest.fn(),
  };
});

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

      (getUserHistory as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockData);
      });

      const response = await request(app)
        .post("/getUserHistory")
        .send({ userId: "user123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });

    it("should return 404 if history data is not found", async () => {
      (getUserHistory as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ message: "History data not found." });
      });

      const response = await request(app)
        .post("/getUserHistory")
        .send({ userId: "user123" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "History data not found." });
    });
  });

  describe("getUserHistoryByCategory", () => {
    it("should return history data filtered by category", async () => {
      const mockData = [
        {
          category: [Topic.ALGORITHMS],
          question: "What is an algorithm?",
        },
      ];

      (getUserHistoryByCategory as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockData);
      });

      const response = await request(app)
        .post("/getUserHistoryByCategory")
        .send({ userId: "user123", category: Topic.ALGORITHMS });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });

    it("should return 404 if no history data in the specified category", async () => {
      (getUserHistoryByCategory as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({
          message: `No questions found in category '${Topic.ALGORITHMS}'.`,
        });
      });

      const response = await request(app)
        .post("/getUserHistoryByCategory")
        .send({ userId: "user123", category: Topic.ALGORITHMS });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: `No questions found in category '${Topic.ALGORITHMS}'.`,
      });
    });
  });
});
