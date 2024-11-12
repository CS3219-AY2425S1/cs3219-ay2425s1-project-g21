import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";

dotenv.config();
const USER_SERVICE_URI =
  process.env.USER_SERVICE_URI || "http://user-service:3001";

export async function verifyJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.headers.authorization) {
    return res.status(401).json({
      message: "Authentication failed. Missing authorization header.",
    });
  }

  try {
    const response = await fetch(`${USER_SERVICE_URI}/auth/verify-token`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization,
      },
    });

    const data = await response.json();

    if (data.message !== "Token verified") {
      return res.status(401).json({
        message: "Authentication failed. Invalid token.",
      });
      // throw new Error(`JWT verification failed: ${data.message}`);
    }

    req.body.userId = data.data.id;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Failed to verify JWT",
    });
  }
}
