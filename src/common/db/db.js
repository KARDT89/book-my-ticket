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

export default pool;