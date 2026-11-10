const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { TimeoutError } = require('selenium-webdriver/lib/error');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const EMP_USER = process.env.EMP_USER || 'renato.apaza@gmail.com';
const EMP_PASS = process.env.EMP_PASS || 'paolo123';
const CLI_USER = process.env.CLI_USER || 'renatito_fumon@gmail.com';
const CLI_PASS = process.env.CLI_PASS || 'P@aole123';
const API_URL = process.env.API_URL || 'http://localhost:3001';
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
const H1_ELIMINAR = "//h1[normalize-space()='Eliminar Productos']";

const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

let driver;
let rutaImagenPng;
let rutaArchivoTexto;
let nombreCreado = null;

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
  if (driver) return;
  const opciones = new firefox.Options();
  if (HEADLESS) opciones.addArguments('-headless');
  driver = await new Builder().forBrowser('firefox').setFirefoxOptions(opciones).build();
  await driver.manage().window().setRect({ width: 1366, height: 900 });
}

async function abrir(ruta) {
  await asegurarNavegador();
  await driver.get(BASE_URL + ruta);
}

async function verificarServidor(nombre, url, ayuda) {
  try {
    await fetch(url);
  } catch (error) {
    throw new Error(`No se pudo conectar con ${nombre} (${url}). ${ayuda}`);
  }
}

async function aceptarAlerta(milisegundos = 15000) {
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
  const correo = await driver.wait(until.elementLocated(By.name('correo')), 15000);
  await correo.sendKeys(usuario);
  await driver.findElement(By.name('password')).sendKeys(clave);
  await driver.findElement(By.xpath("//button[normalize-space()='Ingresar']")).click();

  const alertaLogin = await aceptarAlertaSiAparece(2);
  if (alertaLogin) throw new Error(`El login falló: "${alertaLogin}"`);
  await driver.wait(async () => !(await driver.getCurrentUrl()).includes('/login'), 15000);
}

async function iniciarSesionEmpleado(t) {
  if (!EMP_USER || !EMP_PASS) {
    t.skip('Define EMP_USER y EMP_PASS');
    return false;
  }
  await iniciarSesion('/login-employee', EMP_USER, EMP_PASS);
  return true;
}

async function iniciarSesionCliente(t) {
  if (!CLI_USER || !CLI_PASS) {
    t.skip('Define CLI_USER y CLI_PASS');
    return false;
  }
  await iniciarSesion('/login-user', CLI_USER, CLI_PASS);
  return true;
}

async function escribir(campo, texto) {
  if (texto) await campo.sendKeys(texto);
}

async function seleccionarPrimeraOpcion(combo) {
  await driver.wait(async () => (await combo.findElements(By.css('option'))).length > 1, 15000);
  const opciones = await combo.findElements(By.css('option'));
  await opciones[1].click();
}

async function llenarFormularioAgregar(nombre, precio, imagen) {
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

async function guardarFormularioAgregar() {
  await driver.findElement(FORM_AGREGAR).findElement(BTN_GUARDAR).click();
}

async function registrar(nombre, precio, imagen) {
  nombreCreado = nombre && nombre.trim() !== '' ? nombre : null;
  await abrir('/productos/agregar');
  await llenarFormularioAgregar(nombre, precio, imagen);
  await guardarFormularioAgregar();
}

async function verificarRegistrado() {
  assert.equal(await aceptarAlerta(), MSG_OK_AGREGAR, 'El producto debería haberse registrado');
}

async function verificarRechazado(mensajeEsperado, motivo) {
  const alerta = await aceptarAlertaSiAparece(12);
  assert.notEqual(alerta, null, `No apareció ninguna alerta (${motivo})`);
  assert.equal(alerta, mensajeEsperado, `Rechazo por un motivo distinto (${motivo})`);
}

async function verificarSinAlerta(motivo) {
  const alerta = await aceptarAlertaSiAparece(4);
  assert.equal(
    alerta,
    null,
    `No debía aparecer ninguna alerta (${motivo}), pero apareció: "${alerta}"`
  );
}

async function verificarCamposObligatorios() {
  assert.equal(await aceptarAlerta(), MSG_OBLIGATORIOS);
}

async function verificarFormularioNoDisponible(quien) {
  await abrir('/productos/agregar');
  await esperar(2000);
  const formularios = await driver.findElements(FORM_AGREGAR);
  assert.equal(
    formularios.length,
    0,
    `${quien} no debería poder ver el formulario de Agregar producto`
  );
}

async function esperarListaEstable() {
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
  const caja = await driver.wait(until.elementLocated(INPUT_BUSCAR), 15000);
  await caja.sendKeys(nombre);
  await esperar(1500);
  await driver.findElement(BTN_BUSCAR).click();
  await esperarListaEstable();
}

async function existeTarjeta(nombre) {
  const tarjetas = await driver.findElements(
    By.xpath(`//div[contains(@class,'campo-Productos')]//h3[normalize-space()='${nombre}']`)
  );
  return tarjetas.length > 0;
}

async function eliminarProductoPorNombre(nombre) {
  await abrir('/productos/agregar');
  const caja = await driver.wait(
    until.elementLocated(
      By.xpath(`${H1_ELIMINAR}/following::input[@placeholder='Buscar por nombre...'][1]`)
    ),
    15000
  );
  await caja.sendKeys(nombre);
  await esperar(1000);
  await driver
    .findElement(By.xpath(`${H1_ELIMINAR}/following::button[normalize-space()='Buscar'][1]`))
    .click();

  const botonEliminar = By.xpath(
    `//h3[normalize-space()='${nombre}']/following::button[normalize-space()='ELIMINAR'][1]`
  );
  let boton;
  try {
    boton = await driver.wait(until.elementLocated(botonEliminar), 4000);
  } catch (error) {
    if (error instanceof TimeoutError) return false;
    throw error;
  }
  await boton.click();
  await aceptarAlerta();
  await aceptarAlerta();
  return true;
}

describe('Agregar producto (caja negra)', { timeout: 600000 }, () => {
  before(async () => {
    rutaImagenPng = path.join(os.tmpdir(), `bichomania-qa-${Date.now()}.png`);
    fs.writeFileSync(rutaImagenPng, Buffer.from(PNG_BASE64, 'base64'));
    rutaArchivoTexto = path.join(os.tmpdir(), `bichomania-qa-${Date.now()}.txt`);
    fs.writeFileSync(rutaArchivoTexto, 'este archivo no es una imagen');

    await verificarServidor('el frontend', BASE_URL, 'Levántalo con "npm start" en otra terminal.');
    await verificarServidor('el backend', `${API_URL}/listas`, 'Levántalo antes de correr las pruebas.');
  });

  after(() => {
    if (rutaImagenPng) fs.rmSync(rutaImagenPng, { force: true });
    if (rutaArchivoTexto) fs.rmSync(rutaArchivoTexto, { force: true });
  });

  beforeEach(() => {
    driver = null;
    nombreCreado = null;
  });

  afterEach(async () => {
    try {
      if (driver && nombreCreado) await eliminarProductoPorNombre(nombreCreado);
    } catch (error) {
      console.error(`No se pudo limpiar el producto '${nombreCreado}':`, error.message);
    } finally {
      if (driver) await driver.quit();
      driver = null;
    }
  });

  it('CP_1_1 Registrar producto válido y verlo en el catálogo', async (t) => {
    if (!(await iniciarSesionEmpleado(t))) return;
    const nombre = nombreUnico();

    await registrar(nombre, '99.90', rutaImagenPng);

    await verificarRegistrado();
    await buscarEnCatalogoPorNombre(nombre);
    assert.ok(await existeTarjeta(nombre), 'El producto registrado debería aparecer en el catálogo');
  });

  it('CP_2_1 Nombre vacío (clase inválida)', async (t) => {
    if (!(await iniciarSesionEmpleado(t))) return;
    await registrar('', '50', rutaImagenPng);
    await verificarCamposObligatorios();
  });

  it('CP_2_2 Nombre formado solo por espacios (clase inválida)', async (t) => {
    if (!(await iniciarSesionEmpleado(t))) return;
    await registrar('   ', '50', rutaImagenPng);
    await verificarRechazado(MSG_NOMBRE_ESPACIOS, 'nombre con solo espacios');
  });

  it('CP_3_1 Precio negativo = -10 (clase inválida: menor que 0)', async (t) => {
    if (!(await iniciarSesionEmpleado(t))) return;
    await registrar(nombreUnico(), '-10', rutaImagenPng);
    await verificarRechazado(MSG_PRECIO_MIN, 'precio -10');
  });

  it('CP_3_2 Precio no numérico = "abc" (clase inválida)', async (t) => {
    if (!(await iniciarSesionEmpleado(t))) return;
    await registrar(nombreUnico(), 'abc', rutaImagenPng);
    await verificarSinAlerta('precio no numérico');
  });

  it('CP_3_3 Precio vacío (clase inválida)', async (t) => {
    if (!(await iniciarSesionEmpleado(t))) return;
    await registrar(nombreUnico(), '', rutaImagenPng);
    await verificarCamposObligatorios();
  });

  it('CP_4_1 Precio = 0 (justo debajo del mínimo válido)', async (t) => {
    if (!(await iniciarSesionEmpleado(t))) return;
    await registrar(nombreUnico(), '0', rutaImagenPng);
    await verificarRechazado(MSG_PRECIO_MIN, 'precio 0');
  });

  it('CP_4_2 Precio = 0.01 (límite inferior válido)', async (t) => {
    if (!(await iniciarSesionEmpleado(t))) return;
    await registrar(nombreUnico(), '0.01', rutaImagenPng);
    await verificarRegistrado();
  });

  it('CP_4_3 Precio = máximo permitido (límite superior válido)', async (t) => {
    if (!(await iniciarSesionEmpleado(t))) return;
    await registrar(nombreUnico(), PRECIO_MAX, rutaImagenPng);
    await verificarRegistrado();
  });

  it('CP_4_4 Precio = máximo + 0.01 (justo encima del máximo válido)', async (t) => {
    if (!(await iniciarSesionEmpleado(t))) return;
    await registrar(nombreUnico(), precioMasUnCentimo(PRECIO_MAX), rutaImagenPng);
    await verificarRechazado(MSG_PRECIO_MAX, 'precio por encima del máximo');
  });

  it('CP_5_1 Usuario sin sesión intenta agregar un producto', async () => {
    await verificarFormularioNoDisponible('Un usuario sin sesión');
  });

  it('CP_5_2 Cliente autenticado (no empleado) intenta agregar un producto', async (t) => {
    if (!(await iniciarSesionCliente(t))) return;
    await verificarFormularioNoDisponible('Un cliente');
  });

  it('CP_6_1 Nombre de 1 carácter (límite inferior válido)', async (t) => {
    if (!(await iniciarSesionEmpleado(t))) return;
    await registrar(nombreDeLongitud(1), '50', rutaImagenPng);
    await verificarRegistrado();
  });

  it('CP_6_2 Nombre de longitud máxima (límite superior válido)', async (t) => {
    if (!(await iniciarSesionEmpleado(t))) return;
    await registrar(nombreDeLongitud(MAX_NOMBRE), '50', rutaImagenPng);
    await verificarRegistrado();
  });

  it('CP_6_3 Nombre de longitud máxima + 1 (justo encima del límite)', async (t) => {
    if (!(await iniciarSesionEmpleado(t))) return;
    await registrar(nombreDeLongitud(MAX_NOMBRE + 1), '50', rutaImagenPng);
    await verificarRechazado(MSG_NOMBRE_LARGO, 'nombre más largo que el máximo');
  });

  it('CP_7_1 Archivo que no es imagen (.txt) como imagen del producto', async (t) => {
    if (!(await iniciarSesionEmpleado(t))) return;
    await registrar(nombreUnico(), '50', rutaArchivoTexto);
    await verificarRechazado(MSG_NO_IMAGEN, 'archivo .txt como imagen');
  });
});