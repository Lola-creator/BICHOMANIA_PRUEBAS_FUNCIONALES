package pruebas;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class EditarCarritoTest extends PruebaBase {

    @Test
    @DisplayName("ED-01 El boton + aumenta la cantidad de 1 a 2")
    public void botonMasAumenta() throws Exception {
        agregarPorApi(camisetaHome, 1);
        abrirCarrito();
        esperarCantidad("Camiseta Home", 1);
        driver.findElement(botonDe("Camiseta Home", "+")).click();
        esperarCantidad("Camiseta Home", 2);

        assertEquals("Cantidad: 2", driver.findElement(cantidadDe("Camiseta Home")).getText());
    }

    @Test
    @DisplayName("ED-02 El boton + dos veces seguidas da cantidad 3")
    public void botonMasDosVeces() throws Exception {
        agregarPorApi(camisetaHome, 1);
        abrirCarrito();
        esperarCantidad("Camiseta Home", 1);
        driver.findElement(botonDe("Camiseta Home", "+")).click();
        esperarCantidad("Camiseta Home", 2);
        driver.findElement(botonDe("Camiseta Home", "+")).click();
        esperarCantidad("Camiseta Home", 3);

        assertEquals("Cantidad: 3", driver.findElement(cantidadDe("Camiseta Home")).getText());
    }

    @Test
    @DisplayName("ED-03 El boton - disminuye la cantidad de 3 a 2")
    public void botonMenosDisminuye() throws Exception {
        agregarPorApi(camisetaHome, 3);
        abrirCarrito();
        esperarCantidad("Camiseta Home", 3);
        driver.findElement(botonDe("Camiseta Home", "-")).click();
        esperarCantidad("Camiseta Home", 2);

        assertEquals("Cantidad: 2", driver.findElement(cantidadDe("Camiseta Home")).getText());
    }

    @Test
    @DisplayName("ED-04 El boton - llega hasta cantidad 1 sin eliminar el producto")
    public void botonMenosLlegaAUno() throws Exception {
        agregarPorApi(camisetaHome, 2);
        abrirCarrito();
        esperarCantidad("Camiseta Home", 2);
        driver.findElement(botonDe("Camiseta Home", "-")).click();
        esperarCantidad("Camiseta Home", 1);

        assertEquals(1, driver.findElements(itemCarrito("Camiseta Home")).size());
        assertEquals("Cantidad: 1", driver.findElement(cantidadDe("Camiseta Home")).getText());
    }

    @Test
    @DisplayName("ED-05 El boton - con cantidad 1 elimina el producto")
    public void botonMenosEnUnoElimina() throws Exception {
        agregarPorApi(camisetaHome, 1);
        abrirCarrito();
        esperarCantidad("Camiseta Home", 1);
        driver.findElement(botonDe("Camiseta Home", "-")).click();
        espera.until(ExpectedConditions.invisibilityOfElementLocated(itemCarrito("Camiseta Home")));

        assertEquals(0, driver.findElements(itemCarrito("Camiseta Home")).size());
        assertTrue(driver.findElement(By.xpath("//p[text()='Carrito vacío']")).isDisplayed());
    }

    @Test
    @DisplayName("ED-06 El boton Eliminar quita el producto y muestra Carrito vacio")
    public void botonEliminar() throws Exception {
        agregarPorApi(botinesSpeed, 2);
        abrirCarrito();
        esperarCantidad("Botines Speed", 2);
        driver.findElement(botonDe("Botines Speed", "Eliminar")).click();
        espera.until(ExpectedConditions.invisibilityOfElementLocated(itemCarrito("Botines Speed")));

        assertTrue(driver.findElement(By.xpath("//p[text()='Carrito vacío']")).isDisplayed());
    }

    @Test
    @DisplayName("ED-07 Eliminar un producto deja el otro intacto")
    public void eliminarUnoDeDos() throws Exception {
        agregarPorApi(camisetaHome, 1);
        agregarPorApi(botinesSpeed, 2);
        abrirCarrito();
        esperarCantidad("Botines Speed", 2);
        driver.findElement(botonDe("Camiseta Home", "Eliminar")).click();
        espera.until(ExpectedConditions.invisibilityOfElementLocated(itemCarrito("Camiseta Home")));

        assertEquals(1, driver.findElements(itemCarrito("Botines Speed")).size());
        assertEquals("Cantidad: 2", driver.findElement(cantidadDe("Botines Speed")).getText());
    }

    @Test
    @DisplayName("ED-08 El boton + de un producto no cambia la cantidad del otro")
    public void masNoAfectaAlOtro() throws Exception {
        agregarPorApi(camisetaHome, 1);
        agregarPorApi(botinesSpeed, 1);
        abrirCarrito();
        esperarCantidad("Botines Speed", 1);
        driver.findElement(botonDe("Botines Speed", "+")).click();
        esperarCantidad("Botines Speed", 2);

        assertEquals("Cantidad: 1", driver.findElement(cantidadDe("Camiseta Home")).getText());
        assertEquals("Cantidad: 2", driver.findElement(cantidadDe("Botines Speed")).getText());
    }

    @Test
    @DisplayName("ED-09 Generar Pedido lleva a la pagina de pedidos")
    public void generarPedido() throws Exception {
        agregarPorApi(camisetaHome, 1);
        abrirCarrito();
        esperarCantidad("Camiseta Home", 1);
        driver.findElement(By.xpath("//button[text()='Generar Pedido']")).click();
        espera.until(ExpectedConditions.urlContains("/pedidos"));

        assertEquals(urlBase + "/pedidos", driver.getCurrentUrl());
    }

    @Test
    @DisplayName("ED-10 Generar Pedido con el carrito vacio igual lleva a pedidos")
    public void generarPedidoConCarritoVacio() throws Exception {
        agregarPorApi(camisetaHome, 1);
        abrirCarrito();
        esperarCantidad("Camiseta Home", 1);
        driver.findElement(botonDe("Camiseta Home", "Eliminar")).click();
        espera.until(ExpectedConditions.invisibilityOfElementLocated(itemCarrito("Camiseta Home")));
        driver.findElement(By.xpath("//button[text()='Generar Pedido']")).click();
        espera.until(ExpectedConditions.urlContains("/pedidos"));

        assertEquals(urlBase + "/pedidos", driver.getCurrentUrl());
    }
}
