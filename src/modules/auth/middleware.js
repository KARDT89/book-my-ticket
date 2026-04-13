import { verifyAccessToken } from "../../common/utils/jwt.utils.js";
import ApiError from "../../common/utils/api-error.js";
import db from "../../common/db/db.js";

const authenticate = async (req, res, next) => {
    let token;

    // 1. check cookies FIRST (browser flow)
    if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    }

    // 2. fallback to header (API tools like Postman)
    else if (req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.redirect("/login"); // browser-friendly
    }

    if (!token) throw ApiError.unauthorized("Not Authenticated");

    const decoded = verifyAccessToken(token);

    const result = await db.query("SELECT * from users WHERE id = $1", [
        decoded.id,
    ]);
    const user = result.rows[0];

    if (!user) throw ApiError.unauthorized("User no longer exists");

    req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        //role can be added for authorize
    };
    next();
};

export { authenticate };
