namespace PacMan2.Models;

public class Score
{
    public int Id { get; set; }
    public string PlayerName { get; set; } = string.Empty;
    public string Game { get; set; } = "pacman";
    public int Points { get; set; }
    public bool IsWin { get; set; }
    public int DurationSeconds { get; set; }
    public DateTime PlayedAtUtc { get; set; } = DateTime.UtcNow;
}
