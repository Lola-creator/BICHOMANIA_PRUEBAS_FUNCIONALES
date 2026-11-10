import React, { useState, useEffect } from "react";
import Eliminar from "./EliminarProducto";
import Editar from "./EditarProducto";

import './AP.css';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
const MAX_NOMBRE = 100;
const PRECIO_MAX = 99999.99;

const FORM_VACIO = {
  nombre: "",
  caracteristica: "",
  precio: "",
  id_categoria: "",
  id_competencia: "",
  id_marca: "",
  id_equipo: "",
  imagen: null,
};

export default function AgregarProducto() {
  const [categorias, setCategorias] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const res = await fetch(`${API_URL}/listas`);
        const data = await res.json();
        setCategorias(data.categorias);
        setCompetencias(data.competencias);
        setMarcas(data.marcas);
        setEquipos(data.equipos);
      } catch (err) {
        console.error("Error cargando listas:", err);
      }
    };
    fetchLists();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const agregarProducto = async (e) => {
    e.preventDefault();

    if (
      !form.nombre || !form.precio || !form.id_categoria ||
      !form.id_competencia || !form.id_marca || !form.id_equipo || !form.imagen
    ) {
      alert("Falta llenar campos obligatorios");
      return;
    }
    if (form.nombre.trim() === "") {
      alert("El nombre no puede contener solo espacios");
      return;
    }
    if (form.nombre.trim().length > MAX_NOMBRE) {
      alert(`El nombre no puede superar ${MAX_NOMBRE} caracteres`);
      return;
    }
    const precio = Number(form.precio);
    if (isNaN(precio) || precio <= 0) {
      alert("El precio debe ser mayor que 0");
      return;
    }
    if (precio > PRECIO_MAX) {
      alert(`El precio no puede superar ${PRECIO_MAX}`);
      return;
    }
    if (!form.imagen.type.startsWith("image/")) {
      alert("El archivo debe ser una imagen");
      return;
    }

    const data = new FormData();
    data.append("nombre", form.nombre.trim());
    data.append("caracteristica", form.caracteristica);
    data.append("precio", form.precio);
    data.append("id_categoria", form.id_categoria);
    data.append("id_competencia", form.id_competencia);
    data.append("id_marca", form.id_marca);
    data.append("id_equipo", form.id_equipo);
    data.append("imagen", form.imagen);

    try {
      const res = await fetch(`${API_URL}/productos/agregar`, {
        method: "POST",
        body: data, 
      });

      if (!res.ok) {
        const texto = await res.text();
        let mensaje = texto;
        try { mensaje = JSON.parse(texto).error || texto; } catch {}
        alert(mensaje || "Error al registrar");
        return;
      }

      alert("Producto registrado correctamente");
      setForm(FORM_VACIO);
    } catch (err) {
      console.error(err);
      alert("Error al registrar producto");
    }
  };

  return (
    <div
      className="home"
      style={{
        backgroundImage: "url('/registro/ap.jpg')",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <div className="content-AP">
        <h2>Agregar Producto</h2>

        <form
          onSubmit={agregarProducto}
          style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 500, border: "1px solid black", padding: 12 }}
        >
          <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
          <input name="caracteristica" placeholder="Característica" value={form.caracteristica} onChange={handleChange} />
          <input name="precio" type="number" step="0.01" placeholder="Precio" value={form.precio} onChange={handleChange} />

          <select name="id_categoria" value={form.id_categoria} onChange={handleChange}>
            <option value="">-- Seleccione categoría --</option>
            {categorias.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
            ))}
          </select>

          <select name="id_competencia" value={form.id_competencia} onChange={handleChange}>
            <option value="">-- Seleccione competencia --</option>
            {competencias.map((c) => (
              <option key={c.id_competencia} value={c.id_competencia}>{c.nombre}</option>
            ))}
          </select>

          <select name="id_marca" value={form.id_marca} onChange={handleChange}>
            <option value="">-- Seleccione marca --</option>
            {marcas.map((m) => (
              <option key={m.id_marca} value={m.id_marca}>{m.nombre}</option>
            ))}
          </select>

          <select name="id_equipo" value={form.id_equipo} onChange={handleChange}>
            <option value="">-- Seleccione equipo --</option>
            {equipos.map((e) => (
              <option key={e.id_equipo} value={e.id_equipo}>{e.nombre}</option>
            ))}
          </select>

          <input name="imagen" type="file" accept="image/*" onChange={handleChange} />
          <button type="submit">Guardar producto</button>
        </form>

        <Eliminar />
        <Editar />
      </div>
    </div>
  );
}