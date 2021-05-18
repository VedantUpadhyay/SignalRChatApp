using Microsoft.EntityFrameworkCore.Migrations;

namespace SignalRChatApp.Data.Migrations
{
    public partial class GroupMembersModelChanges : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PendingMessageCount",
                table: "GroupMembers",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PendingMessageCount",
                table: "GroupMembers");
        }
    }
}
