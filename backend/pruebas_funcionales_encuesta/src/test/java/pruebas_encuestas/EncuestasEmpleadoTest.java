package pruebas_encuestas;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class EncuestasEmpleadoTest extends BaseTest {

    @Test
    @DisplayName("CP01 - Login de empleado correcto redirige al panel de encuestas")
    public void cp01_loginEmpleadoCorrecto() {
        iniciarSesionEmpleado();
        assertTrue(driver.getCurrentUrl().contains("/encuestas"));
        assertTrue(driver.findElement(By.xpath("//h2[normalize-space()='Mis Encuestas']")).isDisplayed());
    }

    @Test
    @DisplayName("CP02 - Login de empleado con contraseña incorrecta muestra error")
    public void cp02_loginEmpleadoPasswordIncorrecta() {
        enviarLogin("/login-employee", EMPLEADO_CORREO, "clave_incorrecta_123");
        assertEquals("Contraseña incorrecta", aceptarAlerta());
        assertTrue(driver.getCurrentUrl().contains("/login-employee"));
    }

    @Test
    @DisplayName("CP03 - Login de empleado con correo inexistente muestra error")
    public void cp03_loginEmpleadoCorreoInexistente() {
        enviarLogin("/login-employee", "no.existe@bichomania.com", "cualquiera");
        assertEquals("Empleado no encontrado", aceptarAlerta());
    }

    @Test
    @DisplayName("CP04 - Panel sin sesión de empleado no muestra encuestas")
    public void cp04_panelSinSesion() {
        cerrarSesion();
        driver.get(BASE_URL + "/encuestas");
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//p[normalize-space()='No hay encuestas para mostrar.']")));
    }

    @Test
    @DisplayName("CP05 - Mostrar y ocultar (Cancelar) el formulario de creación")
    public void cp05_mostrarYCancelarFormulario() {
        iniciarSesionEmpleado();
        abrirPanelEncuestas();
        abrirFormulario();
        assertTrue(driver.findElement(By.xpath("//button[normalize-space()='Cancelar']")).isDisplayed());

        clickBoton("Cancelar");
        wait.until(ExpectedConditions.invisibilityOfElementLocated(TITULO_FORMULARIO));
        assertTrue(driver.findElement(By.xpath("//button[normalize-space()='Crear Encuesta']")).isDisplayed());
    }

    @Test
    @DisplayName("CP06 - El botón '+ Agregar opción' añade filas de opciones")
    public void cp06_agregarOpciones() {
        iniciarSesionEmpleado();
        abrirPanelEncuestas();
        abrirFormulario();
        assertEquals(1, driver.findElements(INPUTS_EQUIPO).size());

        clickBoton("+ Agregar opción");
        assertEquals(2, driver.findElements(INPUTS_EQUIPO).size());

        clickBoton("+ Agregar opción");
        assertEquals(3, driver.findElements(INPUTS_EQUIPO).size());
        assertEquals(3, driver.findElements(INPUTS_LIGA).size());
        assertEquals(3, driver.findElements(INPUTS_CATEGORIA).size());
    }

    @Test
    @DisplayName("CP07 - Crear encuesta válida (2 opciones) queda Activa en la tabla")
    public void cp07_crearEncuestaValida() {
        iniciarSesionEmpleado();
        String descripcion = descripcionUnica("Encuesta QA valida");
        crearEncuestaValida(descripcion);

        assertEquals("Activa", estadoDe(descripcion));
        assertTrue(driver.findElement(botonEnFila(descripcion, "Eliminar")).isDisplayed());
        assertTrue(driver.findElement(botonEnFila(descripcion, "Cerrar")).isDisplayed());
        assertTrue(driver.findElements(botonEnFila(descripcion, "Ver ganadora")).isEmpty());
        // el formulario se oculta tras guardar
        assertTrue(driver.findElements(TITULO_FORMULARIO).isEmpty());
    }

    @Test
    @DisplayName("CP08 - Crear encuesta sin descripción muestra 'Faltan datos de la encuesta'")
    public void cp08_crearSinDescripcion() {
        iniciarSesionEmpleado();
        abrirPanelEncuestas();
        abrirFormulario();
        llenarFormulario(hoy(), enDias(7), "", OPCION_A, OPCION_B);
        guardarFormulario();
        assertEquals("Faltan datos de la encuesta", aceptarAlerta());
    }

    @Test
    @DisplayName("CP09 - Crear encuesta sin fechas muestra 'Faltan datos de la encuesta'")
    public void cp09_crearSinFechas() {
        iniciarSesionEmpleado();
        abrirPanelEncuestas();
        abrirFormulario();
        llenarFormulario(null, null, descripcionUnica("Encuesta sin fechas"), OPCION_A, OPCION_B);
        guardarFormulario();
        assertEquals("Faltan datos de la encuesta", aceptarAlerta());
    }

    @Test
    @DisplayName("CP10 - Fecha de fin anterior a la de inicio es rechazada")
    public void cp10_fechaFinAnterior() {
        iniciarSesionEmpleado();
        abrirPanelEncuestas();
        abrirFormulario();
        llenarFormulario(enDias(5), hoy(), descripcionUnica("Encuesta fechas invertidas"), OPCION_A, OPCION_B);
        guardarFormulario();
        assertEquals("La fecha de fin no puede ser anterior a la fecha de inicio", aceptarAlerta());
    }

    @Test
    @DisplayName("CP11 - Encuesta con una sola opción es rechazada (mínimo 2)")
    public void cp11_unaSolaOpcion() {
        iniciarSesionEmpleado();
        abrirPanelEncuestas();
        abrirFormulario();
        llenarFormulario(hoy(), enDias(7), descripcionUnica("Encuesta una opcion"), OPCION_A);
        guardarFormulario();
        assertEquals("La encuesta debe tener al menos 2 opciones", aceptarAlerta());
    }

    @Test
    @DisplayName("CP12 - Las opciones vacías se ignoran y no cuentan para el mínimo")
    public void cp12_opcionVaciaSeIgnora() {
        iniciarSesionEmpleado();
        abrirPanelEncuestas();
        abrirFormulario();
        llenarFormulario(hoy(), enDias(7), descripcionUnica("Encuesta opcion vacia"),
                OPCION_A, new String[] { "", "", "" });
        guardarFormulario();
        assertEquals("La encuesta debe tener al menos 2 opciones", aceptarAlerta());
    }

    @Test
    @DisplayName("CP13 - Descripción solo con espacios es rechazada")
    public void cp13_descripcionSoloEspacios() {
        iniciarSesionEmpleado();
        abrirPanelEncuestas();
        abrirFormulario();
        llenarFormulario(hoy(), enDias(7), "     ", OPCION_A, OPCION_B);
        guardarFormulario();
        assertEquals("Faltan datos de la encuesta", aceptarAlerta());
    }

    @Test
    @DisplayName("CP14 - Valor límite: fecha de inicio igual a fecha de fin es válida")
    public void cp14_fechasIguales() {
        iniciarSesionEmpleado();
        abrirPanelEncuestas();
        abrirFormulario();
        String descripcion = descripcionUnica("Encuesta mismo dia");
        llenarFormulario(hoy(), hoy(), descripcion, OPCION_A, OPCION_B);
        guardarFormulario();
        assertEquals("Encuesta creada correctamente", aceptarAlerta());
        encuestasCreadas.add(descripcion);
        assertEquals("Activa", estadoDe(descripcion));
    }

    @Test
    @DisplayName("CP15 - Opciones con solo liga o solo categoría son válidas (3 opciones)")
    public void cp15_opcionesParcialesValidas() {
        iniciarSesionEmpleado();
        abrirPanelEncuestas();
        abrirFormulario();
        String descripcion = descripcionUnica("Encuesta opciones parciales");
        llenarFormulario(hoy(), enDias(3), descripcion,
                new String[] { "Boca Juniors", "", "" },
                new String[] { "", "Premier League", "" },
                new String[] { "", "", "Accesorios" });
        guardarFormulario();
        assertEquals("Encuesta creada correctamente", aceptarAlerta());
        encuestasCreadas.add(descripcion);
        esperarFila(descripcion);
    }

    @Test
    @DisplayName("CP16 - 'Mostrar mis encuestas' lista las encuestas del empleado")
    public void cp16_mostrarMisEncuestas() {
        iniciarSesionEmpleado();
        String descripcion = descripcionUnica("Encuesta listado");
        crearEncuestaValida(descripcion);

        abrirPanelEncuestas();
        clickBoton("Mostrar mis encuestas");
        esperarFila(descripcion);
        assertTrue(driver.findElement(By.xpath("//table//th[normalize-space()='Estado']")).isDisplayed());
        assertTrue(driver.findElement(By.xpath("//table//th[normalize-space()='Acciones']")).isDisplayed());
    }

    @Test
    @DisplayName("CP17 - Cerrar encuesta (confirmando) cambia el estado a Cerrada")
    public void cp17_cerrarEncuestaConfirmando() {
        iniciarSesionEmpleado();
        String descripcion = descripcionUnica("Encuesta a cerrar");
        crearEncuestaValida(descripcion);

        driver.findElement(botonEnFila(descripcion, "Cerrar")).click();
        assertEquals("¿Seguro deseas cerrar esta encuesta?", aceptarAlerta());
        assertEquals("Encuesta cerrada", aceptarAlerta());

        wait.until(d -> "Cerrada".equals(estadoDe(descripcion)));
        assertTrue(driver.findElements(botonEnFila(descripcion, "Cerrar")).isEmpty());
        assertTrue(driver.findElement(botonEnFila(descripcion, "Ver ganadora")).isDisplayed());
    }

    @Test
    @DisplayName("CP18 - Cancelar la confirmación de cierre mantiene la encuesta Activa")
    public void cp18_cerrarEncuestaCancelando() {
        iniciarSesionEmpleado();
        String descripcion = descripcionUnica("Encuesta no cerrar");
        crearEncuestaValida(descripcion);

        driver.findElement(botonEnFila(descripcion, "Cerrar")).click();
        cancelarAlerta();
        assertFalse(hayAlerta());
        assertEquals("Activa", estadoDe(descripcion));
    }

    @Test
    @DisplayName("CP19 - 'Ver ganadora' en encuesta cerrada sin votos muestra 0 votos")
    public void cp19_verGanadoraSinVotos() {
        iniciarSesionEmpleado();
        String descripcion = descripcionUnica("Encuesta ganadora sin votos");
        crearEncuestaValida(descripcion);
        cerrarEncuestaComoEmpleado(descripcion);

        driver.findElement(botonEnFila(descripcion, "Ver ganadora")).click();
        String mensaje = aceptarAlerta();
        assertTrue(mensaje.contains("Ganadora:"), "Mensaje inesperado: " + mensaje);
        assertTrue(mensaje.contains("Votos: 0"), "Mensaje inesperado: " + mensaje);
    }

    @Test
    @DisplayName("CP20 - Eliminar encuesta (confirmando) la quita de la tabla")
    public void cp20_eliminarEncuestaConfirmando() {
        iniciarSesionEmpleado();
        String descripcion = descripcionUnica("Encuesta a eliminar");
        crearEncuestaValida(descripcion);

        driver.findElement(botonEnFila(descripcion, "Eliminar")).click();
        assertEquals("¿Seguro deseas eliminar esta encuesta?", aceptarAlerta());
        assertEquals("Encuesta eliminada", aceptarAlerta());

        esperarFilaAusente(descripcion);
        encuestasCreadas.remove(descripcion); // ya no requiere limpieza
    }

    @Test
    @DisplayName("CP21 - Cancelar la confirmación de eliminación conserva la encuesta")
    public void cp21_eliminarEncuestaCancelando() {
        iniciarSesionEmpleado();
        String descripcion = descripcionUnica("Encuesta no eliminar");
        crearEncuestaValida(descripcion);

        driver.findElement(botonEnFila(descripcion, "Eliminar")).click();
        cancelarAlerta();
        assertFalse(hayAlerta());
        assertTrue(driver.findElement(filaDe(descripcion)).isDisplayed());
    }

    @Test
    @DisplayName("CP22 - 'Encuestas activas (exporta)' descarga encuestas_activas.xlsx")
    public void cp22_exportarEncuestasActivas() {
        iniciarSesionEmpleado();
        crearEncuestaValida(descripcionUnica("Encuesta para exportar"));

        clickBoton("Encuestas activas (exporta)");
        esperarDescarga("encuestas_activas.xlsx");
    }

    @Test
    @DisplayName("CP23 - 'Mostrar clientes (exporta)' descarga clientes.xlsx")
    public void cp23_exportarClientes() {
        iniciarSesionEmpleado();
        abrirPanelEncuestas();

        clickBoton("Mostrar clientes (exporta)");
        esperarDescarga("clientes.xlsx");
    }
}
