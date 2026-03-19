using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PacMan2.Data;
using PacMan2.Models;

var builder = WebApplication.CreateBuilder(args);

// Connection string
var connectionString = builder.Configuration.GetConnectionString("Default")
                      ?? throw new InvalidOperationException("Connection string 'Default' bulunamadı.");

// Debug log
var csb = new SqlConnectionStringBuilder(connectionString);
Console.WriteLine("=== ACTIVE SQL SETTINGS ===");
Console.WriteLine($"DataSource: {csb.DataSource}");
Console.WriteLine($"InitialCatalog: {csb.InitialCatalog}");
Console.WriteLine($"UserID: {csb.UserID}");
Console.WriteLine("===========================");

// DbContext
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

// Middleware
app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

// Health
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

// DB test
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

// POST /api/scores
app.MapPost("/api/scores", async (ScoreCreateDto dto, AppDbContext db) =>
{
    try
    {
        if (string.IsNullOrWhiteSpace(dto.PlayerName))
            return Results.BadRequest(new { error = "PlayerName boş olamaz." });

        if (dto.Points < 0)
            return Results.BadRequest(new { error = "Points negatif olamaz." });

        if (dto.DurationSeconds < 0)
            return Results.BadRequest(new { error = "DurationSeconds negatif olamaz." });

        var score = new Score
        {
            PlayerName = dto.PlayerName.Trim(),
            Game = string.IsNullOrWhiteSpace(dto.Game) ? "pacman" : dto.Game.Trim().ToLower(),
            Points = dto.Points,
            IsWin = dto.IsWin,
            DurationSeconds = dto.DurationSeconds,
            PlayedAtUtc = DateTime.UtcNow
        };

        db.Scores.Add(score);
        await db.SaveChangesAsync();

        return Results.Created($"/api/scores/{score.Id}", score);
    }
    catch (Exception ex)
    {
        return Results.Problem(
            title: "Create score error",
            detail: ex.ToString(),
            statusCode: 500
        );
    }
});

// GET /api/scores/raw
app.MapGet("/api/scores/raw", async (AppDbContext db) =>
{
    try
    {
        var scores = await db.Scores
            .OrderByDescending(s => s.PlayedAtUtc)
            .ToListAsync();

        return Results.Ok(scores);
    }
    catch (Exception ex)
    {
        return Results.Problem(
            title: "Raw scores error",
            detail: ex.ToString(),
            statusCode: 500
        );
    }
});

// GET /api/scores/summary
app.MapGet("/api/scores/summary", async (AppDbContext db) =>
{
    try
    {
        var scores = await db.Scores.ToListAsync();

        var summary = scores
            .GroupBy(s => s.PlayerName)
            .Select(g => new ScoreSummaryDto
            {
                PlayerName = g.Key,
                TotalScore = g.Sum(s => s.Points),
                TotalGames = g.Count(),
                TotalWins = g.Count(s => s.IsWin),
                BestScore = g.Max(s => s.Points),
                LastPlayedAtUtc = g.Max(s => (DateTime?)s.PlayedAtUtc)
            })
            .OrderByDescending(s => s.TotalScore)
            .ThenByDescending(s => s.TotalWins)
            .ThenByDescending(s => s.BestScore)
            .ThenBy(s => s.PlayerName)
            .ToList();

        return Results.Ok(summary);
    }
    catch (Exception ex)
    {
        return Results.Problem(
            title: "Leaderboard error",
            detail: ex.ToString(),
            statusCode: 500
        );
    }
});

// DELETE /api/scores/by-player/{playerName}
app.MapDelete("/api/scores/by-player/{playerName}", async (string playerName, AppDbContext db) =>
{
    try
    {
        var normalized = playerName.Trim().ToLower();

        var scores = await db.Scores
            .Where(s => s.PlayerName.ToLower() == normalized)
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