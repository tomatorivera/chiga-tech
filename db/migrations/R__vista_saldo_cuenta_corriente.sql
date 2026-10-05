-- El saldo es la suma algebraica de los movimientos (ADR negocio 0005): los débitos
-- aumentan lo que debe el cliente y los créditos lo disminuyen. Esta vista permite
-- consultar esos saldos calculados
CREATE OR REPLACE VIEW v_saldo_cuenta_corriente AS
SELECT
    cc.id_cuenta_corriente,
    cc.id_cliente,
    cc.limite_credito,
    COALESCE(SUM(CASE m.sentido WHEN 'DEBITO' THEN m.importe ELSE -m.importe END), 0)::numeric(14,2) AS saldo
FROM cuenta_corriente cc
LEFT JOIN movimiento_cuenta_corriente m ON m.id_cuenta_corriente = cc.id_cuenta_corriente
GROUP BY cc.id_cuenta_corriente;
