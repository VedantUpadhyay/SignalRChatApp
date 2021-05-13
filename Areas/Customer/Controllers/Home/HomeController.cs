using Microsoft.AspNetCore.Authorization;
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

namespace SignalRChatApp.Controllers
{
    [Area("Customer")]
    [Authorize]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;

        public HomeController(ILogger<HomeController> logger,
            ApplicationDbContext db,
            UserManager<ApplicationUser> userManager)
        {
            _logger = logger;
            _db = db;
            _userManager = userManager;
        }

        public IActionResult Index()
        {
            var myId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var myFriends = _db.Friends.Where(u => u.MyId == myId ).Select(u => u.FriendId).ToList();
            List<ApplicationUser> FriendUser = new List<ApplicationUser>();
            var moreFriends = _db.Friends.Where(u => u.FriendId == myId).Select(u => u.MyId).ToList();

            foreach (var item in myFriends)
            {
                FriendUser.Add(_userManager.FindByIdAsync(item).Result);
            }

            foreach (var item in moreFriends)
            {
                FriendUser.Add(_userManager.FindByIdAsync(item).Result);
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

        public IActionResult GetMatchingUsers(string userName)
        {
            return Json(new
            {
                users = _db.ApplicationUsers.Where(u => u.ChatName.Contains(userName) && u.Email != User.Identity.Name).Select(u => new
                {
                    u.ChatName,u.Email
                }).ToList()
            });
        }

        //Add Friends
        [HttpPost]
        public IActionResult AddFriend(string friendEmail)
        {
            if (friendEmail != null)
            {
                var myUserId = User.FindFirst(ClaimTypes.NameIdentifier).Value;
                var friendId = _userManager.FindByEmailAsync(friendEmail).Result.Id;

                //check if he is already my friend
                var friendsListCount = _db.Friends.Where(
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
