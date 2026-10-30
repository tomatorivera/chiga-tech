using System.Net;
using System.Net.Http.Json;
using System.Text;
using Api.Models.Dto;
using System.Text.Json;
using Api.Models.Entities;
using Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace Chiga.IntegrationTests.Controllers;

// Necesita la BD levantada con migraciones y seeds (npm run db:reset).
public class AuthControllerTests(WebApplicationFactory<Program> factory)
  : IClassFixture<WebApplicationFactory<Program>>
{
  private Task<HttpResponseMessage> PostLogin(string json) =>
    factory.CreateClient().PostAsync("/auth/login", new StringContent(json, Encoding.UTF8, "application/json"));

  private static IEnumerable<string> SetCookies(HttpResponseMessage response) =>
    response.Headers.TryGetValues("Set-Cookie", out var values) ? values : [];

  // Ningún Set-Cookie: ni la cookie de sesión ni otra con distinto nombre.
  private static void AssertNoCookie(HttpResponseMessage response) => Assert.Empty(SetCookies(response));

  [Fact]
  public async Task Login_ValidCredentials_ReturnsOkWithUser()
  {
    var client = factory.CreateClient();

    var response = await client.PostAsJsonAsync("/auth/login", new { username = "multirol", password = "chiga1234" });

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    var body = await response.Content.ReadAsStringAsync();
    Assert.DoesNotContain("$2a$", body);
    Assert.DoesNotContain("contrasena", body, StringComparison.OrdinalIgnoreCase);
    Assert.DoesNotContain("password", body, StringComparison.OrdinalIgnoreCase);
    var usuario = await response.Content.ReadFromJsonAsync<UsuarioDTO>();
    Assert.NotNull(usuario);
    Assert.Equal("multirol", usuario.NombreUsuario);
    Assert.Equal(["Supervisor", "Vendedor"], usuario.Roles.Order());
  }

  [Fact]
  public async Task Login_ValidCredentials_BodyHasExactlyTheContractFields()
  {
    var response = await factory.CreateClient().PostAsJsonAsync("/auth/login", new { username = "multirol", password = "chiga1234" });

    using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
    var root = json.RootElement;
    Assert.Equal(
      ["apellido", "id", "nombre", "nombreUsuario", "permisos", "roles"],
      root.EnumerateObject().Select(p => p.Name).Order());
    Assert.Equal(JsonValueKind.Number, root.GetProperty("id").ValueKind);
    Assert.Equal("Marta", root.GetProperty("nombre").GetString());
    Assert.Equal("Multirol", root.GetProperty("apellido").GetString());
    Assert.Equal("multirol", root.GetProperty("nombreUsuario").GetString());
    Assert.Equal(JsonValueKind.Array, root.GetProperty("roles").ValueKind);
    Assert.Equal(JsonValueKind.Array, root.GetProperty("permisos").ValueKind);
  }

  [Fact]
  public async Task Login_UserWithOverlappingRolePermissions_ReturnsPermissionUnionWithoutDuplicates()
  {
    // Los seeds aún no cargan permisos de rol, así que el repositorio se reemplaza por uno falso.
    var usuario = new Usuario
    {
      Id = 1,
      NombreUsuario = "multirol",
      Nombre = "Marta",
      Apellido = "Multirol",
      Roles =
      [
        new Rol { Id = 1, Nombre = "Vendedor", Permisos = [new Permiso { Id = 1, Modulo = "ventas.crear" }, new Permiso { Id = 2, Modulo = "ventas.ver" }] },
        new Rol { Id = 2, Nombre = "Supervisor", Permisos = [new Permiso { Id = 2, Modulo = "ventas.ver" }, new Permiso { Id = 3, Modulo = "ventas.autorizar" }] },
      ],
    };
    var hash = BCrypt.Net.BCrypt.HashPassword("chiga1234", workFactor: 4);
    var client = factory
      .WithWebHostBuilder(builder => builder.ConfigureServices(services =>
        services.AddScoped<IUserRepository>(_ => new FakeUserRepository((usuario, hash)))))
      .CreateClient();

    var response = await client.PostAsJsonAsync("/auth/login", new { username = "multirol", password = "chiga1234" });

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
    var permisos = json.RootElement.GetProperty("permisos").EnumerateArray().Select(p => p.GetString());
    Assert.Equal(["ventas.crear", "ventas.ver", "ventas.autorizar"], permisos);
  }

  [Fact]
  public async Task Login_ValidCredentials_SetsSessionCookieWithSecureAttributes()
  {
    var response = await factory.CreateClient().PostAsJsonAsync("/auth/login", new { username = "multirol", password = "chiga1234" });

    var cookie = Assert.Single(SetCookies(response));
    var parts = cookie.Split(';').Select(part => part.Trim()).ToList();
    Assert.StartsWith("chiga_auth=", parts[0]);
    Assert.False(string.IsNullOrWhiteSpace(parts[0]["chiga_auth=".Length..]));
    var attributes = parts.Skip(1).Select(attribute => attribute.ToLowerInvariant()).ToList();
    Assert.Contains("httponly", attributes);
    Assert.Contains("secure", attributes);
    Assert.Contains("samesite=strict", attributes);
    Assert.Contains("path=/", attributes);
  }

  [Fact]
  public async Task Login_ValidCredentialsWithExistingSessionCookie_IssuesNewCookie()
  {
    var client = factory.CreateClient();
    var first = await client.PostAsJsonAsync("/auth/login", new { username = "vendedor", password = "chiga1234" });
    var firstCookie = Assert.Single(SetCookies(first)).Split(';')[0];

    var request = new HttpRequestMessage(HttpMethod.Post, "/auth/login")
    {
      Content = JsonContent.Create(new { username = "multirol", password = "chiga1234" }),
    };
    request.Headers.Add("Cookie", firstCookie);
    var second = await client.SendAsync(request);

    Assert.Equal(HttpStatusCode.OK, second.StatusCode);
    var secondUser = await second.Content.ReadFromJsonAsync<UsuarioDTO>();
    Assert.Equal("multirol", secondUser!.NombreUsuario);
    var secondCookie = Assert.Single(SetCookies(second)).Split(';')[0];
    Assert.StartsWith("chiga_auth=", secondCookie);
    Assert.NotEqual(firstCookie, secondCookie);
  }

  [Fact]
  public async Task Login_WrongPassword_ReturnsUnauthorizedProblemDetails()
  {
    var client = factory.CreateClient();

    var response = await client.PostAsJsonAsync("/auth/login", new { username = "vendedor", password = "incorrecta" });

    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    AssertNoCookie(response);
  }

  [Fact]
  public async Task Login_UnknownUser_ReturnsSameDetailAsWrongPassword()
  {
    var client = factory.CreateClient();

    var wrongPassword = await client.PostAsJsonAsync("/auth/login", new { username = "vendedor", password = "incorrecta" });
    var unknownUser = await client.PostAsJsonAsync("/auth/login", new { username = "noexiste", password = "chiga1234" });

    Assert.Equal(HttpStatusCode.Unauthorized, unknownUser.StatusCode);
    AssertNoCookie(unknownUser);
    var detailWrongPassword = (await wrongPassword.Content.ReadFromJsonAsync<ProblemDetails>())!.Detail;
    var detailUnknownUser = (await unknownUser.Content.ReadFromJsonAsync<ProblemDetails>())!.Detail;
    Assert.False(string.IsNullOrWhiteSpace(detailUnknownUser));
    Assert.Equal(detailWrongPassword, detailUnknownUser);
  }

  [Theory]
  [InlineData("{}")]
  [InlineData("""{"username":"vendedor"}""")]
  [InlineData("""{"password":"chiga1234"}""")]
  [InlineData("""{"username":"","password":""}""")]
  [InlineData("""{"username":"","password":"chiga1234"}""")]
  [InlineData("""{"username":"   ","password":"chiga1234"}""")]
  [InlineData("""{"username":"vendedor","password":""}""")]
  [InlineData("""{"username":null,"password":null}""")]
  [InlineData("""{"username":123,"password":true}""")]
  [InlineData("null")]
  [InlineData("")]
  public async Task Login_InvalidBody_ReturnsBadRequestProblemDetails(string json)
  {
    var response = await PostLogin(json);

    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    AssertNoCookie(response);
  }

  [Theory]
  [InlineData("{}", new[] { "username", "password" })]
  [InlineData("""{"password":"chiga1234"}""", new[] { "username" })]
  [InlineData("""{"username":"vendedor"}""", new[] { "password" })]
  [InlineData("""{"username":"","password":""}""", new[] { "username", "password" })]
  [InlineData("""{"username":null,"password":null}""", new[] { "username", "password" })]
  public async Task Login_MissingFields_ReturnsErrorsNamingEachField(string json, string[] expectedFields)
  {
    var response = await PostLogin(json);

    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    var problem = (await response.Content.ReadFromJsonAsync<ValidationProblemDetails>())!;
    Assert.Equal(expectedFields.Order(), problem.Errors.Keys.Order());
    Assert.All(problem.Errors.Values, messages => Assert.All(messages, m => Assert.False(string.IsNullOrWhiteSpace(m))));
  }

  // Largo permitido: 4 a 50. Dentro del rango el usuario no existe, así que llega al 401 y no se rechaza por formato.
  [Theory]
  [InlineData(1, HttpStatusCode.BadRequest)]
  [InlineData(3, HttpStatusCode.BadRequest)]
  [InlineData(4, HttpStatusCode.Unauthorized)]
  [InlineData(50, HttpStatusCode.Unauthorized)]
  [InlineData(51, HttpStatusCode.BadRequest)]
  public async Task Login_UsernameLengthBoundaries_ReturnsExpectedStatus(int length, HttpStatusCode expected)
  {
    var response = await PostLogin($$"""{"username":"{{new string('a', length)}}","password":"chiga1234"}""");

    Assert.Equal(expected, response.StatusCode);
    AssertNoCookie(response);
  }

  // El largo se mide sin los espacios de los extremos, pero el valor no se recorta: por eso los válidos llegan al 401.
  [Theory]
  [InlineData("ab  ", HttpStatusCode.BadRequest)]
  [InlineData("  ab", HttpStatusCode.BadRequest)]
  [InlineData(" ab ", HttpStatusCode.BadRequest)]
  [InlineData("    ", HttpStatusCode.BadRequest)]
  [InlineData(" abcd ", HttpStatusCode.Unauthorized)]
  [InlineData(" aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa ", HttpStatusCode.Unauthorized)] // 50 caracteres
  public async Task Login_UsernameWithSurroundingSpaces_ValidatesTrimmedLength(string username, HttpStatusCode expected)
  {
    var client = factory.CreateClient();

    var response = await client.PostAsJsonAsync("/auth/login", new { username, password = "chiga1234" });

    Assert.Equal(expected, response.StatusCode);
    AssertNoCookie(response);
  }

  [Theory]
  [InlineData("vendedor", "chiga1234 ")]             // espacio de más
  [InlineData("vendedor", " chiga1234")]
  [InlineData("vendedor", "CHIGA1234")]              // la contraseña distingue mayúsculas
  [InlineData("vendedor", "chiga123")]               // prefijo de la contraseña real
  [InlineData("vendedor", "' OR '1'='1")]            // inyección SQL en la contraseña
  [InlineData("' OR '1'='1", "chiga1234")]           // inyección SQL en el usuario
  [InlineData("vendedor' --", "chiga1234")]
  [InlineData("vendedor\0", "chiga1234")]            // carácter nulo
  [InlineData("vendedor ", "chiga1234")]             // el usuario no se recorta
  [InlineData("vendedor", "chiga1234\0")]            // carácter nulo en la contraseña
  public async Task Login_TrickyCredentials_ReturnsUnauthorized(string username, string password)
  {
    var client = factory.CreateClient();

    var response = await client.PostAsJsonAsync("/auth/login", new { username, password });

    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    AssertNoCookie(response);
  }

  [Fact]
  public async Task Login_VeryLongPassword_ReturnsUnauthorizedAndNotServerError()
  {
    var client = factory.CreateClient();

    var response = await client.PostAsJsonAsync("/auth/login", new { username = "vendedor", password = new string('x', 100_000) });

    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    AssertNoCookie(response);
  }

  [Fact]
  public async Task Login_DisabledUserCorrectPassword_ReturnsUnauthorizedWithOwnDetail()
  {
    var client = factory.CreateClient();

    var disabled = await client.PostAsJsonAsync("/auth/login", new { username = "inactivo", password = "chiga1234" });
    var generic = await client.PostAsJsonAsync("/auth/login", new { username = "vendedor", password = "incorrecta" });

    Assert.Equal(HttpStatusCode.Unauthorized, disabled.StatusCode);
    AssertNoCookie(disabled);
    Assert.Equal("application/problem+json", disabled.Content.Headers.ContentType?.MediaType);
    var detailDisabled = (await disabled.Content.ReadFromJsonAsync<ProblemDetails>())!.Detail;
    var detailGeneric = (await generic.Content.ReadFromJsonAsync<ProblemDetails>())!.Detail;
    Assert.False(string.IsNullOrWhiteSpace(detailDisabled));
    Assert.NotEqual(detailGeneric, detailDisabled);
  }

  [Fact]
  public async Task Login_StoredHashUsedAsPassword_ReturnsUnauthorized()
  {
    var dataSource = factory.Services.GetRequiredService<NpgsqlDataSource>();
    await using var cmd = dataSource.CreateCommand("SELECT contrasena FROM usuario WHERE nombre_usuario = 'vendedor'");
    var hash = (string)(await cmd.ExecuteScalarAsync())!;

    var response = await factory.CreateClient().PostAsJsonAsync("/auth/login", new { username = "vendedor", password = hash });

    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    AssertNoCookie(response);
  }

  [Fact]
  public async Task Me_WithSession_ReturnsSessionUser()
  {
    var client = factory.CreateClient();
    var login = await client.PostAsJsonAsync("/auth/login", new { username = "vendedor", password = "chiga1234" });
    var sessionCookie = Assert.Single(SetCookies(login)).Split(';')[0];

    var response = await GetMe(client, sessionCookie);

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    var usuario = await response.Content.ReadFromJsonAsync<UsuarioDTO>();
    Assert.Equal("vendedor", usuario!.NombreUsuario);
    Assert.Equal("Valeria", usuario.Nombre);
    Assert.Equal(["Vendedor"], usuario.Roles);
  }

  [Fact]
  public async Task Me_WithoutSession_ReturnsUnauthorized()
  {
    var response = await factory.CreateClient().GetAsync("/auth/me");

    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
  }

  [Fact]
  public async Task Me_TamperedCookie_ReturnsUnauthorized()
  {
    var client = factory.CreateClient();
    var login = await client.PostAsJsonAsync("/auth/login", new { username = "vendedor", password = "chiga1234" });
    var sessionCookie = Assert.Single(SetCookies(login)).Split(';')[0];
    // Cambia un carácter del medio (el último puede no alterar ningún byte): la firma ya no coincide.
    var middle = sessionCookie.Length / 2;
    var tampered = sessionCookie[..middle] + (sessionCookie[middle] == 'A' ? 'B' : 'A') + sessionCookie[(middle + 1)..];

    var response = await GetMe(client, tampered);

    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
  }

  private static Task<HttpResponseMessage> GetMe(HttpClient client, string cookie)
  {
    var request = new HttpRequestMessage(HttpMethod.Get, "/auth/me");
    request.Headers.Add("Cookie", cookie);
    return client.SendAsync(request);
  }

  [Fact]
  public async Task Logout_WithSession_ReturnsNoContentAndExpiresCookie()
  {
    var client = factory.CreateClient();
    var login = await client.PostAsJsonAsync("/auth/login", new { username = "vendedor", password = "chiga1234" });
    var sessionCookie = Assert.Single(SetCookies(login)).Split(';')[0];

    var request = new HttpRequestMessage(HttpMethod.Post, "/auth/logout");
    request.Headers.Add("Cookie", sessionCookie);
    var response = await client.SendAsync(request);

    Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    AssertExpiresSessionCookie(response);
  }

  [Fact]
  public async Task Logout_WithoutSession_ReturnsNoContentAndExpiresCookie()
  {
    var response = await factory.CreateClient().PostAsync("/auth/logout", null);

    Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    AssertExpiresSessionCookie(response);
  }

  // Borrar una cookie es mandarla vacía y con una fecha de vencimiento ya pasada.
  private static void AssertExpiresSessionCookie(HttpResponseMessage response)
  {
    var parts = Assert.Single(SetCookies(response)).Split(';').Select(part => part.Trim()).ToList();
    Assert.Equal("chiga_auth=", parts[0]);
    var expires = parts.Single(part => part.StartsWith("expires=", StringComparison.OrdinalIgnoreCase));
    Assert.True(DateTimeOffset.Parse(expires["expires=".Length..]) < DateTimeOffset.UtcNow);
  }

  private class FakeUserRepository((Usuario User, string Contrasenia)? resultado) : IUserRepository
  {
    public Task<(Usuario User, string Contrasenia)?> FindByNombreUsuarioAsync(string nombreUsuario, CancellationToken ct = default)
      => Task.FromResult(resultado);

    public Task<Usuario?> FindByIdAsync(int id, CancellationToken ct = default)
      => Task.FromResult(resultado?.User);
  }
}
