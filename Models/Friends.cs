using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace SignalRChatApp.Models
{
    public class Friends
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string MyId { get; set; }

        [Required]
        public string FriendId { get; set; }

    }
}
