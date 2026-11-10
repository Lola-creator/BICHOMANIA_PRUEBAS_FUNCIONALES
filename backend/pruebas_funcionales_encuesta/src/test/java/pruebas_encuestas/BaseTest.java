package pruebas_encuestas;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public abstract class BaseTest {

    protected static final String BASE_URL = config("BASE_URL", "http://localhost:3000");
    protected static final String EMPLEADO_CORREO = config("EMPLEADO_CORREO", "empleado@bichomania.com");
    protected static final String EMPLEADO_PASSWORD = config("EMPLEADO_PASSWORD", "empleado123");
    protected static final String CLIENTE_CORREO = config("CLIENTE_CORREO", "cliente@bichomania.com");
    protected static final String CLIENTE_PASSWORD = config("CLIENTE_PASSWORD", "cliente123");

    protected static final String[] OPCION_A = { "Real Madrid", "LaLiga", "Camiseta" };
    protected static final String[] OPCION_B = { "Barcelona", "LaLiga", "Camiseta" };

    protected static final By INPUT_FECHA_INICIO = By.name("fecha_inicio");
    protected static final By INPUT_FECHA_FIN = By.name("fecha_fin");
    protected static final By INPUT_DESCRIPCION = By.name("descripcion");
    protected static final By INPUTS_EQUIPO = By.cssSelector("input[placeholder='Equipo']");
    protected static final By INPUTS_LIGA = By.cssSelector("input[placeholder='Liga']");
    protected static final By INPUTS_CATEGORIA = By.cssSelector("input[placeholder='Categoría']");
    protected static final By TITULO_FORMULARIO = By.xpath("//h3[normalize-space()='Crear nueva encuesta']");

    protected WebDriver driver;
    protected WebDriverWait wait;
    protected Path carpetaDescargas;
    protected final List<String> encuestasCreadas = new ArrayList<>();

    private static String config(String clave, String porDefecto) {
        String valor = System.getProperty(clave);
        if (valor == null || valor.isBlank()) {
            valor = System.getenv(clave);
        }
        return (valor == null || valor.isBlank()) ? porDefecto : valor;
    }

    @BeforeEach
    void iniciarNavegador() throws IOException {
        carpetaDescargas = Files.createTempDirectory("bichomania-descargas");

        ChromeOptions opciones = new ChromeOptions();
        opciones.addArguments("--window-size=1366,900", "--remote-allowed-origins=*",
                "--disable-features=PasswordLeakDetection,PasswordManagerOnboarding",
                "--disable-notifications", "--disable-infobars");
        if (Boolean.parseBoolean(config("HEADLESS", "false"))) {
            opciones.addArguments("--headless=new");
        }
        opciones.setExperimentalOption("prefs", Map.of(
                "download.default_directory", carpetaDescargas.toString(),
                "download.prompt_for_download", false,
                "profile.default_content_setting_values.automatic_downloads", 1,
                "credentials_enable_service", false,
                "profile.password_manager_enabled", false,
                "profile.password_manager_leak_detection", false));

        driver = new ChromeDriver(opciones);
        wait = new WebDriverWait(driver, Duration.ofSeconds(20));
    }

    @AfterEach
    void cerrarNavegador() {
        try {
            limpiarEncuestasCreadas();
        } catch (Exception ignorada) {
            // la limpieza es "mejor esfuerzo"
        } finally {
            if (driver != null) {
                driver.quit();
            }
        }
    }

    protected void enviarLogin(String ruta, String correo, String password) {
        driver.get(BASE_URL + ruta);
        WebElement campoCorreo = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("correo")));
        campoCorreo.clear();
        campoCorreo.sendKeys(correo);
        WebElement campoPassword = driver.findElement(By.name("password"));
        campoPassword.clear();
        campoPassword.sendKeys(password);
        driver.findElement(By.xpath("//button[normalize-space()='Ingresar']")).click();
    }

    protected void iniciarSesionEmpleado() {
        enviarLogin("/login-employee", EMPLEADO_CORREO, EMPLEADO_PASSWORD);
        wait.until(ExpectedConditions.urlContains("/encuestas"));
    }

    protected void iniciarSesionCliente() {
        enviarLogin("/login-user", CLIENTE_CORREO, CLIENTE_PASSWORD);
        wait.until(ExpectedConditions.urlContains("/productos"));
    }

    protected void cerrarSesion() {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        driver.navigate().refresh();
    }

    protected String aceptarAlerta() {
        Alert alerta = wait.until(ExpectedConditions.alertIsPresent());
        String texto = alerta.getText();
        alerta.accept();
        return texto;
    }

    protected String cancelarAlerta() {
        Alert alerta = wait.until(ExpectedConditions.alertIsPresent());
        String texto = alerta.getText();
        alerta.dismiss();
        return texto;
    }

    protected boolean hayAlerta() {
        try {
            driver.switchTo().alert();
            return true;
        } catch (NoAlertPresentException e) {
            return false;
        }
    }

    protected void abrirPanelEncuestas() {
        driver.get(BASE_URL + "/encuestas");
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h2[normalize-space()='Mis Encuestas']")));
    }

    protected void clickBoton(String texto) {
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[normalize-space()='" + texto + "']"))).click();
    }

    protected void abrirFormulario() {
        clickBoton("Crear Encuesta");
        wait.until(ExpectedConditions.visibilityOfElementLocated(TITULO_FORMULARIO));
    }

    protected void setInputJs(WebElement elemento, String valor) {
        ((JavascriptExecutor) driver).executeScript(
                "const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;"
                        + "setter.call(arguments[0], arguments[1]);"
                        + "arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
                elemento, valor);
    }

    private void escribirEn(By localizador, int indice, String valor) {
        if (valor == null || valor.isEmpty()) {
            return;
        }
        driver.findElements(localizador).get(indice).sendKeys(valor);
    }

    protected void llenarFormulario(String inicio, String fin, String descripcion, String[]... opciones) {
        WebElement campoInicio = wait.until(ExpectedConditions.visibilityOfElementLocated(INPUT_FECHA_INICIO));
        if (inicio != null) {
            setInputJs(campoInicio, inicio);
        }
        if (fin != null) {
            setInputJs(driver.findElement(INPUT_FECHA_FIN), fin);
        }
        WebElement campoDescripcion = driver.findElement(INPUT_DESCRIPCION);
        campoDescripcion.clear();
        if (descripcion != null) {
            campoDescripcion.sendKeys(descripcion);
        }

        while (driver.findElements(INPUTS_EQUIPO).size() < opciones.length) {
            clickBoton("+ Agregar opción");
        }
        for (int i = 0; i < opciones.length; i++) {
            escribirEn(INPUTS_EQUIPO, i, opciones[i][0]);
            escribirEn(INPUTS_LIGA, i, opciones[i][1]);
            escribirEn(INPUTS_CATEGORIA, i, opciones[i][2]);
        }
    }

    protected void guardarFormulario() {
        clickBoton("Guardar Encuesta");
    }

    protected String descripcionUnica(String base) {
        return base + " " + System.currentTimeMillis();
    }

    protected String hoy() {
        return LocalDate.now().toString();
    }

    protected String enDias(int dias) {
        return LocalDate.now().plusDays(dias).toString();
    }

    protected void crearEncuestaValida(String descripcion) {
        abrirPanelEncuestas();
        abrirFormulario();
        llenarFormulario(hoy(), enDias(7), descripcion, OPCION_A, OPCION_B);
        guardarFormulario();
        assertEquals("Encuesta creada correctamente", aceptarAlerta());
        esperarFila(descripcion);
        encuestasCreadas.add(descripcion);
    }

    protected By filaDe(String descripcion) {
        return By.xpath("//table//tr[td[normalize-space()='" + descripcion + "']]");
    }

    protected WebElement esperarFila(String descripcion) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(filaDe(descripcion)));
    }

    protected void esperarFilaAusente(String descripcion) {
        wait.until(ExpectedConditions.numberOfElementsToBe(filaDe(descripcion), 0));
    }

    protected String estadoDe(String descripcion) {
        return esperarFila(descripcion).findElement(By.xpath("./td[5]")).getText().trim();
    }

    protected By botonEnFila(String descripcion, String texto) {
        return By.xpath("//table//tr[td[normalize-space()='" + descripcion
                + "']]//button[normalize-space()='" + texto + "']");
    }

    protected void cerrarEncuestaComoEmpleado(String descripcion) {
        abrirPanelEncuestas();
        esperarFila(descripcion);
        driver.findElement(botonEnFila(descripcion, "Cerrar")).click();
        aceptarAlerta(); // confirm "¿Seguro deseas cerrar esta encuesta?"
        assertEquals("Encuesta cerrada", aceptarAlerta());
        wait.until(d -> "Cerrada".equals(estadoDe(descripcion)));
    }

    private boolean archivoListo(Path archivo) {
        try {
            return Files.exists(archivo) && Files.size(archivo) > 0;
        } catch (IOException e) {
            return false;
        }
    }

    protected Path esperarDescarga(String nombreArchivo) {
        Path destino = carpetaDescargas.resolve(nombreArchivo);
        new WebDriverWait(driver, Duration.ofSeconds(20))
                .until(d -> archivoListo(destino) || hayAlerta());
        if (hayAlerta()) {
            fail("Se mostró una alerta en lugar de descargar: " + aceptarAlerta());
        }
        assertTrue(archivoListo(destino), "No se descargó " + nombreArchivo);
        return destino;
    }

    protected void pausa(long milisegundos) {
        try {
            Thread.sleep(milisegundos);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void limpiarEncuestasCreadas() {
        if (encuestasCreadas.isEmpty()) {
            return;
        }
        cerrarSesion();
        iniciarSesionEmpleado();
        abrirPanelEncuestas();
        WebDriverWait esperaCorta = new WebDriverWait(driver, Duration.ofSeconds(5));
        for (String descripcion : new ArrayList<>(encuestasCreadas)) {
            try {
                esperaCorta.until(ExpectedConditions.visibilityOfElementLocated(filaDe(descripcion)));
                driver.findElement(botonEnFila(descripcion, "Eliminar")).click();
                aceptarAlerta(); // confirm
                aceptarAlerta(); // mensaje "Encuesta eliminada"
                esperarFilaAusente(descripcion);
            } catch (Exception ignorada) {
                // si ya no existe, continuar
            }
        }
        encuestasCreadas.clear();
    }
}