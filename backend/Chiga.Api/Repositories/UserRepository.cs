using Api.Models;
using Npgsql;

namespace Api.Repositories;

public class UserRepository(NpgsqlDataSource ds) : IUserRepository
{
  public async Task<(Usuario User, string Contrasenia)?> FindByNombreUsuarioAsync(
    string nombreUsuario, CancellationToken ct = default
  ){
    const string sql = """
      SELECT u.id_usuario, u.nombre_usuario, u.nombre, u.apellido, u.contrasena, u.estado,
             r.id_rol, r.rol,
             p.id_permiso, p.modulo
      FROM usuario u
      LEFT JOIN usuario_rol ur ON ur.id_usuario = u.id_usuario
      LEFT JOIN rol r          ON r.id_rol = ur.id_rol
      LEFT JOIN rol_permiso rp ON rp.id_rol = r.id_rol
      LEFT JOIN permiso p      ON p.id_permiso = rp.id_permiso
      WHERE u.nombre_usuario = @nombreUsuario
      """;

    await using var cmd = ds.CreateCommand(sql);
    cmd.Parameters.AddWithValue("nombreUsuario", nombreUsuario);
    
    await using var reader = await cmd.ExecuteReaderAsync(ct);

    Usuario? usuario = null;
    var contrasena = "";

    while (await reader.ReadAsync(ct))
    {
      // Si los datos del usuario se repiten en más de una fila, los leo una sola vez
      if (usuario is null)
      {
        usuario = new Usuario
        {
          Id = reader.GetInt32(0),
          NombreUsuario = reader.GetString(1),
          Nombre = reader.GetString(2),
          Apellido = reader.GetString(3),
          Estado = reader.GetBoolean(5),
        };
        contrasena = reader.GetString(4);
      }

      if (reader.IsDBNull(6)) continue; // el usuario no tiene roles

      var idRol = reader.GetInt32(6);
      var rol = usuario.Roles.FirstOrDefault(r => r.Id == idRol);
      if (rol is null)
      {
        rol = new Rol { Id = idRol, Nombre = reader.GetString(7) };
        usuario.Roles.Add(rol);
      }

      if (reader.IsDBNull(8)) continue; // el rol no tiene permisos

      rol.Permisos.Add(new Permiso { Id = reader.GetInt32(8), Modulo = reader.GetString(9) });
    }

    return usuario is null 
      ? null 
      : (usuario, contrasena);
  }
}