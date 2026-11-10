import { Navigate } from "react-router-dom";

export default function RequireEmpleado({ children }) {
  const rol = localStorage.getItem("rol");
  return rol === "empleado" ? children : <Navigate to="/" replace />;
}