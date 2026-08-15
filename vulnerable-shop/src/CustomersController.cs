using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace VulnerableShop;

[ApiController]
[Route("api/customers")]
public class CustomersController : ControllerBase
{
    private readonly ShopDbContext _db;

    // Mass assignment (CWE-915): the whole Customer entity is bound from the request body.
    [HttpPost]
    public IActionResult Register(Customer customer)
    {
        _db.Customers.Add(customer);
        _db.SaveChanges();
        return Ok(customer.Id);
    }

    // SQL injection (CWE-89): the id is concatenated into the query.
    [HttpGet("{id}")]
    public IActionResult Get(string id)
    {
        var cmd = new SqlCommand("SELECT * FROM Customers WHERE Id = " + id);
        return Ok(cmd);
    }
}
