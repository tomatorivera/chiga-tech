using System.Security.Claims;
using System.Text.Json.Serialization;
using Api.Repositories;
using Api.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Enums como texto: el frontend los tipa como uniones de strings (ADR técnico 0001).
// Las claves de "errors" en los 400 usan el nombre del JSON ([JsonPropertyName]), no el de la propiedad de C#.
builder.Services.AddControllers(options => options.ModelMetadataDetailsProviders.Add(new SystemTextJsonValidationMetadataProvider()))
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
// Errores en formato ProblemDetails (RFC 9457), ver docs/contracts/README.md.
builder.Services.AddProblemDetails();

// Acceso a datos con ADO.NET + Npgsql (ADR técnico 0004). El contenedor libera el data source al cerrar.
builder.Services.AddSingleton(sp => NpgsqlDataSource.Create(
    sp.GetRequiredService<IConfiguration>().GetConnectionString("Default")
        ?? throw new InvalidOperationException("Falta ConnectionStrings:Default (variable de entorno ConnectionStrings__Default).")));

// Sesión con cookie de ASP.NET Core (ADR técnico 0003). Duración provisoria: 24 h sin actividad
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "chiga_auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.Cookie.SameSite = SameSiteMode.Strict;
        options.ExpireTimeSpan = TimeSpan.FromHours(24);
        options.SlidingExpiration = true;

        options.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = StatusCodes.Status401Unauthorized; return Task.CompletedTask; };
        options.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = StatusCodes.Status403Forbidden; return Task.CompletedTask; };

        // En cada request con cookie, revisa en la BD que el usuario siga activo: dar de baja a alguien
        // le corta el acceso en su próxima request, aunque su cookie no haya vencido (ADR técnico 0003)
        options.Events.OnValidatePrincipal = async ctx =>
        {
            var idClaim = ctx.Principal!.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var id = int.Parse(idClaim);

            var authService = ctx.HttpContext.RequestServices.GetRequiredService<IAuthService>();
            var user = await authService.GetSessionUserAsync(id, ctx.HttpContext.RequestAborted);

            if (user is null)
            {
                ctx.RejectPrincipal();
                await ctx.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            }
        };
    });

// Claves con las que ASP.NET cifra y firma la cookie (ADR técnico 0003). Van en un directorio fijo para que reiniciar
// la API no cierre las sesiones. Por defecto backend/Chiga.Api/keys, ignorado por git: son secretas.
// Se cambia con DataProtection:KeysPath (variable de entorno DataProtection__KeysPath).
var keysPath = builder.Configuration["DataProtection:KeysPath"]
    ?? Path.Combine(builder.Environment.ContentRootPath, "keys");
builder.Services.AddDataProtection().PersistKeysToFileSystem(new DirectoryInfo(keysPath));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "Mi API v1");
        options.RoutePrefix = "swagger"; // Disponible en /swagger
    });
    
    // Mapear "/" a "/swagger" en el navegador
    app.MapGet("/", () => Results.Redirect("/swagger"));
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

// Expone Program a WebApplicationFactory en Chiga.IntegrationTests.
public partial class Program { }
