using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SignalRChatApp.Hubs
{
    [Authorize]
    public class MainHub : Hub
    {
        
    }
}
