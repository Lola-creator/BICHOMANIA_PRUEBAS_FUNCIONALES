SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `boletas`;
CREATE TABLE `boletas` (
  `id_boleta` int NOT NULL AUTO_INCREMENT,
  `fecha_emision` date NOT NULL,
  `impuesto` decimal(10,2) NOT NULL,
  `id_pedido` int DEFAULT NULL,
  PRIMARY KEY (`id_boleta`),
  UNIQUE KEY `id_pedido` (`id_pedido`),
  CONSTRAINT `boletas_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `carritos`;
CREATE TABLE `carritos` (
  `id_carrito` int NOT NULL AUTO_INCREMENT,
  `fecha_creacion` date NOT NULL,
  `id_cliente` int DEFAULT NULL,
  `id_estado` int DEFAULT NULL,
  PRIMARY KEY (`id_carrito`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_estado` (`id_estado`),
  CONSTRAINT `carritos_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `carritos_ibfk_2` FOREIGN KEY (`id_estado`) REFERENCES `estados` (`id_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `categoria`;
CREATE TABLE `categoria` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `ciudades`;
CREATE TABLE `ciudades` (
  `id_ciudad` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `id_pais` int NOT NULL,
  PRIMARY KEY (`id_ciudad`),
  KEY `id_pais` (`id_pais`),
  CONSTRAINT `ciudades_ibfk_1` FOREIGN KEY (`id_pais`) REFERENCES `paises` (`id_pais`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellido_paterno` varchar(50) NOT NULL,
  `apellido_materno` varchar(50) DEFAULT '-',
  `telefono` varchar(15) NOT NULL,
  `correo_electronico` varchar(100) NOT NULL,
  `dni` char(8) NOT NULL,
  `saldo` int DEFAULT '0',
  `contrasena` varchar(255) NOT NULL,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `correo_electronico` (`correo_electronico`),
  UNIQUE KEY `dni` (`dni`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `competencias`;
CREATE TABLE `competencias` (
  `id_competencia` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  PRIMARY KEY (`id_competencia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `detalles_encuestas`;
CREATE TABLE `detalles_encuestas` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_encuesta` int NOT NULL,
  `opcion_equipo` varchar(50) DEFAULT NULL,
  `opcion_liga` varchar(500) DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `votos` int DEFAULT '0',
  PRIMARY KEY (`id_detalle`,`id_encuesta`),
  KEY `id_encuesta` (`id_encuesta`),
  CONSTRAINT `detalles_encuestas_ibfk_1` FOREIGN KEY (`id_encuesta`) REFERENCES `encuestas` (`id_encuesta`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `direcciones`;
CREATE TABLE `direcciones` (
  `id_direccion` int NOT NULL AUTO_INCREMENT,
  `distrito` varchar(50) NOT NULL,
  `calle` varchar(100) NOT NULL,
  `referencia` varchar(100) NOT NULL,
  `codigo_postal` varchar(10) NOT NULL,
  `id_cliente` int NOT NULL,
  `id_ciudad` int NOT NULL,
  PRIMARY KEY (`id_direccion`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_ciudad` (`id_ciudad`),
  CONSTRAINT `direcciones_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `direcciones_ibfk_2` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudades` (`id_ciudad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `empleados`;
CREATE TABLE `empleados` (
  `id_empleado` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellido_paterno` varchar(50) NOT NULL,
  `apellido_materno` varchar(50) DEFAULT NULL,
  `telefono` char(9) DEFAULT NULL,
  `correo_electronico` varchar(100) DEFAULT NULL,
  `dni` char(8) DEFAULT NULL,
  `sueldo` decimal(10,2) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `cargo` varchar(50) NOT NULL,
  PRIMARY KEY (`id_empleado`),
  UNIQUE KEY `contrasena` (`contrasena`),
  UNIQUE KEY `correo_electronico` (`correo_electronico`),
  UNIQUE KEY `dni` (`dni`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `encuestas`;
CREATE TABLE `encuestas` (
  `id_encuesta` int NOT NULL AUTO_INCREMENT,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `descripcion` varchar(300) DEFAULT NULL,
  `id_empleado` int DEFAULT NULL,
  `id_estado` int DEFAULT NULL,
  PRIMARY KEY (`id_encuesta`),
  KEY `id_empleado` (`id_empleado`),
  KEY `id_estado` (`id_estado`),
  CONSTRAINT `encuestas_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleados` (`id_empleado`),
  CONSTRAINT `encuestas_ibfk_2` FOREIGN KEY (`id_estado`) REFERENCES `estados` (`id_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `equipos`;
CREATE TABLE `equipos` (
  `id_equipo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `pais` varchar(100) NOT NULL,
  PRIMARY KEY (`id_equipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `equipos_productos`;
CREATE TABLE `equipos_productos` (
  `id_equipo` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int DEFAULT '0',
  PRIMARY KEY (`id_equipo`,`id_producto`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `equipos_productos_ibfk_1` FOREIGN KEY (`id_equipo`) REFERENCES `equipos` (`id_equipo`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `equipos_productos_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `estados`;
CREATE TABLE `estados` (
  `id_estado` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(100) DEFAULT NULL,
  `tipo_entidad` varchar(30) NOT NULL,
  PRIMARY KEY (`id_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `items_carrito`;
CREATE TABLE `items_carrito` (
  `id_carrito` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  PRIMARY KEY (`id_carrito`,`id_producto`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `items_carrito_ibfk_1` FOREIGN KEY (`id_carrito`) REFERENCES `carritos` (`id_carrito`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `items_carrito_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `marcas`;
CREATE TABLE `marcas` (
  `id_marca` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  `pais` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_marca`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `marcas_productos`;
CREATE TABLE `marcas_productos` (
  `id_marca` int NOT NULL,
  `id_producto` int NOT NULL,
  PRIMARY KEY (`id_marca`,`id_producto`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `marcas_productos_ibfk_1` FOREIGN KEY (`id_marca`) REFERENCES `marcas` (`id_marca`),
  CONSTRAINT `marcas_productos_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `pagos`;
CREATE TABLE `pagos` (
  `id_pago` int NOT NULL AUTO_INCREMENT,
  `metodo_pago` varchar(50) NOT NULL,
  `fecha_pago` date NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `id_pedido` int DEFAULT NULL,
  PRIMARY KEY (`id_pago`),
  KEY `id_pedido` (`id_pedido`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `paises`;
CREATE TABLE `paises` (
  `id_pais` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_pais`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `pedidos`;
CREATE TABLE `pedidos` (
  `id_pedido` int NOT NULL AUTO_INCREMENT,
  `fecha_pedido` date NOT NULL,
  `id_carrito` int DEFAULT NULL,
  `id_direccion` int DEFAULT NULL,
  `id_estado` int DEFAULT NULL,
  PRIMARY KEY (`id_pedido`),
  KEY `id_carrito` (`id_carrito`),
  KEY `id_direccion` (`id_direccion`),
  KEY `id_estado` (`id_estado`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`id_carrito`) REFERENCES `carritos` (`id_carrito`),
  CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`id_direccion`) REFERENCES `direcciones` (`id_direccion`),
  CONSTRAINT `pedidos_ibfk_3` FOREIGN KEY (`id_estado`) REFERENCES `estados` (`id_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `productos`;
CREATE TABLE `productos` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `caracteristica` varchar(3000) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `id_categoria` int DEFAULT NULL,
  `id_competencia` int DEFAULT NULL,
  `imagen` varchar(200) NOT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `id_categoria` (`id_categoria`),
  KEY `id_competencia` (`id_competencia`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`),
  CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`id_competencia`) REFERENCES `competencias` (`id_competencia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `resena`;
CREATE TABLE `resena` (
  `id_resena` int NOT NULL AUTO_INCREMENT,
  `calificacion` varchar(500) NOT NULL,
  `fecha` date NOT NULL,
  `puntuacion` int NOT NULL,
  `id_cliente` int DEFAULT NULL,
  `id_producto` int DEFAULT NULL,
  PRIMARY KEY (`id_resena`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `resena_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `resena_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `votos_encuestas`;
CREATE TABLE `votos_encuestas` (
  `id_voto_encuesta` int NOT NULL AUTO_INCREMENT,
  `fecha_voto` date NOT NULL,
  `id_cliente` int NOT NULL,
  `id_detalle` int NOT NULL,
  `id_encuesta` int NOT NULL,
  PRIMARY KEY (`id_voto_encuesta`),
  UNIQUE KEY `id_cliente` (`id_cliente`,`id_encuesta`),
  KEY `id_detalle` (`id_detalle`,`id_encuesta`),
  CONSTRAINT `votos_encuestas_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `votos_encuestas_ibfk_2` FOREIGN KEY (`id_detalle`, `id_encuesta`) REFERENCES `detalles_encuestas` (`id_detalle`, `id_encuesta`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS=1;
