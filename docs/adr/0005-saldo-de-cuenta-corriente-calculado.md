# El saldo de cuenta corriente se calcula, no se almacena

`cuenta_corriente` no tiene columna `saldo`: el saldo es siempre la suma algebraica de sus movimientos (RN-03). Un saldo almacenado es una copia que puede desincronizarse de los movimientos y obliga a decidir cuál de los dos es el correcto; con el volumen esperado (RNF-02, hasta 10.000 registros) calcularlo con una consulta o vista no es un problema de rendimiento.
