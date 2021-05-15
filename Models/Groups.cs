using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace SignalRChatApp.Models
{
    public class Groups
    {
        [Key]
        public int GroupId { get; set; }

        [Display(Name = "Group Name")]
        [Required,DataType(DataType.Text),MaxLength(15)]
        public string GroupName { get; set; }

        [Display(Name = "Group Image")]
        [DataType(DataType.Text),MaxLength(75)]
        public string GroupImage { get; set; }


    }
}
