-- Clientes de prueba. Se identifican por (tipo de documento, nro_documento).
INSERT INTO cliente (id_tipo_persona, nombre_razon_social, id_tipo_documento, nro_documento, id_condicion_iva, telefono, correo)
SELECT tp.id_tipo_persona, v.nombre_razon_social, td.id_tipo_documento, v.nro_documento, ci.id_condicion_iva, v.telefono, v.correo
FROM (VALUES
    ('Física',   'Juan Pérez',           'DNI',  '30111222',    'Consumidor Final',          '381-5551234',  'juan.perez@example.com'),
    ('Física',   'María Gómez',          'CUIL', '27333444556', 'Responsable Monotributo',   '381-5559876',  NULL),
    ('Jurídica', 'Estudio Contable Sur', 'CUIT', '30700111222', 'IVA Responsable Inscripto', '0381-4300000', 'admin@ecsur.example')
) AS v(tipo_persona, nombre_razon_social, tipo_documento, nro_documento, condicion_iva, telefono, correo)
JOIN tipo_persona tp ON tp.nombre = v.tipo_persona
JOIN tipo_documento td ON td.nombre = v.tipo_documento
JOIN condicion_iva ci ON ci.nombre = v.condicion_iva
WHERE NOT EXISTS (
    SELECT 1 FROM cliente c
    WHERE c.id_tipo_documento = td.id_tipo_documento AND c.nro_documento = v.nro_documento
);

INSERT INTO cuenta_corriente (id_cliente, limite_credito)
SELECT c.id_cliente, v.limite
FROM (VALUES
    ('CUIL', '27333444556',  200000.00),
    ('CUIT', '30700111222', 1500000.00)
) AS v(tipo_documento, nro_documento, limite)
JOIN tipo_documento td ON td.nombre = v.tipo_documento
JOIN cliente c ON c.id_tipo_documento = td.id_tipo_documento AND c.nro_documento = v.nro_documento
ON CONFLICT (id_cliente) DO NOTHING;
