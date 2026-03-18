namespace PacMan2.Models;

public class ScoreCreateDto
{
    public string PlayerName { get; set; } = string.Empty;
    public string? Game { get; set; }
    public int Points { get; set; }
    public bool IsWin { get; set; }
    public int DurationSeconds { get; set; }
}
