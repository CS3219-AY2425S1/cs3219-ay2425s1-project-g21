import bcrypt from "bcryptjs";
import generatePassword from "generate-password"
import sgMail from "@sendgrid/mail"
import { isValidObjectId } from "mongoose";
import {
  createUser as _createUser,
  deleteUserById as _deleteUserById,
  findAllUsers as _findAllUsers,
  findUserByEmail as _findUserByEmail,
  findUserById as _findUserById,
  findUserByUsername as _findUserByUsername,
  findUserByUsernameOrEmail as _findUserByUsernameOrEmail,
  findUserByIdentifier as _findUserByIdentifier,
  updateUserById as _updateUserById,
  updateUserPrivilegeById as _updateUserPrivilegeById,
  updateUserPasswordById as _updateUserPasswordById,
  updateUserTempPasswordById as _updateUserTempPasswordById,
  updateUserPasswordByIdForced as _updateUserPasswordByIdForced,
} from "../model/repository.js";

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function createUser(req, res) {
  try {
    const { username, email, password } = req.body;
    if (username && email && password) {
      const existingUser = await _findUserByUsernameOrEmail(username, email);
      if (existingUser) {
        return res.status(409).json({ message: "username or email already exists" });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      const createdUser = await _createUser(username, email, hashedPassword);
      return res.status(201).json({
        message: `Created new user ${username} successfully`,
        data: formatUserResponse(createdUser),
      });
    } else {
      return res.status(400).json({ message: "username and/or email and/or password are missing" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when creating new user!" });
  }
}

export async function resetUserPassword(req, res) {
  try {
    const { identifier } = req.body;
    const user = await _findUserByIdentifier(identifier);

    // Check if the uesr exists
    if (!user) {
      return res.status(404).json({ message: `User ${identifier} not found` });
    }

    // Create temporary password
    const temporaryPassword = generatePassword.generate({
      length: 10,
      numbers: true,
    });
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(temporaryPassword, salt);

    // Set temporary password in the database
    const updatedUser = await _updateUserTempPasswordById(user.id, hashedPassword);
    if (!updatedUser) {
      return res.status(500).json({ message: "Unknown error when updating user!" });
    }

    // Email new temporary password to the user with SendGrid
    const msg = {
      to: user.email, // Recipient’s email
      from: 'no-reply@peerprep.help', // Verified sender email
      subject: 'Password Reset Request',
      text: `Your temporary password is: ${temporaryPassword}. Please log in and change your password immediately. The temporary password expires in 24 hours.`,
      html: `<p>Your temporary password is: <strong>${temporaryPassword}</strong></p><p>Please log in and change your password immediately.</p><p>The temporary password expires in 24 hours.</p>`,
    };
    await sgMail.send(msg);

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when resetting user password!" });
  }
}

export async function getUser(req, res) {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    const user = await _findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    } else {
      return res.status(200).json({ message: `Found user`, data: formatUserResponse(user) });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when getting user!" });
  }
}

export async function getUsername(req, res) {
  try {
    const { id: userId } = req.params; // Get userId from URL parameters

    console.log(`Retrieving username for user with ID: ${userId}`);

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch the user data based on userId
    const user = await _findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the username
    return res.status(200).json({ username: user.username });
  } catch (err) {
    console.error("Error retrieving username:", err);
    res.status(500).json({ error: "Failed to retrieve username" });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await _findAllUsers();

    return res.status(200).json({ message: `Found users`, data: users.map(formatUserResponse) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when getting all users!" });
  }
}

export async function updateUser(req, res) {
  try {
    const { username, email, password } = req.body;
    if (username || email || password) {
      const userId = req.params.id;
      if (!isValidObjectId(userId)) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }
      const user = await _findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }
      if (username || email) {
        let existingUser = await _findUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ message: "username already exists" });
        }
        existingUser = await _findUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ message: "email already exists" });
        }
      }

      let hashedPassword;
      if (password) {
        const salt = bcrypt.genSaltSync(10);
        hashedPassword = bcrypt.hashSync(password, salt);
      }
      const updatedUser = await _updateUserById(userId, username, email, hashedPassword);
      return res.status(200).json({
        message: `Updated data for user ${userId}`,
        data: formatUserResponse(updatedUser),
      });
    } else {
      return res.status(400).json({ message: "No field to update: username and email and password are all missing!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when updating user!" });
  }
}

export async function updateUserPrivilege(req, res) {
  try {
    const { isAdmin } = req.body;

    if (isAdmin !== undefined) {  // isAdmin can have boolean value true or false
      const userId = req.params.id;
      if (!isValidObjectId(userId)) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }
      const user = await _findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }

      const updatedUser = await _updateUserPrivilegeById(userId, isAdmin === true);
      return res.status(200).json({
        message: `Updated privilege for user ${userId}`,
        data: formatUserResponse(updatedUser),
      });
    } else {
      return res.status(400).json({ message: "isAdmin is missing!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when updating user privilege!" });
  }
}

export async function updateUserPassword(req, res) {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (oldPassword && newPassword && confirmPassword) {

      // Retrieve user information
      const userId = req.params.id;
      if (!isValidObjectId(userId)) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }
      const user = await _findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }

      // Handle different scenarios
      const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordCorrect) {
        return res.status(403).json({ message: "Old password is incorrect" });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "New passwords do not match" });
      }
      const isNewPasswordDifferent = await bcrypt.compare(newPassword, user.password);
      if (isNewPasswordDifferent) {
        return res.status(400).json({ message: "New password is the same as old password" });
      }
      // TODO: Check if the new password is secure.

      let hashedPassword;
      if (newPassword) {
        const salt = bcrypt.genSaltSync(10);
        hashedPassword = bcrypt.hashSync(newPassword, salt);
      }
      const updatedUser = await _updateUserPasswordById(userId, hashedPassword);
      return res.status(200).json({
        message: `Updated password for user ${userId}`,
        data: formatUserResponse(updatedUser),
      });
    } else {
      return res.status(400).json({ message: "No field to update: username and passwords (old, new, confirm) are missing!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when updating user password!" });
  }
}

export async function updateUserPasswordForced(req, res) {
  try {
    const { newPassword, confirmPassword } = req.body;
    if (newPassword && confirmPassword) {

      // Retrieve user information
      const userId = req.params.id;
      if (!isValidObjectId(userId)) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }
      const user = await _findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }

      // Handle different scenarios
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "New passwords do not match" });
      }
      // TODO: Check if the new password is secure.

      let hashedPassword;
      if (newPassword) {
        const salt = bcrypt.genSaltSync(10);
        hashedPassword = bcrypt.hashSync(newPassword, salt);
      }
      const updatedUser = await _updateUserPasswordByIdForced(userId, hashedPassword);
      return res.status(200).json({
        message: `Updated password for user ${userId}`,
        data: formatUserResponse(updatedUser),
      });
    } else {
      return res.status(400).json({ message: "No field to update: username and passwords (old, new, confirm) are missing!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when updating user password!" });
  }
}

export async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }
    const user = await _findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    await _deleteUserById(userId);
    return res.status(200).json({ message: `Deleted user ${userId} successfully` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when deleting user!" });
  }
}

export function formatUserResponse(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
  };
}
