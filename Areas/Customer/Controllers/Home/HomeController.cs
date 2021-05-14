﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SignalRChatApp.Data;
using SignalRChatApp.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using System.Text;
using System.Runtime.Serialization.Formatters.Binary;
using System.IO;
using System.Text.Json;

namespace SignalRChatApp.Controllers
{
    [Area("Customer")]
    [Authorize]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly OnlineUsers _onlineUsersManager;

        public HomeController(ILogger<HomeController> logger,
            ApplicationDbContext db,
            UserManager<ApplicationUser> userManager,
            OnlineUsers onlineUsersManager)
        {
            _logger = logger;
            _db = db;
            _userManager = userManager;
            _onlineUsersManager = onlineUsersManager;

        }

        [HttpGet]
        public async Task GetOnlineUsers()
        {
            Response.Headers.Add("Content-Type", "text/event-stream");
            var onlineUsers = _onlineUsersManager.onlineUsers;

            for (int i = 0; i < 5; i--)
            {
                var msg = JsonSerializer.Serialize(onlineUsers);
                var bytes = Encoding.ASCII.GetBytes($"data: {msg}\n\n");
                await Task.Delay(TimeSpan.FromSeconds(2));
                await Response.Body.WriteAsync(bytes, 0, bytes.Length);
                await HttpContext.Response.Body.FlushAsync();
                Response.Body.Close();

            }

        }

        public IActionResult Index()
        {
            var myId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var myFriends = _db.Friends.Where(u => u.MyId == myId ).Select(u => u.FriendId).ToList();
            List<ApplicationUser> FriendUser = new List<ApplicationUser>();
            var moreFriends = _db.Friends.Where(u => u.FriendId == myId).Select(u => u.MyId).ToList();

            foreach (var item in myFriends)
            {
                FriendUser
                    .Add(_userManager.FindByIdAsync(item).Result);
            }

            foreach (var item in moreFriends)
            {
                FriendUser
                    .Add(_userManager.FindByIdAsync(item).Result);
            }

            return View(FriendUser);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        #region AJAX Calls

        [HttpGet]
        public async Task<IActionResult> GetMyMessages(string senderEmail)
        {
            string myId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            ApplicationUser sender = await _userManager.FindByNameAsync(senderEmail);

            string senderId = sender.Id;

            var messages = _db.Messages
                .Where(u => u.ReceiverId == myId && u.SenderId == senderId || (u.SenderId == myId && u.ReceiverId == senderId))
                .Select(x => new
                {
                    senderEmail = _userManager.FindByIdAsync(x.SenderId).Result.Email,
                    recvEmail = _userManager.FindByIdAsync(x.ReceiverId).Result.Email,
                    sentTime = x.SentTime,
                    messageContent = x.Text
                })
                .ToList();
                
                

            if (messages.Count > 0)
            {
                return Json(new
                {
                    success = true,
                    messages = messages
                });
            }
            return Json(new
            {
                success = false,
                context = "No messages.."
            });
        }


        public IActionResult GetMatchingUsers(string userName)
        {
            return Json(new
            {
                users = _db.ApplicationUsers
                .Where(u => u.ChatName
                .Contains(userName) && u.Email != User.Identity.Name)
                .Select(u => new
                {
                    u.ChatName,u.Email
                }).ToList()
            });
        }

        //Add Friends
        [HttpPost]
        public async Task<IActionResult> AddFriend(string friendEmail)
        {
            if (friendEmail != null)
            {
                var myUserId = User.FindFirst(ClaimTypes.NameIdentifier).Value;
                var friendId = _userManager.FindByEmailAsync(friendEmail).Result.Id;

                //check if he is already my friend
                int friendsListCount = _db.Friends.Where(
                    u => u.MyId == myUserId && u.FriendId == friendId || (u.FriendId == myUserId && u.MyId == friendId)
                    ).ToList().Count;

                if (friendsListCount > 0)
                {
                    return Json(new
                    {
                        success = false,
                        alreadyFriend = true
                    });
                }

                var FriendModel = new Friends
                {
                    FriendId = friendId,
                    MyId = myUserId
                };
                _db.Friends.Add(FriendModel);
                _db.SaveChanges();

                return Json(new
                {
                    success = true
                });
            }
            return Json(new
            {
                success = false
            });
        }
        #endregion
    }
}
