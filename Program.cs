using Microsoft.EntityFrameworkCore;
using PacMan2.Data;
using PacMan2.Models;

var builder = WebApplication.CreateBuilder(args);

// Services
var connectionString =
    Environment.GetEnvironmentVariable("ConnectionStrings__Default")
    ?? builder.Configuration.GetConnectionString("Default");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

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

// Auto-migrate on startup (safe)
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
        Console.WriteLine("Migrate failed, trying EnsureCreated...");
        Console.WriteLine(ex.Message);

        try
        {
            db.Database.EnsureCreated();
            Console.WriteLine("Database ensured/created successfully.");
        }
        catch (Exception ex2)
        {
            Console.WriteLine("EnsureCreated also failed.");
            Console.WriteLine(ex2.Message);
        }
    }
}

// Middleware
app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

// Health check
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

// POST /api/scores
app.MapPost("/api/scores", async (ScoreCreateDto dto, AppDbContext db) =>
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
});

// GET /api/scores/raw
app.MapGet("/api/scores/raw", async (AppDbContext db) =>
{
    var scores = await db.Scores
        .OrderByDescending(s => s.PlayedAtUtc)
        .ToListAsync();

    return Results.Ok(scores);
});

// GET /api/scores/summary
app.MapGet("/api/scores/summary", async (AppDbContext db) =>
{
    var summary = await db.Scores
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
        .ToListAsync();

    return Results.Ok(summary);
});

app.Run();