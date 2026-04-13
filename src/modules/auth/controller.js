import * as authService from "./services.js";
import ApiResponse from "../../common/utils/api-response.js";

const register = async (req, res) => {
    const user = await authService.register(req.body);
    ApiResponse.created(res, "Registration success", user);
};

const login = async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.login(
        req.body,
    );

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

export { register, login, logout };
