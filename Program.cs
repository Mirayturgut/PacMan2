using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PacMan2.Data;
using PacMan2.Models;

var builder = WebApplication.CreateBuilder(args);

// önce connection string
var connectionString = builder.Configuration.GetConnectionString("Default");

// sonra logla
var csb = new SqlConnectionStringBuilder(connectionString);
Console.WriteLine("=== ACTIVE SQL SETTINGS ===");
Console.WriteLine($"DataSource: {csb.DataSource}");
Console.WriteLine($"InitialCatalog: {csb.InitialCatalog}");
Console.WriteLine($"UserID: {csb.UserID}");
Console.WriteLine("===========================");

// sonra DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
        sqlOptions.CommandTimeout(60);
    }));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Render port binding
var port = Environment.GetEnvironmentVariable("PORT") ?? "10000";
app.Urls.Add($"http://0.0.0.0:{port}");

// migrate bloğunu şimdilik kapat
/*
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    try
    {
        db.Database.Migrate();
        Console.WriteLine("Database migration completed.");
    }
    catch (Exception ex)
    {
        Console.WriteLine("Database migration skipped.");
        Console.WriteLine(ex.Message);
    }
}
*/

app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

app.MapGet("/api/db-test", async (AppDbContext db) =>
{
    try
    {
        var canConnect = await db.Database.CanConnectAsync();
        return Results.Ok(new { connected = canConnect });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            title: "DB connection error",
            detail: ex.ToString(),
            statusCode: 500
        );
    }
});

// DELETE endpoint sende kalsın
app.MapDelete("/api/scores/by-player/{playerName}", async (string playerName, AppDbContext db) =>
{
    try
    {
        var scores = await db.Scores
            .Where(s => s.PlayerName == playerName)
            .ToListAsync();

        if (!scores.Any())
            return Results.NotFound(new { error = "Oyuncu bulunamadı." });

        db.Scores.RemoveRange(scores);
        await db.SaveChangesAsync();

        return Results.Ok(new
        {
            message = $"{playerName} adlı oyuncunun tüm skorları silindi.",
            deletedCount = scores.Count
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            title: "Delete error",
            detail: ex.ToString(),
            statusCode: 500
        );
    }
});

app.Run();