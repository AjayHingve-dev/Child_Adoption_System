using ChildAdoptionAdmin.Api.Data;
using ChildAdoptionAdmin.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ChildAdoptionAdmin.Api.Services;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // The tables are created by database/database.sql.
        // This check gives a clear startup error when MySQL or the schema is unavailable.
        if (!await db.Database.CanConnectAsync())
        {
            throw new InvalidOperationException(
                "Cannot connect to MySQL. Check ConnectionStrings:Default and run database/database.sql first.");
        }

        const string email = "admin@cdac.org";
        const string defaultPassword = "Admin@123";

        var admin = await db.Admins.FirstOrDefaultAsync(a => a.Email == email);
        if (admin is null)
        {
            admin = new Admin
            {
                FirstName = "Admin",
                LastName = "User",
                Email = email,
                Password = BCrypt.Net.BCrypt.HashPassword(defaultPassword),
                Phone = "9876543210",
                Role = "SUPER_ADMIN",
                Status = "ACTIVE",
                CreatedAt = DateTime.UtcNow
            };
            db.Admins.Add(admin);
            await db.SaveChangesAsync();
            return;
        }

        // Repair the placeholder/invalid hash supplied in the original SQL file.
        var passwordWorks = false;
        try
        {
            passwordWorks = BCrypt.Net.BCrypt.Verify(defaultPassword, admin.Password);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            passwordWorks = false;
        }

        if (!passwordWorks)
        {
            admin.Password = BCrypt.Net.BCrypt.HashPassword(defaultPassword);
            admin.Role = "SUPER_ADMIN";
            admin.Status = "ACTIVE";
            await db.SaveChangesAsync();
        }
    }
}
