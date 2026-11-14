-- Postgres no indexa las claves foráneas solas: codigo_barra solo tiene índice por `codigo`.
-- Sin este, "qué códigos tiene este producto" recorre toda la tabla, y la búsqueda de productos
-- lo pregunta por cada producto (EXISTS y array_agg en ProductRepository.FindAll).
CREATE INDEX codigo_barra_id_producto_idx ON codigo_barra (id_producto);
