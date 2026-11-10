package pruebas;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class PruebaBase {

    protected WebDriver driver;
    protected WebDriverWait espera;
    protected String urlBase = System.getProperty("urlBase", "http://localhost:3000");
    protected String urlApi = System.getProperty("urlApi", "http://localhost:3001");
    protected String correo = "pruebacarrito@gmail.com";
    protected String clave = "Prueba1234";
    protected String idCliente;
    protected int camisetaHome = 2;
    protected int botinesSpeed = 3;

    @BeforeEach
    public void iniciar() throws Exception {
        registrarCliente();
        ChromeOptions opciones = new ChromeOptions();
        if (Boolean.getBoolean("headless")) {
            opciones.addArguments("--headless=new");
        }
        opciones.addArguments("--window-size=1366,900");
        driver = new ChromeDriver(opciones);
        espera = new WebDriverWait(driver, Duration.ofSeconds(10));
        iniciarSesion();
        vaciarCarrito();
    }

    @AfterEach
    public void cerrar() {
        driver.quit();
    }

    protected void enviar(String metodo, String ruta, String json) throws Exception {
        HttpRequest pedido = HttpRequest.newBuilder()
                .uri(URI.create(urlApi + ruta))
                .header("Content-Type", "application/json")
                .method(metodo, HttpRequest.BodyPublishers.ofString(json))
                .build();
        HttpClient.newHttpClient().send(pedido, HttpResponse.BodyHandlers.ofString());
    }

    protected void registrarCliente() throws Exception {
        String json = "{\"correo_electronico\":\"" + correo + "\",\"nombre\":\"Prueba\","
                + "\"apellido_paterno\":\"Carrito\",\"telefono\":\"987654321\","
                + "\"dni\":\"12345678\",\"contrasena\":\"" + clave + "\"}";
        enviar("POST", "/registrar", json);
    }

    protected void iniciarSesion() {
        driver.get(urlBase + "/login-user");
        espera.until(ExpectedConditions.visibilityOfElementLocated(By.name("correo"))).sendKeys(correo);
        driver.findElement(By.name("password")).sendKeys(clave);
        driver.findElement(By.xpath("//button[text()='Ingresar']")).click();
        espera.until(ExpectedConditions.urlContains("/productos"));
        idCliente = (String) ((JavascriptExecutor) driver).executeScript("return localStorage.getItem('id_usuario')");
    }

    protected void cerrarSesion() {
        ((JavascriptExecutor) driver).executeScript("localStorage.clear()");
    }

    protected void vaciarCarrito() throws Exception {
        enviar("DELETE", "/carrito/vaciar", "{\"id_cliente\":\"" + idCliente + "\"}");
    }

    protected void agregarPorApi(int idProducto, int cantidad) throws Exception {
        String json = "{\"id_cliente\":\"" + idCliente + "\",\"id_producto\":" + idProducto
                + ",\"cantidad\":" + cantidad + "}";
        enviar("POST", "/carrito/agregar", json);
    }

    protected String agregarDesdeProductos(String nombre) {
        driver.get(urlBase + "/productos");
        espera.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[text()='Buscar']"))).click();
        By boton = By.xpath("//div[h3[text()='" + nombre + "']]//button[text()='Agregar al carrito']");
        espera.until(ExpectedConditions.elementToBeClickable(boton)).click();
        Alert alerta = espera.until(ExpectedConditions.alertIsPresent());
        String mensaje = alerta.getText();
        alerta.accept();
        return mensaje;
    }

    protected void abrirCarrito() {
        driver.get(urlBase + "/carrito");
        espera.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h1[text()='Mi carrito']")));
    }

    protected By itemCarrito(String nombre) {
        return By.xpath("//div[h3[text()='" + nombre + "']]");
    }

    protected By cantidadDe(String nombre) {
        return By.xpath("//div[h3[text()='" + nombre + "']]/p[starts-with(text(),'Cantidad')]");
    }

    protected By botonDe(String nombre, String texto) {
        return By.xpath("//div[h3[text()='" + nombre + "']]//button[text()='" + texto + "']");
    }

    protected void esperarCantidad(String nombre, int cantidad) {
        espera.until(ExpectedConditions.textToBe(cantidadDe(nombre), "Cantidad: " + cantidad));
    }
}
