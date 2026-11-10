const Producto = require("../domain/Producto");
const { ErrorNoEncontrado, ErrorValidacion } = require("../domain/errores");

const MAX_NOMBRE = 100;
const PRECIO_MAX = 99999.99;

// nuevo = true: alta (exige relaciones e imagen). nuevo = false: edición (solo nombre y precio).
function validar(datos, { nuevo }) {
  const nombre = String(datos.nombre ?? "");
  const precioTxt = String(datos.precio ?? "");

  const faltan =
    !nombre || !precioTxt ||
    (nuevo && (!datos.idCategoria || !datos.idCompetencia ||
               !datos.idMarca || !datos.idEquipo || !datos.imagen));
  if (faltan) throw new ErrorValidacion("Falta llenar campos obligatorios");

  if (nombre.trim() === "")
    throw new ErrorValidacion("El nombre no puede contener solo espacios");
  if (nombre.trim().length > MAX_NOMBRE)
    throw new ErrorValidacion(`El nombre no puede superar ${MAX_NOMBRE} caracteres`);

  const precio = Number(precioTxt);
  if (Number.isNaN(precio) || precio <= 0)
    throw new ErrorValidacion("El precio debe ser mayor que 0");
  if (precio > PRECIO_MAX)
    throw new ErrorValidacion(`El precio no puede superar ${PRECIO_MAX}`);
}

class ProductoService {
  constructor(repositorio, almacenImagenes) {
    this.repositorio = repositorio;
    this.almacenImagenes = almacenImagenes;
  }

  async agregar(datos) {
    try {
      validar(datos, { nuevo: true });
    } catch (e) {
      this.almacenImagenes.eliminar(datos.imagen); // no dejar el archivo huérfano
      throw e;
    }
    const producto = new Producto({ ...datos, nombre: datos.nombre.trim() });
    const idProducto = await this.repositorio.crear(producto);
    return { message: "Producto registrado correctamente", id_producto: idProducto };
  }

  async editar(idProducto, datos, rutaImagenNueva) {
    try {
      validar(datos, { nuevo: false });
    } catch (e) {
      this.almacenImagenes.eliminar(rutaImagenNueva);
      throw e;
    }

    const actual = await this.repositorio.buscarPorId(idProducto);
    if (!actual) {
      this.almacenImagenes.eliminar(rutaImagenNueva);
      throw new ErrorNoEncontrado("Producto no encontrado");
    }

    const imagenAnterior = actual.imagen;
    const actualizado = new Producto({
      ...datos,
      nombre: datos.nombre.trim(),
      id: actual.id,
      imagen: rutaImagenNueva || imagenAnterior,
    });
    await this.repositorio.actualizar(actualizado);

    if (rutaImagenNueva) this.almacenImagenes.eliminar(imagenAnterior);
    return this.obtenerDetalle(idProducto); // EditarProducto.jsx necesita el producto actualizado
  }

  async eliminar(idProducto) {
    const producto = await this.repositorio.buscarPorId(idProducto);
    if (!producto) throw new ErrorNoEncontrado("Producto no encontrado");

    await this.repositorio.eliminar(idProducto);
    this.almacenImagenes.eliminar(producto.imagen);
    return { message: "Producto eliminado correctamente" };
  }

  listar(filtros) {
    return this.repositorio.listar(filtros);
  }

  async obtenerDetalle(idProducto) {
    const detalle = await this.repositorio.buscarDetalle(idProducto);
    if (!detalle) throw new ErrorNoEncontrado("Producto no encontrado");
    return detalle;
  }
}

module.exports = ProductoService;