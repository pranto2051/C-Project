using BCrypt.Net;

class Program
{
    static void Main()
    {
        var passwords = new Dictionary<string, string>
        {
            { "admin@ecommerce.com", "Admin@123" },
            { "dealer@ecommerce.com", "Dealer@123" },
            { "customer@ecommerce.com", "Customer@123" }
        };

        foreach (var kvp in passwords)
        {
            var hash = BCrypt.HashPassword(kvp.Value, 11);
            Console.WriteLine($"Email: {kvp.Key}");
            Console.WriteLine($"Password: {kvp.Value}");
            Console.WriteLine($"Hash: {hash}");
            Console.WriteLine();
        }
    }
}
