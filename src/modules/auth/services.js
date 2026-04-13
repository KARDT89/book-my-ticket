import db from "../../common/db/db.js";
import ApiError from "../../common/utils/api-error.js";
import { generateResetToken } from "../../common/utils/jwt.utils.js";
import { hashPassword } from "../../common/utils/password.utils.js";

const register = async ({ name, email, password }) => {
    // 1. check existing user
    const existing = await db.query("SELECT * FROM users WHERE email = $1", [email]);

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
        [name, email, hashedPassword, hashedToken]
    );

    const user = result.rows[0]

    // 5. return safe data + raw token (email verification can be implimented further)
    return {
        user,
        verificationToken: rawToken,
    };
};
