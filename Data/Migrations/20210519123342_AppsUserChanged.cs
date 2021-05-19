using Microsoft.EntityFrameworkCore.Migrations;

namespace SignalRChatApp.Data.Migrations
{
    public partial class AppsUserChanged : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RecentOrder",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RecentOrder",
                table: "AspNetUsers");
        }
    }
}
