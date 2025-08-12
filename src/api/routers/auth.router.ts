import express from "express";
import { AuthController } from '../controllers';
import Middlewares from "../middlewares";

const AuthRouter = express.Router();

// auth related routes (open routes)
AuthRouter.post("/login", Middlewares.Security.authLimiter, Middlewares.UrlSession, Middlewares.CheckAccountLocked, AuthController.UserLogin);

AuthRouter.post("/signup", Middlewares.Security.authLimiter, Middlewares.UrlSession, AuthController.UserSignup);

AuthRouter.get("/google-login", Middlewares.UrlSession, Middlewares.CheckAccountLocked, AuthController.GoogleLogin);

AuthRouter.get("/facebook-login", Middlewares.UrlSession, Middlewares.CheckAccountLocked, AuthController.FacebookLogin);

AuthRouter.get("/google/callback", AuthController.GoogleAuthCallback);

AuthRouter.get("/facebook/callback", AuthController.FacebookAuthCallback);

AuthRouter.get("/login-status", AuthController.CheckLoginStatus);

AuthRouter.post("/forgot-password", Middlewares.Security.authLimiter, AuthController.ForgotPassword);

AuthRouter.post('/reset-password', Middlewares.Security.authLimiter, AuthController.ResetPassword);

// Verification and password management routes (protected routes)
AuthRouter.get("/logout", Middlewares.Auth.ensureAuthenticated, AuthController.UserLogout);

AuthRouter.get('/verify-email/:token', Middlewares.Auth.ensureAuthenticated, Middlewares.CheckUserStatus, AuthController.VerifyEmail);

AuthRouter.get('/resend-verification', Middlewares.Auth.ensureAuthenticated, Middlewares.CheckUserStatus, AuthController.ResendVerificationLink);

AuthRouter.post('/set-password', Middlewares.Auth.ensureAuthenticated, Middlewares.CheckUserStatus, AuthController.SetPassword);

AuthRouter.post('/change-password', Middlewares.Auth.ensureAuthenticated, Middlewares.CheckUserStatus, AuthController.ChangePassword);

export { AuthRouter };