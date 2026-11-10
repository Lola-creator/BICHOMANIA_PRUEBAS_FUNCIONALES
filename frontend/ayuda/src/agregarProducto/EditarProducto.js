import { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
const MAX_NOMBRE = 100;
const PRECIO_MAX = 99999.99;

// Soporta rutas locales (/uploads/x.png) y URLs completas antiguas (Supabase)
const urlImagen = (img) => {
  if (!img) return "";
  return /^https?:\/\//i.test(img) ? img : `${API_URL}${img}`;
};

const mismoId = (a, b) => String(a) === String(b);

export default function EditarProducto() {
  const [categorias, setCategorias] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [marcas, setMarcas] = useState([]);

  const [productos, setProductos] = useState([]);
  const [productoEditado, setProductoEditado] = useState(null);
  const [productoEditando, setProductoEditando] = useState(null);

  const [filtros, setFiltros] = useState({
    nombre: "",
    categoria: "",
    competencia: "",
    equipo: "",
    marca: "",
  });

  useEffect(() => {
    fetch(`${API_URL}/listas`)
      .then((res) => res.json())
      .then((data) => {
        setCategorias(data.categorias);
        setCompetencias(data.competencias);
        setEquipos(data.equipos);
        setMarcas(data.marcas);
      })
      .catch((err) => console.error("Error cargando listas:", err));
  }, []);

  const buscarProductos = () => {
    const params = new URLSearchParams(filtros).toString();
    fetch(`${API_URL}/productos?${params}`)
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error(err));
  };

  const seleccionarParaEditar = (prod) => {
    const cat = categorias.find((c) => c.nombre === prod.categoria);
    const comp = competencias.find((c) => c.nombre === prod.competencia);
    const mar = marcas.find((m) => m.nombre === prod.marca);
    const equi = equipos.find((e) => e.nombre === prod.equipo);

    setProductoEditando({
      id_producto: prod.id_producto,
      nombre: prod.nombre_producto,
      precio: prod.precio,
      caracteristica: prod.caracteristica,
      id_categoria: cat ? cat.id_categoria : "",
      id_competencia: comp ? comp.id_competencia : "",
      id_marca: mar ? mar.id_marca : "",
      id_equipo: equi ? equi.id_equipo : "",
      imagen: prod.imagen,
      categoria: prod.categoria,
      competencia: prod.competencia,
      marca: prod.marca,
      equipo: prod.equipo,
    });
    setProductoEditado(null);
  };

  const guardarCambios = async (e) => {
    e.preventDefault();

    const nombre = String(productoEditando.nombre ?? "");
    const precioTexto = String(productoEditando.precio ?? "");

    if (nombre === "" || precioTexto === "") {
      alert("Falta llenar campos obligatorios");
      return;
    }
    if (nombre.trim() === "") {
      alert("El nombre no puede contener solo espacios");
      return;
    }
    if (nombre.trim().length > MAX_NOMBRE) {
      alert(`El nombre no puede superar ${MAX_NOMBRE} caracteres`);
      return;
    }
    const precio = Number(precioTexto);
    if (isNaN(precio) || precio <= 0) {
      alert("El precio debe ser mayor que 0");
      return;
    }
    if (precio > PRECIO_MAX) {
      alert(`El precio no puede superar ${PRECIO_MAX}`);
      return;
    }
    if (productoEditando.nuevaImagen && !productoEditando.nuevaImagen.type.startsWith("image/")) {
      alert("El archivo debe ser una imagen");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre.trim());

    if (productoEditando.caracteristica && productoEditando.caracteristica.trim() !== "") {
      formData.append("caracteristica", productoEditando.caracteristica);
    }
    formData.append("precio", precioTexto);

    if (productoEditando.id_categoria) formData.append("id_categoria", productoEditando.id_categoria);
    if (productoEditando.id_competencia) formData.append("id_competencia", productoEditando.id_competencia);
    if (productoEditando.id_marca) formData.append("id_marca", productoEditando.id_marca);
    if (productoEditando.id_equipo) formData.append("id_equipo", productoEditando.id_equipo);
    if (productoEditando.nuevaImagen) formData.append("imagen", productoEditando.nuevaImagen);

    try {
      const res = await fetch(`${API_URL}/productos/editar/${productoEditando.id_producto}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const texto = await res.text();
        let mensaje = texto;
        try { mensaje = JSON.parse(texto).error || texto; } catch {}
        alert(mensaje || "Error al actualizar el producto");
        return;
      }

      const data = await res.json();

      alert("Producto actualizado correctamente");
      setProductoEditado(data);

      setProductoEditando((prev) => ({
        ...prev,
        nombre: data.nombre_producto,
        precio: data.precio,
        caracteristica: data.caracteristica,
        id_categoria: data.id_categoria,
        id_competencia: data.id_competencia,
        id_marca: data.id_marca,
        id_equipo: data.id_equipo,
        imagen: data.imagen,
        categoria: data.categoria,
        competencia: data.competencia,
        marca: data.marca,
        equipo: data.equipo,
        nuevaImagen: null,
      }));
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el producto");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Editar Producto</h1>

      {!productoEditando && (
        <>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input
              placeholder="Buscar por nombre"
              value={filtros.nombre}
              onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
            />

            <select onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}>
              <option value="">Categoría</option>
              {categorias.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
              ))}
            </select>

            <select onChange={(e) => setFiltros({ ...filtros, competencia: e.target.value })}>
              <option value="">Competencia</option>
              {competencias.map((x) => (
                <option key={x.id_competencia} value={x.id_competencia}>{x.nombre}</option>
              ))}
            </select>

            <select onChange={(e) => setFiltros({ ...filtros, equipo: e.target.value })}>
              <option value="">Equipo</option>
              {equipos.map((e) => (
                <option key={e.id_equipo} value={e.id_equipo}>{e.nombre}</option>
              ))}
            </select>

            <select onChange={(e) => setFiltros({ ...filtros, marca: e.target.value })}>
              <option value="">Marca</option>
              {marcas.map((m) => (
                <option key={m.id_marca} value={m.id_marca}>{m.nombre}</option>
              ))}
            </select>

            <button onClick={buscarProductos}>Buscar</button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {productos.map((p) => (
              <div
                key={p.id_producto}
                style={{ width: "200px", padding: "10px", border: "1px solid #ddd", borderRadius: "10px" }}
              >
                <img
                  src={urlImagen(p.imagen)}
                  alt={p.nombre_producto}
                  style={{ width: "100%", height: "150px", objectFit: "cover" }}
                />
                <h3>{p.nombre_producto}</h3>
                <p>S/. {p.precio}</p>
                <button
                  onClick={() => seleccionarParaEditar(p)}
                  style={{ width: "100%", padding: "8px", background: "blue", color: "white" }}
                >
                  EDITAR
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {productoEditando && (
        <div style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
          <div style={{ border: "1px solid #ccc", borderRadius: "10px", padding: "20px" }}>
            <h2>Detalles actuales</h2>

            <p><strong>Nombre:</strong> {productoEditando.nombre}</p>
            <p><strong>Precio:</strong> S/. {productoEditando.precio}</p>
            <p><strong>Categoría:</strong> {categorias.find((c) => mismoId(c.id_categoria, productoEditando.id_categoria))?.nombre}</p>
            <p><strong>Competencia:</strong> {competencias.find((x) => mismoId(x.id_competencia, productoEditando.id_competencia))?.nombre}</p>
            <p><strong>Equipo:</strong> {equipos.find((e) => mismoId(e.id_equipo, productoEditando.id_equipo))?.nombre}</p>
            <p><strong>Marca:</strong> {marcas.find((m) => mismoId(m.id_marca, productoEditando.id_marca))?.nombre}</p>
            <p><strong>Características:</strong> {productoEditando.caracteristica}</p>

            <img
              src={urlImagen(productoEditando.imagen)}
              alt={productoEditando.nombre}
              style={{ width: "100%", marginTop: "10px", borderRadius: "10px" }}
            />
          </div>

          <form
            onSubmit={guardarCambios}
            style={{ display: "grid", gap: "10px", border: "1px solid #ccc", borderRadius: "10px", padding: "20px" }}
          >
            <h2>Editar producto</h2>

            <input
              name="nombre"
              value={productoEditando.nombre}
              onChange={(e) => setProductoEditando({ ...productoEditando, nombre: e.target.value })}
              placeholder="Nombre"
            />

            <textarea
              name="caracteristica"
              value={productoEditando.caracteristica}
              onChange={(e) => setProductoEditando({ ...productoEditando, caracteristica: e.target.value })}
              placeholder="Características"
            />

            <input
              name="precio"
              type="number"
              step="0.01"
              value={productoEditando.precio}
              onChange={(e) => setProductoEditando({ ...productoEditando, precio: e.target.value })}
              placeholder="Precio"
            />

            <select
              value={productoEditando.id_categoria}
              onChange={(e) => setProductoEditando({ ...productoEditando, id_categoria: e.target.value })}
            >
              <option value="">Categoría</option>
              {categorias.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
              ))}
            </select>

            <select
              value={productoEditando.id_competencia}
              onChange={(e) => setProductoEditando({ ...productoEditando, id_competencia: e.target.value })}
            >
              <option value="">Competencia</option>
              {competencias.map((x) => (
                <option key={x.id_competencia} value={x.id_competencia}>{x.nombre}</option>
              ))}
            </select>

            <select
              value={productoEditando.id_equipo}
              onChange={(e) => setProductoEditando({ ...productoEditando, id_equipo: e.target.value })}
            >
              <option value="">Equipo</option>
              {equipos.map((e) => (
                <option key={e.id_equipo} value={e.id_equipo}>{e.nombre}</option>
              ))}
            </select>

            <select
              value={productoEditando.id_marca}
              onChange={(e) => setProductoEditando({ ...productoEditando, id_marca: e.target.value })}
            >
              <option value="">Marca</option>
              {marcas.map((m) => (
                <option key={m.id_marca} value={m.id_marca}>{m.nombre}</option>
              ))}
            </select>

            <input
              type="file"
              name="imagen"
              accept="image/*"
              onChange={(e) =>
                setProductoEditando({ ...productoEditando, nuevaImagen: e.target.files[0] })
              }
            />

            <button type="submit" style={{ padding: "10px", background: "green", color: "white" }}>
              Guardar cambios
            </button>

            <button
              type="button"
              style={{ padding: "10px", background: "gray", color: "white" }}
              onClick={() => setProductoEditando(null)}
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {productoEditado && (
        <div
          style={{
            marginTop: "50px",
            padding: "20px",
            border: "2px solid green",
            borderRadius: "10px",
            background: "#e8ffe8",
          }}
        >
          <h2>Producto actualizado</h2>

          <p><strong>Nombre:</strong> {productoEditado.nombre_producto}</p>
          <p><strong>Precio:</strong> S/. {productoEditado.precio}</p>
          <p><strong>Categoría:</strong> {categorias.find((c) => mismoId(c.id_categoria, productoEditado.id_categoria))?.nombre}</p>
          <p><strong>Competencia:</strong> {competencias.find((x) => mismoId(x.id_competencia, productoEditado.id_competencia))?.nombre}</p>
          <p><strong>Equipo:</strong> {equipos.find((e) => mismoId(e.id_equipo, productoEditado.id_equipo))?.nombre}</p>
          <p><strong>Marca:</strong> {marcas.find((m) => mismoId(m.id_marca, productoEditado.id_marca))?.nombre}</p>
          <p><strong>Características:</strong> {productoEditado.caracteristica}</p>

          <img
            src={urlImagen(productoEditado.imagen)}
            alt={productoEditado.nombre_producto}
            style={{ width: "200px", marginTop: "10px", borderRadius: "10px" }}
          />
        </div>
      )}
    </div>
  );
}