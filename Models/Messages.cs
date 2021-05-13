using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace SignalRChatApp.Models
{
    public class Messages
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string SenderId { get; set; }

        [Required]
        [MaxLength(350)]
        public string Text { get; set; }

        [Required]
        public string ReceiverId { get; set; }

        [Required]
        [DataType(DataType.Text),MaxLength(25)]
        public string SentTime { get; set; }

        public bool IsPending { get; set; }
    }
}
