import db from "../../common/db/db.js";
import ApiError from "../../common/utils/api-error.js";
import {
    generateResetToken,
    generateAccessToken,
    generateRefreshToken,
} from "../../common/utils/jwt.utils.js";
import {
    comparePassword,
    hashPassword,
} from "../../common/utils/password.utils.js";

const register = async ({ name, email, password }) => {
    // 1. check existing user
    const existing = await db.query("SELECT 1 FROM users WHERE email = $1", [
        email,
    ]);

    if (existing.rowCount > 0) {
        throw ApiError.conflict("Email already exists");
    }

    // 2. generate verification token
    const { rawToken, hashedToken } = generateResetToken();

    // 3. hash password
    const hashedPassword = await hashPassword(password);

    // 4. insert user + RETURNING
    const result = await db.query(
        `INSERT INTO users(name, email, password, verificationToken)
         VALUES($1, $2, $3, $4)
         RETURNING id, name, email, createdAt`,
        [name, email, hashedPassword, hashedToken],
    );

    const user = result.rows[0];

    // 5. return safe data + raw token (email verification can be implimented further)
    return {
        user,
        verificationToken: rawToken,
    };
};

const login = async ({ email, password }) => {
    // 1. check if user exists
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
    ]);
    if (result.rowCount === 0)
        throw ApiError.unauthorized("Invalid Email/Password");

    const user = result.rows[0];
    console.log(user);
    

    // 2. check password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        throw ApiError.unauthorized("Invalid Email/Password");
    }

    // 3. generate tokens (access + refresh)
    const accessToken = generateAccessToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    // 4. store refresh token in DB
    await db.query("UPDATE users SET refreshToken = $1 WHERE id = $2", [
        refreshToken,
        user.id,
    ]);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        accessToken,
        refreshToken,
    };
};

const logout = async (userId) => {
    const result = await db.query(
        `UPDATE users 
         SET refreshToken = NULL 
         WHERE id = $1 
         RETURNING id, name, email`,
        [userId],
    );

    // 1. user not found
    if (result.rowCount === 0) {
        throw ApiError.notFound("User not found");
    }

    const user = result.rows[0];

    // 2. return clean response
    return {
        success: true,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        message: "Logged out successfully",
    };
};

export { register, login, logout };
