import pg from "pg";

const pool = new pg.Pool({
  host: "localhost",
  port: 5431,
  user: "postgres",
  password: "postgres",
  database: "book_my_ticket",
  max: 20,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});

// const pool = new pg.Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
//   max: 5,
//   connectionTimeoutMillis: 0,
//   idleTimeoutMillis: 0,
// });

export default pool;
