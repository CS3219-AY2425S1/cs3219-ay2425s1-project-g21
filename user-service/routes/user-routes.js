import express from "express";

import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  resetUserPassword,
  updateUser,
  updateUserPassword,
  updateUserPasswordForced,
  updateUserPrivilege,
} from "../controller/user-controller.js";
import { verifyAccessToken, verifyIsAdmin, verifyIsOwnerOrAdmin } from "../middleware/basic-access-control.js";

const router = express.Router();

router.get("/", verifyAccessToken, verifyIsAdmin, getAllUsers);

router.patch("/:id/privilege", verifyAccessToken, verifyIsAdmin, updateUserPrivilege);

router.post("/", createUser);

router.post("/reset-password", resetUserPassword);

router.get("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, getUser);

router.patch("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, updateUser);

router.patch("/:id/change-password", verifyAccessToken, verifyIsOwnerOrAdmin, updateUserPassword);

router.patch("/:id/force-change-password", verifyAccessToken, verifyIsOwnerOrAdmin, updateUserPasswordForced);

router.delete("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, deleteUser);

export default router;
