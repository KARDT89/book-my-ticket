import { Router } from "express";
import * as controller from "./controller.js";
import { authenticate } from "./middleware.js";
import validate from "../../common/middleware/validate.middleware.js";

import RegisterDto from "./dto/register.dto.js";
import LoginDto from "./dto/login.dto.js";
import ResetPasswordDto from "./dto/reset-password.dto.js";
import verifyEmailDto from "./dto/verify-email.dto.js";

const router = Router();

router.post("/register", validate(RegisterDto), controller.register);
router.post("/login", validate(LoginDto), controller.login);
router.post("/logout", authenticate, controller.logout);
router.get(
  "/verify-email/:token",
  validate(verifyEmailDto),
  controller.verifyEmail
);
router.post("/forgot-password", controller.forgotPassword);
router.post(
  "/reset-password/:token",
  validate(ResetPasswordDto),
  controller.resetPassword
);
router.post("/refresh", controller.refresh);

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/forgot-password", (req, res) => {
  res.render("forgot-password");
});

router.get("/reset-password/:token", (req, res) => {
  res.render("reset-password");
});

router.get("/verify-email-notice", (req, res) => {
  res.render("verify-email-notice");
});

export default router;
