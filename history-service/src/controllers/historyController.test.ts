import request from "supertest";
import express from "express";
import { getUserHistory, getUserHistoryByCategory } from "./historyController";

// Create mock functions
const mockGet = jest.fn();
const mockRef = jest.fn();
const mockGetDatabase = jest.fn();

// Mock the entire firebase/database module
jest.mock("firebase/database", () => ({
  get: (...args: any[]) => mockGet(...args),
  ref: (...args: any[]) => mockRef(...args),
  getDatabase: () => mockGetDatabase(),
}));

const app = express();
app.use(express.json());
app.post("/getUserHistory", getUserHistory);
app.post("/getUserHistoryByCategory", getUserHistoryByCategory);

describe("History Controller", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    // Reset the mock implementations
    mockGet.mockReset();
    mockRef.mockReset();
    mockGetDatabase.mockReset();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("getUserHistory", () => {
    it("should return 400 if userId is missing", async () => {
      const response = await request(app).post("/getUserHistory").send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Invalid or missing userId." });
    });

    it("should return 200 and history data for a valid userId", async () => {
      const mockHistoryData = {
        room1: {
          category: "ALGORITHMS",
          question: "What is a binary search?",
          timestamp: "2024-03-15T10:00:00Z",
        },
        room2: {
          category: "DATA_STRUCTURES",
          question: "Explain linked lists",
          timestamp: "2024-03-15T11:00:00Z",
        },
      };

      mockGet.mockResolvedValueOnce({
        exists: () => true,
        val: () => mockHistoryData,
      });

      const response = await request(app)
        .post("/getUserHistory")
        .send({ userId: "testUser123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockHistoryData);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it("should handle Firebase errors gracefully", async () => {
      const error = new Error("Firebase connection error");
      mockGet.mockRejectedValueOnce(error);

      const response = await request(app)
        .post("/getUserHistory")
        .send({ userId: "testUser123" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Failed to fetch history data",
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching history data:",
        error
      );
    });

    it("should return 404 for non-existent user history", async () => {
      mockGet.mockResolvedValueOnce({
        exists: () => false,
        val: () => null,
      });

      const response = await request(app)
        .post("/getUserHistory")
        .send({ userId: "nonexistentUser" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "History data not found." });
    });
  });

  describe("getUserHistoryByCategory", () => {
    it("should validate required parameters", async () => {
      // Test missing both parameters
      const noParamsResponse = await request(app)
        .post("/getUserHistoryByCategory")
        .send({});
      expect(noParamsResponse.status).toBe(400);
      expect(noParamsResponse.body.message).toBe("Invalid or missing userId.");

      // Test missing category
      const noCategoryResponse = await request(app)
        .post("/getUserHistoryByCategory")
        .send({ userId: "test123" });
      expect(noCategoryResponse.status).toBe(400);
      expect(noCategoryResponse.body.message).toBe(
        "Invalid or missing category."
      );

      // Test missing userId
      const noUserIdResponse = await request(app)
        .post("/getUserHistoryByCategory")
        .send({ category: "ALGORITHMS" });
      expect(noUserIdResponse.status).toBe(400);
      expect(noUserIdResponse.body.message).toBe("Invalid or missing userId.");
    });

    it("should return filtered history data for valid category", async () => {
      const mockData = {
        room1: {
          category: "ALGORITHMS",
          question: "What is a binary search?",
          timestamp: "2024-03-15T10:00:00Z",
        },
        room2: {
          category: "ALGORITHMS",
          question: "Explain bubble sort",
          timestamp: "2024-03-15T11:00:00Z",
        },
        room3: {
          category: "DATA_STRUCTURES",
          question: "What is a stack?",
          timestamp: "2024-03-15T12:00:00Z",
        },
      };

      mockGet.mockResolvedValueOnce({
        exists: () => true,
        val: () => mockData,
      });

      const response = await request(app)
        .post("/getUserHistoryByCategory")
        .send({
          userId: "testUser123",
          category: "ALGORITHMS",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(
        response.body.every((item: any) => item.category === "ALGORITHMS")
      ).toBe(true);
    });

    it("should return 404 for category with no questions", async () => {
      const mockData = {
        room1: {
          category: "DATA_STRUCTURES",
          question: "What is a stack?",
          timestamp: "2024-03-15T10:00:00Z",
        },
      };

      mockGet.mockResolvedValueOnce({
        exists: () => true,
        val: () => mockData,
      });

      const response = await request(app)
        .post("/getUserHistoryByCategory")
        .send({
          userId: "testUser123",
          category: "ALGORITHMS",
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "No questions found in category 'ALGORITHMS'.",
      });
    });

    it("should return 404 for invalid category", async () => {
      mockGet.mockResolvedValueOnce({
        exists: () => true,
        val: () => ({}),
      });

      const response = await request(app)
        .post("/getUserHistoryByCategory")
        .send({
          userId: "testUser123",
          category: "INVALID_CATEGORY",
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "No questions found in category 'INVALID_CATEGORY'.",
      });
    });

    it("should return results in their original order", async () => {
      const mockData = {
        room1: {
          category: "ALGORITHMS",
          question: "What is a binary search?",
          timestamp: "2024-03-15T12:00:00Z",
        },
        room2: {
          category: "ALGORITHMS",
          question: "Explain bubble sort",
          timestamp: "2024-03-15T10:00:00Z",
        },
      };

      mockGet.mockResolvedValueOnce({
        exists: () => true,
        val: () => mockData,
      });

      const response = await request(app)
        .post("/getUserHistoryByCategory")
        .send({
          userId: "testUser123",
          category: "ALGORITHMS",
        });

      expect(response.status).toBe(200);
      expect(response.body[0].timestamp).toBe("2024-03-15T12:00:00Z");
    });
  });
});
