import pg from "pg";
import "dotenv/config";

// const pool = new pg.Pool({
//   host: "localhost",
//   port: 5431,
//   user: "postgres",
//   password: "postgres",
//   database: "book_my_ticket",
//   max: 20,
//   connectionTimeoutMillis: 0,
//   idleTimeoutMillis: 0,
// });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

export default pool;
