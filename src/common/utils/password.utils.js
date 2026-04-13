import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function hashPassword(clearTextPassword) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(clearTextPassword, salt);
  return hash;
}

export async function comparePassword(clearTextPassword, hash) {
  return await bcrypt.compare(clearTextPassword, hash);
}

export async function hashToken(token) {
  crypto.createHash("sha256").update(String(token)).digest("hex");
}
