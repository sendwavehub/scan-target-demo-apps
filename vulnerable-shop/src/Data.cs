using Microsoft.EntityFrameworkCore;

namespace VulnerableShop;

public class ShopDbContext : DbContext
{
    public DbSet<Customer> Customers { get; set; }
}

public class Customer
{
    public int Id { get; set; }
    public string Email { get; set; }
    public bool IsAdmin { get; set; }   // privileged — must never be client-settable
}
