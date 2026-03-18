using Microsoft.EntityFrameworkCore;
using PacMan2.Models;

namespace PacMan2.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Score> Scores => Set<Score>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Score>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                  .ValueGeneratedOnAdd();

            entity.Property(e => e.PlayerName)
                  .IsRequired()
                  .HasMaxLength(100);

            entity.Property(e => e.Game)
                  .IsRequired()
                  .HasMaxLength(50)
                  .HasDefaultValue("pacman");

            entity.Property(e => e.Points)
                  .HasDefaultValue(0);

            entity.Property(e => e.DurationSeconds)
                  .HasDefaultValue(0);

            entity.Property(e => e.PlayedAtUtc)
                  .HasDefaultValueSql("GETUTCDATE()");
        });
    }
}
