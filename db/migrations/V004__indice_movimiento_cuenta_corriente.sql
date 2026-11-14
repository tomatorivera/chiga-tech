-- Postgres no indexa las claves foráneas solas. Sin este índice, el saldo de una cuenta
-- (v_saldo_cuenta_corriente) y sus movimientos se buscan recorriendo toda la tabla.
CREATE INDEX movimiento_cuenta_corriente_id_cuenta_corriente_idx
    ON movimiento_cuenta_corriente (id_cuenta_corriente);
