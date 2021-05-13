using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SignalRChatApp.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace SignalRChatApp.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<ApplicationUser> ApplicationUsers { get; set; }

        public DbSet<Friends> Friends { get; set; }

        public DbSet<Messages> Messages { get; set; }

    }

}
