import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail as _findUserByEmail } from "../model/repository.js";
import { formatUserResponse } from "./user-controller.js";

export async function handleLogin(req, res) {
  const { email, password } = req.body;
  if (email && password) {
    try {
      const user = await _findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Wrong email and/or password" });
      }

      let match = await bcrypt.compare(password, user.password);
      let usingTempPassword = false;

      // Check if password matches; if not, check the temporary password
      if (!match && user.tempPassword) {
        const tempPasswordMatch = await bcrypt.compare(password, user.tempPassword);

        // Check if the temporary password is valid and was created within the last 24 hours
        const isTempPasswordValid = tempPasswordMatch && user.tempPasswordCreatedAt &&
          (new Date() - new Date(user.tempPasswordCreatedAt) < 24 * 60 * 60 * 1000);

        if (isTempPasswordValid) {
          match = true;
          usingTempPassword = true;
        }
      }

      if (!match) {
        return res.status(401).json({ message: "Wrong email and/or password" });
      }

      // If logged in using tempPassword, set mustUpdatePassword to true
      if (usingTempPassword) {
        user.mustUpdatePassword = true;
        await user.save();
      }

      const accessToken = jwt.sign({
        id: user.id,
      }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return res.status(200).json({
        message: "User logged in",
        data: { accessToken, mustUpdatePassword: user.mustUpdatePassword, ...formatUserResponse(user),
      }});
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    return res.status(400).json({ message: "Missing email and/or password" });
  }
}


export async function handleVerifyToken(req, res) {
  try {
    const verifiedUser = req.user;
    return res.status(200).json({ message: "Token verified", data: verifiedUser });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
