-- Usuarios de prueba para desarrollo, con uno por rol.
--
-- Contraseña de todos: chiga1234
-- Código de supervisor (solo Supervisor o superior):
--   supervisor = 1111, admin = 2222, dueno = 3333
--
-- Los hashes se calculan con pgcrypto: la contraseña con bcrypt y el código con
-- HMAC-SHA256 (hex, 64 caracteres) usando el secreto 'dev-secret' (ADR negocio 0003).
-- El backend tiene que verificar con el mismo algoritmo y, para el código, el mismo secreto.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO usuario (nombre_usuario, nombre, apellido, correo, contrasena, codigo_autorizacion)
VALUES
    ('vendedor',   'Valeria', 'Vendedor',   'vendedor@chiga.example',   crypt('chiga1234', gen_salt('bf')), NULL),
    ('supervisor', 'Sergio',  'Supervisor', 'supervisor@chiga.example', crypt('chiga1234', gen_salt('bf')), encode(hmac('1111', 'dev-secret', 'sha256'), 'hex')),
    ('admin',      'Adriana', 'Admin',      'admin@chiga.example',      crypt('chiga1234', gen_salt('bf')), encode(hmac('2222', 'dev-secret', 'sha256'), 'hex')),
    ('dueno',      'Daniel',  'Dueño',      'dueno@chiga.example',      crypt('chiga1234', gen_salt('bf')), encode(hmac('3333', 'dev-secret', 'sha256'), 'hex'))
ON CONFLICT (nombre_usuario) DO NOTHING;

INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM (VALUES
    ('vendedor',   'Vendedor'),
    ('supervisor', 'Supervisor'),
    ('admin',      'Administrador'),
    ('dueno',      'Dueño')
) AS v(nombre_usuario, rol)
JOIN usuario u ON u.nombre_usuario = v.nombre_usuario
JOIN rol r ON r.rol = v.rol
ON CONFLICT DO NOTHING;
