using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PacMan2.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Scores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlayerName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Game = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "pacman"),
                    Points = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsWin = table.Column<bool>(type: "bit", nullable: false),
                    DurationSeconds = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    PlayedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Scores", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Scores");
        }
    }
}
