require("dotenv").config({ path: process.env.ENV_FILE || ".env.local" });
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const clientes = [
  { nombre: "Cliente", apellido: "Prueba", correo: "cliente@bichomania.com", clave: "cliente123", dni: "10000001" },
  { nombre: "Prueba", apellido: "Carrito", correo: "pruebacarrito@gmail.com", clave: "Prueba1234", dni: "12345678" },
];
const empleado = { nombre: "Empleado", apellido: "Prueba", correo: "empleado@bichomania.com", clave: "empleado123", dni: "20000001" };

async function principal() {
  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    ssl: process.env.DB_SSL !== "false" ? { rejectUnauthorized: false } : undefined,
  });

  for (const c of clientes) {
    const hash = await bcrypt.hash(c.clave, 10);
    const [existe] = await conexion.query("SELECT id_cliente FROM clientes WHERE correo_electronico = ?", [c.correo]);
    if (existe.length) {
      await conexion.query("UPDATE clientes SET contrasena = ? WHERE correo_electronico = ?", [hash, c.correo]);
    } else {
      await conexion.query(
        "INSERT INTO clientes (nombre, apellido_paterno, telefono, correo_electronico, dni, contrasena) VALUES (?, ?, ?, ?, ?, ?)",
        [c.nombre, c.apellido, "987654321", c.correo, c.dni, hash],
      );
    }
  }

  const hashEmpleado = await bcrypt.hash(empleado.clave, 10);
  const [hay] = await conexion.query("SELECT id_empleado FROM empleados WHERE correo_electronico = ?", [empleado.correo]);
  if (hay.length) {
    await conexion.query("UPDATE empleados SET contrasena = ? WHERE correo_electronico = ?", [hashEmpleado, empleado.correo]);
  } else {
    await conexion.query(
      "INSERT INTO empleados (nombre, apellido_paterno, telefono, correo_electronico, dni, sueldo, contrasena, cargo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [empleado.nombre, empleado.apellido, "987654322", empleado.correo, empleado.dni, 1500, hashEmpleado, "Administrador"],
    );
  }

  await conexion.end();
  console.log("usuarios de prueba listos");
}

principal().catch((error) => {
  console.error("error:", error.message);
  process.exit(1);
});
