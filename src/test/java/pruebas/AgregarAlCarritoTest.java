package pruebas;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class AgregarAlCarritoTest extends PruebaBase {

    @Test
    @DisplayName("AC-01 Agregar un producto al carrito")
    public void agregarUnProducto() {
        String mensaje = agregarDesdeProductos("Camiseta Home");
        abrirCarrito();
        espera.until(ExpectedConditions.visibilityOfElementLocated(itemCarrito("Camiseta Home")));

        assertEquals("Producto agregado al carrito", mensaje);
        assertEquals("Cantidad: 1", driver.findElement(cantidadDe("Camiseta Home")).getText());
    }

    @Test
    @DisplayName("AC-02 Agregar el mismo producto dos veces suma la cantidad")
    public void agregarMismoProductoDosVeces() {
        agregarDesdeProductos("Camiseta Home");
        String mensaje = agregarDesdeProductos("Camiseta Home");
        abrirCarrito();
        esperarCantidad("Camiseta Home", 2);

        assertEquals("Cantidad actualizada", mensaje);
        assertEquals(1, driver.findElements(itemCarrito("Camiseta Home")).size());
    }

    @Test
    @DisplayName("AC-03 Agregar el mismo producto tres veces da cantidad 3")
    public void agregarMismoProductoTresVeces() {
        agregarDesdeProductos("Botines Speed");
        agregarDesdeProductos("Botines Speed");
        agregarDesdeProductos("Botines Speed");
        abrirCarrito();
        esperarCantidad("Botines Speed", 3);

        assertEquals("Cantidad: 3", driver.findElement(cantidadDe("Botines Speed")).getText());
    }

    @Test
    @DisplayName("AC-04 Agregar dos productos distintos")
    public void agregarDosProductosDistintos() {
        agregarDesdeProductos("Camiseta Home");
        agregarDesdeProductos("Botines Speed");
        abrirCarrito();
        espera.until(ExpectedConditions.visibilityOfElementLocated(itemCarrito("Botines Speed")));

        assertEquals(2, driver.findElements(By.xpath("//div[h3]/button[text()='Eliminar']")).size());
        assertEquals("Cantidad: 1", driver.findElement(cantidadDe("Camiseta Home")).getText());
        assertEquals("Cantidad: 1", driver.findElement(cantidadDe("Botines Speed")).getText());
    }

    @Test
    @DisplayName("AC-05 El precio del producto en el carrito es el del catalogo")
    public void precioCorrectoEnCarrito() {
        agregarDesdeProductos("Camiseta Home");
        abrirCarrito();
        espera.until(ExpectedConditions.visibilityOfElementLocated(itemCarrito("Camiseta Home")));

        String textoItem = driver.findElement(itemCarrito("Camiseta Home")).getText();
        assertTrue(textoItem.contains("Precio: S/. 85.00"));
    }

    @Test
    @DisplayName("AC-06 El producto agregado sigue en el carrito al recargar la pagina")
    public void productoPersisteAlRecargar() {
        agregarDesdeProductos("Camiseta Home");
        abrirCarrito();
        espera.until(ExpectedConditions.visibilityOfElementLocated(itemCarrito("Camiseta Home")));
        driver.navigate().refresh();
        espera.until(ExpectedConditions.visibilityOfElementLocated(itemCarrito("Camiseta Home")));

        assertEquals("Cantidad: 1", driver.findElement(cantidadDe("Camiseta Home")).getText());
    }

    @Test
    @DisplayName("AC-07 Agregar sin sesion redirige al login")
    public void agregarSinSesion() {
        driver.get(urlBase + "/productos");
        cerrarSesion();
        driver.get(urlBase + "/productos");
        espera.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[text()='Buscar']"))).click();
        By boton = By.xpath("//div[h3[text()='Camiseta Home']]//button[text()='Agregar al carrito']");
        espera.until(ExpectedConditions.elementToBeClickable(boton)).click();
        espera.until(ExpectedConditions.urlContains("/login-user"));

        assertEquals(urlBase + "/login-user", driver.getCurrentUrl());
    }

    @Test
    @DisplayName("AC-08 Entrar a /carrito sin sesion redirige al inicio")
    public void carritoSinSesion() {
        cerrarSesion();
        driver.get(urlBase + "/carrito");
        espera.until(ExpectedConditions.urlToBe(urlBase + "/"));

        assertEquals(urlBase + "/", driver.getCurrentUrl());
        assertEquals(0, driver.findElements(By.xpath("//h1[text()='Mi carrito']")).size());
    }

    @Test
    @DisplayName("AC-09 Carrito sin productos muestra Carrito vacio")
    public void carritoVacio() throws Exception {
        abrirCarrito();
        Thread.sleep(1500);

        assertTrue(driver.findElement(By.xpath("//p[text()='Carrito vacío']")).isDisplayed());
        assertEquals(0, driver.findElements(By.xpath("//div[h3]")).size());
    }
}
