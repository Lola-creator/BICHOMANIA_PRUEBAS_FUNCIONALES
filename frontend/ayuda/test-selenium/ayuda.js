const assert = require('node:assert/strict');
const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { TimeoutError } = require('selenium-webdriver/lib/error');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:3001';
const EMPLEADO_CORREO = process.env.EMPLEADO_CORREO || 'empleado@bichomania.com';
const EMPLEADO_PASSWORD = process.env.EMPLEADO_PASSWORD || 'empleado123';
const CLIENTE_CORREO = process.env.CLIENTE_CORREO || 'cliente@bichomania.com';
const CLIENTE_PASSWORD = process.env.CLIENTE_PASSWORD || 'cliente123';
const HEADLESS = process.env.HEADLESS === 'true';
const MAX_NOMBRE = parseInt(process.env.MAX_NOMBRE || '100', 10);
const PRECIO_MAX = process.env.PRECIO_MAX || '99999.99';

const MSG_OK_AGREGAR = 'Producto registrado correctamente';
const MSG_OBLIGATORIOS = 'Falta llenar campos obligatorios';
const MSG_NOMBRE_ESPACIOS = 'El nombre no puede contener solo espacios';
const MSG_PRECIO_MIN = 'El precio debe ser mayor que 0';
const MSG_PRECIO_MAX = `El precio no puede superar ${PRECIO_MAX}`;
const MSG_NOMBRE_LARGO = `El nombre no puede superar ${MAX_NOMBRE} caracteres`;
const MSG_NO_IMAGEN = 'El archivo debe ser una imagen';

const FORM_AGREGAR = By.xpath("//form[.//button[normalize-space()='Guardar producto']]");
const BTN_GUARDAR = By.xpath(".//button[normalize-space()='Guardar producto']");
const TITULOS = By.xpath("//div[contains(@class,'campo-Productos')]//h3");
const INPUT_BUSCAR = By.xpath(
  "//div[contains(@class,'campo-Productos')]//input[@placeholder='Buscar por nombre...']"
);
const BTN_BUSCAR = By.xpath(
  "//div[contains(@class,'opcion-producto')]//button[normalize-space()='Buscar']"
);

const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const estado = { driver: null, nombreCreado: null, cantidadAntes: null };

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function nombreUnico() {
  return `QA-${Date.now()}`;
}

function nombreDeLongitud(longitud) {
  return `${nombreUnico()}-${'N'.repeat(longitud)}`.slice(0, longitud);
}

function precioMasUnCentimo(precio) {
  return ((Math.round(parseFloat(precio) * 100) + 1) / 100).toFixed(2);
}

async function asegurarNavegador() {
  if (estado.driver) return;
  const opciones = new firefox.Options();
  if (HEADLESS) opciones.addArguments('-headless');
  estado.driver = await new Builder().forBrowser('firefox').setFirefoxOptions(opciones).build();
  await estado.driver.manage().window().setRect({ width: 1366, height: 900 });
}

async function cerrarNavegador() {
  if (!estado.driver) return;
  try {
    await estado.driver.quit();
  } finally {
    estado.driver = null;
  }
}

async function abrir(ruta) {
  await asegurarNavegador();
  await estado.driver.get(BASE_URL + ruta);
}

async function verificarServidor(nombre, url, ayuda) {
  try {
    await fetch(url);
  } catch (error) {
    throw new Error(`No se pudo conectar con ${nombre} (${url}). ${ayuda}`);
  }
}

async function listarProductos(nombre) {
  const consulta = nombre ? `?nombre=${encodeURIComponent(nombre)}` : '';
  const respuesta = await fetch(`${API_URL}/productos${consulta}`);
  return respuesta.json();
}

async function eliminarProductosPorNombre(nombre) {
  const productos = await listarProductos(nombre);
  for (const producto of productos) {
    if (producto.nombre_producto === nombre) {
      await fetch(`${API_URL}/productos/eliminar/${producto.id_producto}`, { method: 'DELETE' });
    }
  }
}

async function aceptarAlerta(milisegundos = 15000) {
  const { driver } = estado;
  await driver.wait(until.alertIsPresent(), milisegundos);
  const alerta = await driver.switchTo().alert();
  const texto = await alerta.getText();
  await alerta.accept();
  return texto;
}

async function aceptarAlertaSiAparece(segundos) {
  try {
    return await aceptarAlerta(segundos * 1000);
  } catch (error) {
    if (error instanceof TimeoutError) return null;
    throw error;
  }
}

async function iniciarSesion(rutaLogin, usuario, clave) {
  await abrir(rutaLogin);
  const { driver } = estado;
  const correo = await driver.wait(until.elementLocated(By.name('correo')), 15000);
  await correo.sendKeys(usuario);
  await driver.findElement(By.name('password')).sendKeys(clave);
  await driver.findElement(By.xpath("//button[normalize-space()='Ingresar']")).click();

  const alertaLogin = await aceptarAlertaSiAparece(2);
  if (alertaLogin) throw new Error(`El login falló: "${alertaLogin}"`);
  await driver.wait(async () => !(await driver.getCurrentUrl()).includes('/login'), 15000);
}

function iniciarSesionEmpleado() {
  return iniciarSesion('/login-employee', EMPLEADO_CORREO, EMPLEADO_PASSWORD);
}

function iniciarSesionCliente() {
  return iniciarSesion('/login-user', CLIENTE_CORREO, CLIENTE_PASSWORD);
}

async function escribir(campo, texto) {
  if (texto) await campo.sendKeys(texto);
}

async function seleccionarPrimeraOpcion(combo) {
  const { driver } = estado;
  await driver.wait(async () => (await combo.findElements(By.css('option'))).length > 1, 15000);
  const opciones = await combo.findElements(By.css('option'));
  await opciones[1].click();
}

async function llenarFormularioAgregar(nombre, precio, imagen) {
  const { driver } = estado;
  const form = await driver.wait(until.elementLocated(FORM_AGREGAR), 15000);
  await escribir(await form.findElement(By.name('nombre')), nombre);
  await escribir(
    await form.findElement(By.name('caracteristica')),
    'Producto creado por prueba automatizada'
  );
  await escribir(await form.findElement(By.name('precio')), precio);
  for (const lista of ['id_categoria', 'id_competencia', 'id_marca', 'id_equipo']) {
    await seleccionarPrimeraOpcion(await form.findElement(By.name(lista)));
  }
  if (imagen) await form.findElement(By.name('imagen')).sendKeys(imagen);
}

async function registrar(nombre, precio, imagen) {
  estado.nombreCreado = nombre && nombre.trim() !== '' ? nombre : null;
  estado.cantidadAntes = (await listarProductos()).length;
  await abrir('/productos/agregar');
  await llenarFormularioAgregar(nombre, precio, imagen);
  await estado.driver.findElement(FORM_AGREGAR).findElement(BTN_GUARDAR).click();
}

async function verificarNoCreado(motivo) {
  const despues = (await listarProductos()).length;
  assert.equal(despues, estado.cantidadAntes, `Se creó un producto que debía rechazarse (${motivo})`);
}

async function verificarRegistrado() {
  assert.equal(await aceptarAlerta(), MSG_OK_AGREGAR, 'El producto debería haberse registrado');
}

async function verificarRechazado(mensajeEsperado, motivo) {
  const alerta = await aceptarAlertaSiAparece(12);
  assert.notEqual(alerta, null, `No apareció ninguna alerta (${motivo})`);
  assert.equal(alerta, mensajeEsperado, `Rechazo por un motivo distinto (${motivo})`);
  await verificarNoCreado(motivo);
}

async function verificarBloqueoDelNavegador(motivo) {
  const alerta = await aceptarAlertaSiAparece(4);
  assert.equal(alerta, null, `No debía aparecer ninguna alerta (${motivo}), pero apareció: "${alerta}"`);
  await verificarNoCreado(motivo);
}

async function verificarCamposObligatorios() {
  assert.equal(await aceptarAlerta(), MSG_OBLIGATORIOS);
  await verificarNoCreado('campos obligatorios');
}

async function verificarFormularioNoDisponible(quien) {
  await abrir('/productos/agregar');
  await esperar(2000);
  const formularios = await estado.driver.findElements(FORM_AGREGAR);
  assert.equal(
    formularios.length,
    0,
    `${quien} no debería poder ver el formulario de Agregar producto`
  );
}

async function esperarListaEstable() {
  const { driver } = estado;
  await esperar(1000);
  let anterior = -1;
  let estables = 0;
  const limite = Date.now() + 15000;
  while (Date.now() < limite) {
    const actual = (await driver.findElements(TITULOS)).length;
    if (actual === anterior) {
      estables += 1;
      if (estables >= 3) return;
    } else {
      estables = 0;
      anterior = actual;
    }
    await esperar(400);
  }
}

async function buscarEnCatalogoPorNombre(nombre) {
  await abrir('/productos');
  const { driver } = estado;
  const caja = await driver.wait(until.elementLocated(INPUT_BUSCAR), 15000);
  await caja.sendKeys(nombre);
  await esperar(1500);
  await driver.findElement(BTN_BUSCAR).click();
  await esperarListaEstable();
}

async function existeTarjeta(nombre) {
  const tarjetas = await estado.driver.findElements(
    By.xpath(`//div[contains(@class,'campo-Productos')]//h3[normalize-space()='${nombre}']`)
  );
  return tarjetas.length > 0;
}

module.exports = {
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
  cerrarNavegador,
  verificarServidor,
  eliminarProductosPorNombre,
  iniciarSesionEmpleado,
  iniciarSesionCliente,
  registrar,
  verificarRegistrado,
  verificarRechazado,
  verificarBloqueoDelNavegador,
  verificarCamposObligatorios,
  verificarFormularioNoDisponible,
  buscarEnCatalogoPorNombre,
  existeTarjeta,
};
