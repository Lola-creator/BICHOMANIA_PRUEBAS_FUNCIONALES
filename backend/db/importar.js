require("dotenv").config({ path: process.env.ENV_FILE || ".env.local" });
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function principal() {
  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 3306,
    multipleStatements: true,
  });
  const base = process.env.DB_NAME;
  await conexion.query(`DROP DATABASE IF EXISTS \`${base}\``);
  await conexion.query(`CREATE DATABASE \`${base}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
  await conexion.query(`USE \`${base}\``);
  for (const archivo of ["schema.sql", "seed.sql"]) {
    await conexion.query(fs.readFileSync(path.join(__dirname, archivo), "utf8"));
  }
  await conexion.end();
  console.log("base importada");
}

principal().catch((error) => {
  console.error("error:", error.message);
  process.exit(1);
});
