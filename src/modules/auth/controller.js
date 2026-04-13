import * as authService from "./services.js";
import ApiResponse from "../../common/utils/api-response.js";

const register = async (req, res) => {
  const user = await authService.register(req.body);
  ApiResponse.created(res, "Registration success", user);
};

const login = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  ApiResponse.ok(res, "Login success", { user, accessToken, refreshToken });
};

const logout = async (req, res) => {
  const user = await authService.logout(req.user.id);
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  ApiResponse.ok(res, "Successfully logged out", user);
};

const verifyEmail = async (req, res) => {
  const user = await authService.verifyEmail(req.params.token);
  ApiResponse.ok(res, "Email verified successfully", user);
};

const forgotPassword = async (req, res) => {
  const user = await authService.forgotPassword(req.body.email);
  ApiResponse.ok(res, "Reset email sent", user);
};

const resetPassword = async (req, res) => {
  const user = await authService.resetPassword(
    req.params.token,
    req.body.password
  );
  ApiResponse.ok(res, "Password reset successful", user);
};

export const refresh = async (req, res, next) => {
  try {
    // token can come from cookies OR body (your choice)
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    const data = await authService.refresh(token);

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (err) {
    next(err);
  }
};

export {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refresh,
};
