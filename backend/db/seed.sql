SET FOREIGN_KEY_CHECKS=0;
SET NAMES utf8mb4;

INSERT INTO `estados` (`id_estado`,`nombre`,`descripcion`,`tipo_entidad`) VALUES
(1,'Activa','Encuesta visible y aceptando votos','ENCUESTA'),
(2,'Cerrada','Encuesta cerrada, ya no recibe votos','ENCUESTA'),
(3,'Borrador','Encuesta aún no publicada','ENCUESTA'),
(4,'En curso','Pedido con deudas','PEDIDO'),
(5,'Pagado','Pedido sin deudas','PEDIDO'),
(6,'Ahora','Carrito actual','CARRITO'),
(7,'Cerrado','Carrito que generó pedido','CARRITO');

INSERT INTO `paises` (`id_pais`,`nombre`) VALUES
(1,'Peru'),
(2,'España'),
(3,'Alemania'),
(4,'Italia'),
(5,'Brasil'),
(6,'Argentina');

INSERT INTO `ciudades` (`id_ciudad`,`nombre`,`id_pais`) VALUES
(1,'Arequipa',1),
(2,'Huancayo',1),
(3,'Lima',1),
(4,'Piura',1),
(5,'Tacna',1),
(6,'Madrid',2),
(7,'Barcelona',2),
(8,'Valencia',2),
(9,'Mestalla',2),
(10,'Berlin',3),
(11,'Hamburgo',3),
(12,'Colonia',3),
(13,'Munich',3),
(14,'Turin',4),
(15,'Napoles',4),
(16,'Roma',4),
(17,'Rio de Janeiro',5),
(18,'Brasilia',5),
(19,'Sao Paolo',5),
(20,'Palermo',6),
(21,'Buenos Aires',6),
(22,'Jujuy',6);

INSERT INTO `categoria` (`id_categoria`,`nombre`) VALUES
(1,'Balón'),
(2,'Camiseta'),
(3,'Botines'),
(4,'Accesorios'),
(5,'Mochilas'),
(6,'Shorts'),
(7,'Protectores'),
(8,'Ropa Casual'),
(9,'Botellas'),
(10,'Tecnologia'),
(11,'Guantes');

INSERT INTO `competencias` (`id_competencia`,`nombre`) VALUES
(1,'Champions League'),
(2,'Copa Libertadores'),
(3,'Premier League'),
(4,'La Liga'),
(5,'Copa Mundial de Clubes'),
(6,'Supercopa de la UEFA'),
(7,'Copa Intercontinental'),
(8,'Bundesliga'),
(9,'Eurocopa'),
(10,'Copa América'),
(11,'Copa Mundial de la FIFA'),
(12,'Champions League'),
(13,'Copa Libertadores'),
(14,'Premier League'),
(15,'La Liga'),
(16,'Copa Mundial de Clubes'),
(17,'Supercopa de la UEFA'),
(18,'Copa Intercontinental'),
(19,'Bundesliga'),
(20,'Eurocopa'),
(21,'Copa América'),
(22,'Copa Mundial de la FIFA');

INSERT INTO `marcas` (`id_marca`,`nombre`,`pais`) VALUES
(1,'Nike','Estados Unidos'),
(2,'Adidas','Alemania'),
(3,'Puma','Alemania'),
(4,'Under Armour','Estados Unidos'),
(5,'DIOR','Italia'),
(6,'Umbro','Inglaterra'),
(7,'Molten','Japon'),
(8,'Joma','Espana'),
(9,'New Balance','Estados Unidos'),
(10,'Under Armour','Estados Unidos'),
(11,'Hummel','Dinamarca');

INSERT INTO `equipos` (`id_equipo`,`nombre`,`pais`) VALUES
(1,'Real Madrid','España'),
(2,'Manchester City','Inglaterra'),
(3,'Boca Juniors','Argentina'),
(4,'Flamengo','Brasil'),
(5,'Arsenal','Inglaterra'),
(6,'Bayern Munich','Alemania'),
(7,'Barcelona','Espana'),
(8,'Alianza Lima','Peru'),
(9,'Liverpool','Alemania'),
(10,'Paris Saint-Germain','Francia'),
(11,'Chelsea','Inglaterra');

INSERT INTO `productos` (`id_producto`,`nombre`,`caracteristica`,`precio`,`id_categoria`,`id_competencia`,`imagen`) VALUES
(2,'Camiseta Home','Temporada 24/25','85.00',2,3,'camiseta_home.jpg'),
(3,'Botines Speed','Césped','199.99',3,4,'botines_speed.jpg'),
(4,'Canillera Max','Fibra','35.50',4,2,'canillera_max.jpg'),
(5,'Botines Predator','Césped natural','230.00',3,4,'botines_predator.jpg'),
(6,'Guantes Uhlsport','Agarre avanzado','95.00',11,11,'guantes_uhlsport.jpg'),
(7,'Canilleras Mercurial','Talla M','35.00',7,7,'canilleras_mercurial.jpg'),
(8,'Mochila Puma Stadium','40L','50.00',5,5,'mochila_puma_stadium.jpg'),
(9,'Chaleco Entrenar','Ajuste rápido','2500.00',10,9,'chaleco_entrenamiento.jpg');

INSERT INTO `marcas_productos` (`id_marca`,`id_producto`) VALUES
(2,2),
(3,3),
(4,4),
(5,5),
(7,6),
(6,7),
(9,8),
(8,9);

INSERT INTO `equipos_productos` (`id_equipo`,`id_producto`,`cantidad`) VALUES
(2,2,12),
(3,3,8),
(4,4,15),
(5,5,14),
(6,6,20),
(7,7,25),
(8,8,18),
(9,9,10);

SET FOREIGN_KEY_CHECKS=1;
