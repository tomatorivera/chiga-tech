-- Depósito
INSERT INTO ubicacion (sector, estante) VALUES
    ('A', '1'), ('A', '2'), ('B', '1'), ('Deposito', '1')
ON CONFLICT (sector, estante) DO NOTHING;

-- Familias de productos (categorías sin padre)
INSERT INTO categoria (nombre, descripcion) VALUES
    ('Hardware',           'Componentes internos de PC'),
    ('Periféricos',        'Dispositivos de entrada y salida'),
    ('Servicios técnicos', 'Mano de obra y servicios')
ON CONFLICT (nombre) DO NOTHING;

-- Categorías de productos dentro de una familia
INSERT INTO categoria (nombre, id_familia)
SELECT v.nombre, f.id_categoria
FROM (VALUES
    ('CPUs',         'Hardware'),
    ('GPUs',         'Hardware'),
    ('Memorias RAM', 'Hardware'),
    ('Teclados',     'Periféricos'),
    ('Mouses',       'Periféricos')
) AS v(nombre, familia)
JOIN categoria f ON f.nombre = v.familia
ON CONFLICT (nombre) DO NOTHING;

-- Proveedores
INSERT INTO proveedor (razon_social, cuit, telefono, correo) VALUES
    ('Distribuidora Norte S.A.', '30712345678', '0381-4123456', 'ventas@dnorte.example'),
    ('Mayorista Tech SRL',       '30798765432', '011-45678901', 'pedidos@mtech.example')
ON CONFLICT (cuit) DO NOTHING;

-- Productos
INSERT INTO producto (nombre, id_categoria, id_ubicacion, costo_unitario, precio_unitario, stock_minimo, stock_actual)
SELECT v.nombre, c.id_categoria, u.id_ubicacion, v.costo, v.precio, v.minimo, v.stock
FROM (VALUES
    ('AMD Ryzen 5 7600',          'CPUs',               'A', '1',  250000.00,  320000.00, 2, 8),
    ('Intel Core i5-14400F',      'CPUs',               'A', '1',  230000.00,  295000.00, 2, 5),
    ('NVIDIA GeForce RTX 5060',   'GPUs',               'A', '2',  520000.00,  650000.00, 1, 3),
    ('Kingston Fury 16GB DDR5',   'Memorias RAM',       'B', '1',   60000.00,   78000.00, 5, 20),
    ('Teclado mecánico Redragon', 'Teclados',           'B', '1',   35000.00,   48000.00, 3, 10),
    ('Mouse Logitech G203',       'Mouses',             'B', '1',   22000.00,   30000.00, 5, 1),
    ('Armado de PC',              'Servicios técnicos', NULL, NULL,      0.00,   40000.00, 0, 0)
) AS v(nombre, categoria, sector, estante, costo, precio, minimo, stock)
JOIN categoria c ON c.nombre = v.categoria
LEFT JOIN ubicacion u ON u.sector = v.sector AND u.estante = v.estante
WHERE NOT EXISTS (SELECT 1 FROM producto p WHERE p.nombre = v.nombre);

-- Código de barra de los productos
INSERT INTO codigo_barra (codigo, id_producto)
SELECT v.codigo, p.id_producto
FROM (VALUES
    ('7790000000011', 'AMD Ryzen 5 7600'),
    ('7790000000028', 'Intel Core i5-14400F'),
    ('7790000000035', 'NVIDIA GeForce RTX 5060'),
    ('7790000000042', 'Kingston Fury 16GB DDR5'),
    ('7790000000059', 'Teclado mecánico Redragon'),
    ('7790000000066', 'Mouse Logitech G203')
) AS v(codigo, producto)
JOIN producto p ON p.nombre = v.producto
ON CONFLICT (codigo) DO NOTHING;
