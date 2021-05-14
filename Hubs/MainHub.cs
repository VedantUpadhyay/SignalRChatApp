using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using SignalRChatApp.Data;
using SignalRChatApp.Models;
using System.Security.Claims;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SignalRChatApp.Hubs
{
    [Authorize]
    public class MainHub : Hub
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly OnlineUsers _onlineUsersManager;

        public MainHub(ApplicationDbContext db,UserManager<ApplicationUser> userManager,
            OnlineUsers onlineUsersManager)
        {
            _db = db;
            _userManager = userManager;
            _onlineUsersManager = onlineUsersManager;
        }

        public async override Task OnConnectedAsync()
        {
            var currentLoggedUser = await _db.ApplicationUsers.FindAsync(Context.User.FindFirstValue(ClaimTypes.NameIdentifier));
            currentLoggedUser.IsOnline = true;
            await _db.SaveChangesAsync();

            _onlineUsersManager.onlineUsers.Add(Context.User.Identity.Name);
            await Clients.AllExcept(Context.ConnectionId).SendAsync("ChangeActiveStatus", Context.User.Identity.Name, "online");
        }

        public override async Task OnDisconnectedAsync(Exception ex = null)
        {

            var currentLoggedUser = await _db.ApplicationUsers.FindAsync(Context.User.FindFirstValue(ClaimTypes.NameIdentifier));
            currentLoggedUser.IsOnline = false;
            await _db.SaveChangesAsync();

            _onlineUsersManager.onlineUsers.Remove(Context.User.Identity.Name);
            await Clients.All.SendAsync("ChangeActiveStatus", Context.User.Identity.Name, "offline");
        }

        public string SendMessage(string RecvUser,string message)
        {
            var senderEmail = Context.User.Identity.Name;
            var recvId = _userManager.FindByEmailAsync(RecvUser).Result.Id;
            try
            {
                var messageModel = new Messages
                {
                    SenderId = Context.User.FindFirstValue(ClaimTypes.NameIdentifier),
                    SentTime = DateTime.Now.ToLocalTime().ToString(),
                    ReceiverId = recvId,
                    Text = message,
                    IsPending = true
                };

                _db.Messages.Add(messageModel);
                _db.SaveChanges();
                //recv is online..
                if (_onlineUsersManager.onlineUsers.Contains(RecvUser))
                {
                    


                    Clients.User(recvId).SendAsync("ReceiveMessage", senderEmail,message);
                    return DateTime.Now.ToShortTimeString();
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return $"{RecvUser} isn't online";
        }

        public async Task UpdatePendingMessages(string chatEmail)
        {
            string myId = Context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            ApplicationUser myFriend = await _userManager.FindByEmailAsync(chatEmail);
            string myFrindId = myFriend.Id;

            foreach (var item in _db.Messages
                .Where(
                    u => u.ReceiverId == myId && u.SenderId == myFrindId
                )
                .ToList())
            {
                item.IsPending = false;
                 _db.Update(item);
                await _db.SaveChangesAsync();
            }

        }

        public async Task TypingAnimate(string userToSend)
        {
            ApplicationUser recvUser = await _userManager.FindByEmailAsync(userToSend);
            string recvId = recvUser.Id;

            string typingUserEmail = _userManager.GetUserAsync(Context.User).Result.Email;

            //check if that user is online
            if (_onlineUsersManager.onlineUsers.Contains(userToSend))
            {
                //forward typing animation..
                await Clients.User(recvId).SendAsync("SetTypingAnimation", typingUserEmail);
            }
        }
    }
}
