const Pool = require('pg').Pool;

const pool = new Pool({
  user: "postgres",
  password: "docker1234",
  host: "localhost",
  port: 5432,
  database: "postgres-db-pern"
});

export default pool;