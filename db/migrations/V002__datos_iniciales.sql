INSERT INTO configuracion DEFAULT VALUES;

-- Roles predefinidos (ADR negocio 0011). Los permisos de cada rol se cargan en otra migración.
INSERT INTO rol (rol) VALUES ('Vendedor'), ('Supervisor'), ('Administrador'), ('Dueño');

-- Datos de clientes
INSERT INTO tipo_persona (nombre) VALUES ('Física'), ('Jurídica');

-- Códigos de la tabla de tipos de documento de ARCA. 99 es "sin identificar".
INSERT INTO tipo_documento (nombre, codigo_arca) VALUES
    ('DNI', 96), ('CUIT', 80), ('CUIL', 86), ('Pasaporte', 94), ('Otro', 99);

-- Condiciones frente al IVA más comunes del catálogo de ARCA, con su código.
INSERT INTO condicion_iva (nombre, codigo_arca) VALUES
    ('IVA Responsable Inscripto', 1),
    ('IVA Sujeto Exento',         4),
    ('Consumidor Final',          5),
    ('Responsable Monotributo',   6),
    ('Sujeto No Categorizado',    7);

-- Cliente del sistema para consumidores finales (ADR negocio 0004).
INSERT INTO cliente (id_tipo_persona, nombre_razon_social, id_tipo_documento, nro_documento, id_condicion_iva, es_sistema)
VALUES (
    (SELECT id_tipo_persona FROM tipo_persona WHERE nombre = 'Física'),
    'Consumidor Final',
    (SELECT id_tipo_documento FROM tipo_documento WHERE nombre = 'Otro'),
    '0',
    (SELECT id_condicion_iva FROM condicion_iva WHERE nombre = 'Consumidor Final'),
    true
);
