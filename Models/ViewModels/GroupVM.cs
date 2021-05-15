using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SignalRChatApp.Models.ViewModels
{
    public class GroupVM
    {
        public Groups Group { get; set; }

        public GroupMembers GroupMembers { get; set; }
    }
}
