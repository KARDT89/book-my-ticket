import db from "../../common/db/db.js";
import ApiError from "../../common/utils/api-error.js";
import {
  generateResetToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.utils.js";
import {
  comparePassword,
  hashPassword,
  hashToken,
} from "../../common/utils/password.utils.js";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from "../../common/config/email.js";

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
    `INSERT INTO users(name, email, password, verificationtoken)
         VALUES($1, $2, $3, $4)
         RETURNING id, name, email, createdat`,
    [name, email, hashedPassword, hashedToken]
  );

  const user = result.rows[0];

  // 5. send an email to user with token: rawToken
  try {
    await sendVerificationEmail(email, rawToken);
  } catch (err) {
    console.error("Error sending verification email", err);
  }

  // 6. return safe data + raw token (email verification can be implimented further)
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
  // console.log(user);
  console.log(user);
  
  if(!user.isverified) throw ApiError.forbidden("Email not verified")

  // 2. check password
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid Email/Password");
  }

  // 3. generate tokens (access + refresh)
  const accessToken = generateAccessToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id });

  // 4. store refresh token in DB
  await db.query("UPDATE users SET refreshtoken = $1 WHERE id = $2", [
    hashToken(refreshToken),
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
         SET refreshtoken = NULL 
         WHERE id = $1 
         RETURNING id, name, email`,
    [userId]
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

const forgotPassword = async (email) => {
  // 1. Find user
  const result = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    throw ApiError.notFound("User not found");
  }

  const user = result.rows[0];

  // 2. Generate token
  const { rawToken, hashedToken } = generateResetToken();

  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  // 3. Update user
  await db.query(
    `UPDATE users 
     SET "resetpasswordtoken" = $1,
         "resetpasswordexpires" = $2,
         "updatedat" = CURRENT_TIMESTAMP
     WHERE id = $3`,
    [hashedToken, expires, user.id]
  );

  // 4. Send email
  await sendResetPasswordEmail(email, rawToken);
};

const resetPassword = async (token, newPassword) => {
  const hashedToken = await hashToken(token);

  // 1. Find user with valid (non-expired) token
  const result = await db.query(
    `SELECT * FROM users 
     WHERE "resetpasswordtoken" = $1
     AND "resetpasswordexpires" > NOW()`,
    [hashedToken]
  );

  if (result.rows.length === 0) {
    throw ApiError.badRequest("Invalid or expired token");
  }

  const user = result.rows[0];

  // 2. Hash password manually (IMPORTANT: no pre-save hook here)
  const hashedPassword = await hashPassword(newPassword);

  // 3. Update password + clear reset fields
  await db.query(
    `UPDATE users
     SET password = $1,
         "resetpasswordtoken" = NULL,
         "resetpasswordexpires" = NULL,
         "updatedat" = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [hashedPassword, user.id]
  );
};

const verifyEmail = async (token) => {
  const hashedToken = await hashToken(token);

  // 1. Find user
  const result = await db.query(
    `SELECT * FROM users 
     WHERE "verificationtoken" = $1`,
    [hashedToken]
  );

  if (result.rows.length === 0) {
    throw ApiError.badRequest("Invalid token");
  }

  const user = result.rows[0];

  // 2. Update user
  await db.query(
    `UPDATE users
     SET "isverified" = true,
         "verificationtoken" = NULL,
         "updatedat" = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [user.id]
  );

  return user;
};

const refresh = async (token) => {
  if (!token) {
    throw ApiError.unauthorized("Refresh token missing");
  }

  // 1. Verify JWT
  const decoded = verifyRefreshToken(token);

  // 2. Fetch user
  const result = await db.query(`SELECT * FROM users WHERE id = $1`, [
    decoded.id,
  ]);

  if (result.rows.length === 0) {
    throw ApiError.unauthorized("User not found");
  }

  const user = result.rows[0];

  // 3. Compare hashed refresh token
  const hashedToken = hashToken(token);

  if (user.refreshToken !== hashedToken) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  // 4. Generate new access token
  const accessToken = generateAccessToken({ id: user.id });

  return { accessToken };
};

export {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refresh,
};
