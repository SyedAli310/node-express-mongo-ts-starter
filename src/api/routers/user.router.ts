import express from "express";
import { UserController } from "../controllers";
import Utils from "../../utils";

const UserRouter = express.Router();

// Get logged in user
UserRouter.get("", Utils.asyncHandler(UserController.getLoggedInUser));

export { UserRouter };
