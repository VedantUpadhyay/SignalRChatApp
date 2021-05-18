using Microsoft.EntityFrameworkCore.Migrations;

namespace SignalRChatApp.Data.Migrations
{
    public partial class MessageModelChanegs : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GroupId",
                table: "Messages",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GroupId",
                table: "Messages");
        }
    }
}
