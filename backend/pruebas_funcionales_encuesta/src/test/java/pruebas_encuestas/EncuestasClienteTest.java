package pruebas_encuestas;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class EncuestasClienteTest extends BaseTest {

    private String prepararEncuestaActiva(String base) {
        String descripcion = descripcionUnica(base);
        iniciarSesionEmpleado();
        crearEncuestaValida(descripcion);
        cerrarSesion();
        return descripcion;
    }

    private By encuestaEnLista(String descripcion) {
        return By.xpath("//li[.//strong[normalize-space()='" + descripcion + "']]");
    }

    private By opcionEnDetalle(String equipo) {
        return By.xpath("//li[.//strong[normalize-space()='" + equipo + "']]");
    }

    private void abrirResponderEncuestas() {
        driver.get(BASE_URL + "/responder-encuestas");
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h2[normalize-space()='Encuestas Disponibles']")));
    }

    private void seleccionarEncuesta(String descripcion) {
        wait.until(ExpectedConditions.elementToBeClickable(encuestaEnLista(descripcion))).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h3[normalize-space()='" + descripcion + "']")));
    }

    @Test
    @DisplayName("CP24 - Login de cliente correcto redirige a /productos")
    public void cp24_loginClienteCorrecto() {
        iniciarSesionCliente();
        assertTrue(driver.getCurrentUrl().contains("/productos"));
    }

    @Test
    @DisplayName("CP25 - Login de cliente con contraseña incorrecta muestra error")
    public void cp25_loginClientePasswordIncorrecta() {
        enviarLogin("/login-user", CLIENTE_CORREO, "clave_incorrecta_123");
        assertEquals("Contraseña incorrecta", aceptarAlerta());
    }

    @Test
    @DisplayName("CP26 - Login de cliente con correo inexistente muestra error")
    public void cp26_loginClienteInexistente() {
        enviarLogin("/login-user", "no.existe@bichomania.com", "cualquiera");
        assertEquals("Usuario no encontrado", aceptarAlerta());
    }

    @Test
    @DisplayName("CP27 - El ícono de encuestas del header lleva a /responder-encuestas")
    public void cp27_iconoEncuestasHeader() {
        iniciarSesionCliente();
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//header//button[.//img[@alt='encuesta']]"))).click();
        wait.until(ExpectedConditions.urlContains("/responder-encuestas"));
        assertTrue(driver.findElement(By.xpath("//h2[normalize-space()='Encuestas Disponibles']")).isDisplayed());
    }

    @Test
    @DisplayName("CP28 - La lista muestra la encuesta activa con su descripción y fechas")
    public void cp28_listaMuestraEncuestaActiva() {
        String descripcion = prepararEncuestaActiva("Encuesta cliente lista");
        iniciarSesionCliente();
        abrirResponderEncuestas();

        wait.until(ExpectedConditions.visibilityOfElementLocated(encuestaEnLista(descripcion)));
        String texto = driver.findElement(encuestaEnLista(descripcion)).getText();
        assertTrue(texto.contains(hoy()), "No se muestra la fecha de inicio: " + texto);
        assertTrue(texto.contains(enDias(7)), "No se muestra la fecha de fin: " + texto);
    }

    @Test
    @DisplayName("CP29 - Seleccionar una encuesta muestra sus opciones (equipo, liga, categoría)")
    public void cp29_seleccionarMuestraOpciones() {
        String descripcion = prepararEncuestaActiva("Encuesta cliente detalle");
        iniciarSesionCliente();
        abrirResponderEncuestas();
        seleccionarEncuesta(descripcion);

        String opcionA = wait.until(ExpectedConditions.visibilityOfElementLocated(
                opcionEnDetalle("Real Madrid"))).getText();
        String opcionB = wait.until(ExpectedConditions.visibilityOfElementLocated(
                opcionEnDetalle("Barcelona"))).getText();
        assertTrue(opcionA.contains("LaLiga") && opcionA.contains("Camiseta"), "Opción A: " + opcionA);
        assertTrue(opcionB.contains("LaLiga") && opcionB.contains("Camiseta"), "Opción B: " + opcionB);
        assertTrue(driver.findElement(By.xpath("//button[normalize-space()='Volver']")).isDisplayed());
    }

    @Test
    @DisplayName("CP30 - El botón 'Volver' regresa a la lista de encuestas")
    public void cp30_volverALista() {
        String descripcion = prepararEncuestaActiva("Encuesta cliente volver");
        iniciarSesionCliente();
        abrirResponderEncuestas();
        seleccionarEncuesta(descripcion);

        clickBoton("Volver");
        wait.until(ExpectedConditions.visibilityOfElementLocated(encuestaEnLista(descripcion)));
        assertTrue(driver.findElements(By.xpath("//button[normalize-space()='Volver']")).isEmpty());
    }

    @Test
    @DisplayName("CP31 - Votar registra el voto y la encuesta desaparece de la lista")
    public void cp31_votarEncuesta() {
        String descripcion = prepararEncuestaActiva("Encuesta cliente votar");
        iniciarSesionCliente();
        abrirResponderEncuestas();
        seleccionarEncuesta(descripcion);

        wait.until(ExpectedConditions.elementToBeClickable(opcionEnDetalle("Real Madrid"))).click();
        assertEquals("¡Voto registrado!", aceptarAlerta());

        wait.until(ExpectedConditions.numberOfElementsToBe(encuestaEnLista(descripcion), 0));
        assertTrue(driver.findElements(By.xpath("//button[normalize-space()='Volver']")).isEmpty());
    }

    @Test
    @DisplayName("CP32 - Una encuesta ya votada no vuelve a aparecer al recargar")
    public void cp32_encuestaVotadaNoReaparece() {
        String descripcion = prepararEncuestaActiva("Encuesta cliente ya voto");
        iniciarSesionCliente();
        abrirResponderEncuestas();
        seleccionarEncuesta(descripcion);
        wait.until(ExpectedConditions.elementToBeClickable(opcionEnDetalle("Barcelona"))).click();
        aceptarAlerta();

        abrirResponderEncuestas();
        pausa(3000); // la lista se arma de forma asíncrona (una consulta por encuesta)
        assertTrue(driver.findElements(encuestaEnLista(descripcion)).isEmpty());
    }

    @Test
    @DisplayName("CP33 - Una encuesta cerrada no aparece al cliente")
    public void cp33_encuestaCerradaNoAparece() {
        String descripcion = prepararEncuestaActiva("Encuesta cliente cerrada");

        iniciarSesionEmpleado();
        cerrarEncuestaComoEmpleado(descripcion);
        cerrarSesion();

        iniciarSesionCliente();
        abrirResponderEncuestas();
        pausa(3000);
        assertTrue(driver.findElements(encuestaEnLista(descripcion)).isEmpty());
    }

    @Test
    @DisplayName("CP34 - El voto del cliente se refleja en 'Ver ganadora' del empleado")
    public void cp34_votoSeReflejaEnGanadora() {
        String descripcion = prepararEncuestaActiva("Encuesta integracion ganadora");

        iniciarSesionCliente();
        abrirResponderEncuestas();
        seleccionarEncuesta(descripcion);
        wait.until(ExpectedConditions.elementToBeClickable(opcionEnDetalle("Real Madrid"))).click();
        assertEquals("¡Voto registrado!", aceptarAlerta());
        cerrarSesion();

        iniciarSesionEmpleado();
        cerrarEncuestaComoEmpleado(descripcion);
        driver.findElement(botonEnFila(descripcion, "Ver ganadora")).click();
        String mensaje = aceptarAlerta();
        assertTrue(mensaje.contains("Ganadora: Real Madrid"), "Mensaje inesperado: " + mensaje);
        assertTrue(mensaje.contains("Votos: 1"), "Mensaje inesperado: " + mensaje);
    }
}
