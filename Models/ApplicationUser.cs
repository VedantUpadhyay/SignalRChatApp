using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace SignalRChatApp.Models
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        [MaxLength(25)]
        [Display(Name = "Chat User Name")]
        public string ChatName { get; set; }

        public string ProfileImage { get; set; }

        public bool IsOnline { get; set; }
    }
}
