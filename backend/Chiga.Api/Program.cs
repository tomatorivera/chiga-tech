using System.Text.Json.Serialization;
using Api.Repositories;
using Api.Services;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Enums como texto: el frontend los tipa como uniones de strings (ADR técnico 0001).
builder.Services.AddControllers().AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
// Errores en formato ProblemDetails (RFC 9457), ver docs/contracts/README.md.
builder.Services.AddProblemDetails();

// Acceso a datos con ADO.NET + Npgsql (ADR técnico 0004). El contenedor libera el data source al cerrar.
builder.Services.AddSingleton(sp => NpgsqlDataSource.Create(
    sp.GetRequiredService<IConfiguration>().GetConnectionString("Default")
        ?? throw new InvalidOperationException("Falta ConnectionStrings:Default (variable de entorno ConnectionStrings__Default).")));

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
app.UseAuthorization();
app.MapControllers();

app.Run();

// Expone Program a WebApplicationFactory en Chiga.IntegrationTests.
public partial class Program { }
