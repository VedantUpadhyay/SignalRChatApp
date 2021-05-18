using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace SignalRChatApp.Models
{
    public class GroupMembers
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int GroupId { get; set; }

        [Required]
        public string UserId { get; set; }

        public int PendingMessageCount { get; set; }
    }
}
