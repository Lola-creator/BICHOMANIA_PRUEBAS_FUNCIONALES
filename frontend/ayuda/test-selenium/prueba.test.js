const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ayuda = require('./ayuda');

const {
  estado,
  BASE_URL,
  API_URL,
  MAX_NOMBRE,
  PRECIO_MAX,
  PNG_BASE64,
  MSG_NOMBRE_ESPACIOS,
  MSG_PRECIO_MIN,
  MSG_PRECIO_MAX,
  MSG_NOMBRE_LARGO,
  MSG_NO_IMAGEN,
  nombreUnico,
  nombreDeLongitud,
  precioMasUnCentimo,
  registrar,
} = ayuda;

let rutaImagenPng;
let rutaArchivoTexto;

describe('Agregar producto (caja negra)', { timeout: 600000 }, () => {
  before(async () => {
    rutaImagenPng = path.join(os.tmpdir(), `bichomania-qa-${Date.now()}.png`);
    fs.writeFileSync(rutaImagenPng, Buffer.from(PNG_BASE64, 'base64'));
    rutaArchivoTexto = path.join(os.tmpdir(), `bichomania-qa-${Date.now()}.txt`);
    fs.writeFileSync(rutaArchivoTexto, 'este archivo no es una imagen');

    await ayuda.verificarServidor('el frontend', BASE_URL, 'Levántalo con "npm start" en otra terminal.');
    await ayuda.verificarServidor('el backend', `${API_URL}/listas`, 'Levántalo antes de correr las pruebas.');
  });

  after(() => {
    if (rutaImagenPng) fs.rmSync(rutaImagenPng, { force: true });
    if (rutaArchivoTexto) fs.rmSync(rutaArchivoTexto, { force: true });
  });

  beforeEach(() => {
    estado.driver = null;
    estado.nombreCreado = null;
    estado.cantidadAntes = null;
  });

  afterEach(async () => {
    try {
      if (estado.nombreCreado) await ayuda.eliminarProductosPorNombre(estado.nombreCreado);
    } catch (error) {
      console.error(`No se pudo limpiar el producto '${estado.nombreCreado}':`, error.message);
    } finally {
      await ayuda.cerrarNavegador();
    }
  });

  it('CP_1_1 Registrar producto válido y verlo en el catálogo', async () => {
    await ayuda.iniciarSesionEmpleado();
    const nombre = nombreUnico();

    await registrar(nombre, '99.90', rutaImagenPng);

    await ayuda.verificarRegistrado();
    await ayuda.buscarEnCatalogoPorNombre(nombre);
    assert.ok(await ayuda.existeTarjeta(nombre), 'El producto registrado debería aparecer en el catálogo');
  });

  it('CP_2_1 Nombre vacío (clase inválida)', async () => {
    await ayuda.iniciarSesionEmpleado();
    await registrar('', '50', rutaImagenPng);
    await ayuda.verificarCamposObligatorios();
  });

  it('CP_2_2 Nombre formado solo por espacios (clase inválida)', async () => {
    await ayuda.iniciarSesionEmpleado();
    await registrar('   ', '50', rutaImagenPng);
    await ayuda.verificarRechazado(MSG_NOMBRE_ESPACIOS, 'nombre con solo espacios');
  });

  it('CP_3_1 Precio negativo = -10 (clase inválida: menor que 0)', async () => {
    await ayuda.iniciarSesionEmpleado();
    await registrar(nombreUnico(), '-10', rutaImagenPng);
    await ayuda.verificarRechazado(MSG_PRECIO_MIN, 'precio -10');
  });

  it('CP_3_2 Precio no numérico = "abc" (clase inválida)', async () => {
    await ayuda.iniciarSesionEmpleado();
    await registrar(nombreUnico(), 'abc', rutaImagenPng);
    await ayuda.verificarBloqueoDelNavegador('precio no numérico');
  });

  it('CP_3_3 Precio vacío (clase inválida)', async () => {
    await ayuda.iniciarSesionEmpleado();
    await registrar(nombreUnico(), '', rutaImagenPng);
    await ayuda.verificarCamposObligatorios();
  });

  it('CP_4_1 Precio = 0 (justo debajo del mínimo válido)', async () => {
    await ayuda.iniciarSesionEmpleado();
    await registrar(nombreUnico(), '0', rutaImagenPng);
    await ayuda.verificarRechazado(MSG_PRECIO_MIN, 'precio 0');
  });

  it('CP_4_2 Precio = 0.01 (límite inferior válido)', async () => {
    await ayuda.iniciarSesionEmpleado();
    await registrar(nombreUnico(), '0.01', rutaImagenPng);
    await ayuda.verificarRegistrado();
  });

  it('CP_4_3 Precio = máximo permitido (límite superior válido)', async () => {
    await ayuda.iniciarSesionEmpleado();
    await registrar(nombreUnico(), PRECIO_MAX, rutaImagenPng);
    await ayuda.verificarRegistrado();
  });

  it('CP_4_4 Precio = máximo + 0.01 (justo encima del máximo válido)', async () => {
    await ayuda.iniciarSesionEmpleado();
    await registrar(nombreUnico(), precioMasUnCentimo(PRECIO_MAX), rutaImagenPng);
    await ayuda.verificarRechazado(MSG_PRECIO_MAX, 'precio por encima del máximo');
  });

  it('CP_5_1 Usuario sin sesión intenta agregar un producto', async () => {
    await ayuda.verificarFormularioNoDisponible('Un usuario sin sesión');
  });

  it('CP_5_2 Cliente autenticado (no empleado) intenta agregar un producto', async () => {
    await ayuda.iniciarSesionCliente();
    await ayuda.verificarFormularioNoDisponible('Un cliente');
  });

  it('CP_6_1 Nombre de 1 carácter (límite inferior válido)', async () => {
    await ayuda.iniciarSesionEmpleado();
    await registrar(nombreDeLongitud(1), '50', rutaImagenPng);
    await ayuda.verificarRegistrado();
  });

  it('CP_6_2 Nombre de longitud máxima (límite superior válido)', async () => {
    await ayuda.iniciarSesionEmpleado();
    await registrar(nombreDeLongitud(MAX_NOMBRE), '50', rutaImagenPng);
    await ayuda.verificarRegistrado();
  });

  it('CP_6_3 Nombre de longitud máxima + 1 (justo encima del límite)', async () => {
    await ayuda.iniciarSesionEmpleado();
    await registrar(nombreDeLongitud(MAX_NOMBRE + 1), '50', rutaImagenPng);
    await ayuda.verificarRechazado(MSG_NOMBRE_LARGO, 'nombre más largo que el máximo');
  });

  it('CP_7_1 Archivo que no es imagen (.txt) como imagen del producto', async () => {
    await ayuda.iniciarSesionEmpleado();
    await registrar(nombreUnico(), '50', rutaArchivoTexto);
    await ayuda.verificarRechazado(MSG_NO_IMAGEN, 'archivo .txt como imagen');
  });
});
