using Microsoft.EntityFrameworkCore;
using PacMan2.Data;
using PacMan2.Models;

var builder = WebApplication.CreateBuilder(args);

// ── Services ────────────────────────────────────────────────────────────────

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
    
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ── Build ────────────────────────────────────────────────────────────────────

var app = builder.Build();

// ── Auto-migrate on startup ──────────────────────────────────────────────────

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// ── Middleware ───────────────────────────────────────────────────────────────

app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

// ── Endpoints ────────────────────────────────────────────────────────────────

// Health check
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

// POST /api/scores – save a game result
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
        PlayerName     = dto.PlayerName.Trim(),
        Game           = string.IsNullOrWhiteSpace(dto.Game) ? "pacman" : dto.Game.Trim().ToLower(),
        Points         = dto.Points,
        IsWin          = dto.IsWin,
        DurationSeconds = dto.DurationSeconds,
        PlayedAtUtc    = DateTime.UtcNow
    };

    db.Scores.Add(score);
    await db.SaveChangesAsync();

    return Results.Created($"/api/scores/{score.Id}", score);
});

// GET /api/scores/raw – all records, newest first
app.MapGet("/api/scores/raw", async (AppDbContext db) =>
{
    var scores = await db.Scores
        .OrderByDescending(s => s.PlayedAtUtc)
        .ToListAsync();

    return Results.Ok(scores);
});

// GET /api/scores/summary – per-player aggregated leaderboard
app.MapGet("/api/scores/summary", async (AppDbContext db) =>
{
    var summary = await db.Scores
        .GroupBy(s => s.PlayerName)
        .Select(g => new ScoreSummaryDto
        {
            PlayerName      = g.Key,
            TotalScore      = g.Sum(s => s.Points),
            TotalGames      = g.Count(),
            TotalWins       = g.Count(s => s.IsWin),
            BestScore       = g.Max(s => s.Points),
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
