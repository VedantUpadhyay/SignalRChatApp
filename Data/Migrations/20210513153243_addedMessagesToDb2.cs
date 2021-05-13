using Microsoft.EntityFrameworkCore.Migrations;

namespace SignalRChatApp.Data.Migrations
{
    public partial class addedMessagesToDb2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Text",
                table: "Messages",
                type: "nvarchar(350)",
                maxLength: 350,
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Text",
                table: "Messages");
        }
    }
}
