-- Va después de los usuarios porque cada movimiento registra quién lo cargó.
-- María Gómez debe 185.000 de un límite de 200.000: sirve para probar ventas que lo superen.
INSERT INTO movimiento_cuenta_corriente (id_cuenta_corriente, id_usuario, tipo_movimiento, sentido, importe, observacion)
SELECT cc.id_cuenta_corriente, u.id_usuario, 'SALDO_INICIAL', 'DEBITO', 185000.00, 'Saldo de prueba cerca del límite'
FROM cliente c
JOIN tipo_documento td ON td.id_tipo_documento = c.id_tipo_documento
JOIN cuenta_corriente cc ON cc.id_cliente = c.id_cliente
CROSS JOIN usuario u
WHERE td.nombre = 'CUIL' AND c.nro_documento = '27333444556'
  AND u.nombre_usuario = 'admin'
  AND NOT EXISTS (SELECT 1 FROM movimiento_cuenta_corriente m WHERE m.id_cuenta_corriente = cc.id_cuenta_corriente);
