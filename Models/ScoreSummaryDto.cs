namespace PacMan2.Models;

public class ScoreSummaryDto
{
    public string PlayerName { get; set; } = string.Empty;
    public int TotalScore { get; set; }
    public int TotalGames { get; set; }
    public int TotalWins { get; set; }
    public int BestScore { get; set; }
    public DateTime? LastPlayedAtUtc { get; set; }
}
