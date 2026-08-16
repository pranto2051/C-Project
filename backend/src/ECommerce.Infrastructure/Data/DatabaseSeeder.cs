using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Data;

public class DatabaseSeeder
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private static readonly Random _random = new(42);

    public DatabaseSeeder(AppDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task SeedAsync()
    {
        // Seed Categories
        if (!await _context.Categories.AnyAsync())
        {
            var categories = GetSeedCategories();
            await _context.Categories.AddRangeAsync(categories);
            await _context.SaveChangesAsync();
        }

        // Seed Demo Users (Admin + 10 Dealers + 10 Customers)
        if (!await _context.Users.AnyAsync())
        {
            var users = GetSeedUsers();
            await _context.Users.AddRangeAsync(users);
            await _context.SaveChangesAsync();
        }

        // Seed Dealer Profiles
        if (!await _context.DealerProfiles.AnyAsync())
        {
            var dealers = await _context.Users.Where(u => u.Role == UserRole.Dealer).ToListAsync();
            var categories = await _context.Categories.ToListAsync();
            var dealerProfiles = GetSeedDealerProfiles(dealers, categories);
            await _context.DealerProfiles.AddRangeAsync(dealerProfiles);
            await _context.SaveChangesAsync();
        }

        // Seed Customer Profiles
        if (!await _context.CustomerProfiles.AnyAsync())
        {
            var customers = await _context.Users.Where(u => u.Role == UserRole.Customer).ToListAsync();
            var customerProfiles = customers.Select(c => new CustomerProfile
            {
                Id = Guid.NewGuid(),
                UserId = c.Id,
                ShippingAddress = $"{_random.Next(1, 999)} Demo Street, Demo City, Country"
            }).ToList();
            await _context.CustomerProfiles.AddRangeAsync(customerProfiles);
            await _context.SaveChangesAsync();
        }

        // Seed Products (50 per dealer, mix of approval statuses)
        if (!await _context.Products.AnyAsync())
        {
            var dealerProfiles = await _context.DealerProfiles.ToListAsync();
            var categories = await _context.Categories.ToListAsync();
            var products = GetSeedProducts(dealerProfiles, categories);
            await _context.Products.AddRangeAsync(products);
            await _context.SaveChangesAsync();
        }

        // Seed Product Images
        if (!await _context.ProductImages.AnyAsync())
        {
            var products = await _context.Products.ToListAsync();
            var images = products.Select(p => new ProductImage
            {
                Id = Guid.NewGuid(),
                ProductId = p.Id,
                ImageUrl = $"https://picsum.photos/seed/{p.Id.ToString()[..8]}/400/400",
                DisplayOrder = 0
            }).ToList();
            await _context.ProductImages.AddRangeAsync(images);
            await _context.SaveChangesAsync();
        }

        // Seed Carts (one per customer)
        if (!await _context.Carts.AnyAsync())
        {
            var customerProfiles = await _context.CustomerProfiles.ToListAsync();
            var carts = customerProfiles.Select(cp => new Cart
            {
                Id = Guid.NewGuid(),
                CustomerId = cp.Id
            }).ToList();
            await _context.Carts.AddRangeAsync(carts);
            await _context.SaveChangesAsync();
        }

        // Seed Orders (some orders with items)
        if (!await _context.Orders.AnyAsync())
        {
            var customerProfiles = await _context.CustomerProfiles.ToListAsync();
            var products = await _context.Products.Where(p => p.ApprovalStatus == ApprovalStatus.Approved).ToListAsync();
            var dealerProfiles = await _context.DealerProfiles.ToListAsync();
            var orders = GetSeedOrders(customerProfiles, products, dealerProfiles);
            await _context.Orders.AddRangeAsync(orders);
            await _context.SaveChangesAsync();
        }
    }

    public async Task ClearDemoDataAsync()
    {
        // Remove in reverse dependency order
        var orderItems = await _context.OrderItems.ToListAsync();
        if (orderItems.Any()) _context.OrderItems.RemoveRange(orderItems);

        var orders = await _context.Orders.ToListAsync();
        if (orders.Any()) _context.Orders.RemoveRange(orders);

        var cartItems = await _context.CartItems.ToListAsync();
        if (cartItems.Any()) _context.CartItems.RemoveRange(cartItems);

        var carts = await _context.Carts.ToListAsync();
        if (carts.Any()) _context.Carts.RemoveRange(carts);

        var productImages = await _context.ProductImages.ToListAsync();
        if (productImages.Any()) _context.ProductImages.RemoveRange(productImages);

        var products = await _context.Products.ToListAsync();
        if (products.Any()) _context.Products.RemoveRange(products);

        var dealerProfiles = await _context.DealerProfiles.ToListAsync();
        if (dealerProfiles.Any()) _context.DealerProfiles.RemoveRange(dealerProfiles);

        var customerProfiles = await _context.CustomerProfiles.ToListAsync();
        if (customerProfiles.Any()) _context.CustomerProfiles.RemoveRange(customerProfiles);

        var users = await _context.Users.ToListAsync();
        if (users.Any()) _context.Users.RemoveRange(users);

        var categories = await _context.Categories.ToListAsync();
        if (categories.Any()) _context.Categories.RemoveRange(categories);

        await _context.SaveChangesAsync();
    }

    private static List<Category> GetSeedCategories()
    {
        return new List<Category>
        {
            new() { Id = Guid.NewGuid(), Name = "Electronics", Description = "Electronic devices and accessories" },
            new() { Id = Guid.NewGuid(), Name = "Clothing", Description = "Fashion and apparel" },
            new() { Id = Guid.NewGuid(), Name = "Home & Garden", Description = "Home improvement and garden supplies" },
            new() { Id = Guid.NewGuid(), Name = "Books", Description = "Books and educational materials" },
            new() { Id = Guid.NewGuid(), Name = "Sports", Description = "Sports equipment and accessories" },
            new() { Id = Guid.NewGuid(), Name = "Toys", Description = "Toys and games for all ages" },
            new() { Id = Guid.NewGuid(), Name = "Automotive", Description = "Car parts and accessories" },
            new() { Id = Guid.NewGuid(), Name = "Health", Description = "Health and wellness products" },
        };
    }

    private static List<User> GetSeedUsers()
    {
        var users = new List<User>();

        // Admin
        users.Add(new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@ecommerce.com",
            FullName = "System Admin",
            Phone = "+1000000000",
            Role = UserRole.Admin,
            IsActive = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123")
        });

        // 10 Dealers
        var dealerNames = new[] { "Tech Galaxy", "Fashion Hub", "Home Essentials", "Bookworm Paradise", "Sports Zone", "Toy World", "Auto Parts Pro", "Health Plus", "Gadget Store", "Style Studio" };
        var dealerEmails = new[] { "tech@demo.com", "fashion@demo.com", "home@demo.com", "books@demo.com", "sports@demo.com", "toys@demo.com", "auto@demo.com", "health@demo.com", "gadgets@demo.com", "style@demo.com" };
        var dealerFullNames = new[] { "Alex Tech", "Sarah Fashion", "Mike Home", "Emma Books", "David Sports", "Lisa Toys", "James Auto", "Olivia Health", "Noah Gadgets", "Ava Style" };

        for (int i = 0; i < 10; i++)
        {
            users.Add(new User
            {
                Id = Guid.NewGuid(),
                Email = dealerEmails[i],
                FullName = dealerFullNames[i],
                Phone = $"+100000{i + 1:D4}",
                Role = UserRole.Dealer,
                IsActive = true,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Dealer@123")
            });
        }

        // 10 Customers
        var customerNames = new[] { "John Buyer", "Jane Shopper", "Bob Customer", "Alice Consumer", "Tom Price", "Mary Saver", "Chris Deal", "Nina Bargain", "Eric Value", "Sara Smart" };
        var customerEmails = new[] { "john@demo.com", "jane@demo.com", "bob@demo.com", "alice@demo.com", "tom@demo.com", "mary@demo.com", "chris@demo.com", "nina@demo.com", "eric@demo.com", "sara@demo.com" };

        for (int i = 0; i < 10; i++)
        {
            users.Add(new User
            {
                Id = Guid.NewGuid(),
                Email = customerEmails[i],
                FullName = customerNames[i],
                Phone = $"+100000{i + 20:D4}",
                Role = UserRole.Customer,
                IsActive = true,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer@123")
            });
        }

        return users;
    }

    private static List<DealerProfile> GetSeedDealerProfiles(List<User> dealers, List<Category> categories)
    {
        var shopDescriptions = new[]
        {
            "Leading electronics retailer with the latest gadgets",
            "Trendy fashion for men and women",
            "Everything for your home and garden",
            "Bestselling books and educational materials",
            "Premium sports equipment for professionals",
            "Fun toys and games for the whole family",
            "Quality auto parts at competitive prices",
            "Your trusted health and wellness store",
            "Cutting-edge gadgets and accessories",
            "Modern style for the fashion-forward"
        };

        var profiles = new List<DealerProfile>();
        for (int i = 0; i < dealers.Count; i++)
        {
            profiles.Add(new DealerProfile
            {
                Id = Guid.NewGuid(),
                UserId = dealers[i].Id,
                ShopName = dealers[i].FullName.Replace(" ", "") + "'s Shop",
                ShopDescription = shopDescriptions[i % shopDescriptions.Length],
                ShopCategory = categories[i % categories.Count].Name,
                Address = $"{_random.Next(100, 999)} Commerce Ave, Business District",
                IsApproved = i < 8, // First 8 approved, last 2 pending
            });
        }
        return profiles;
    }

    private static List<Product> GetSeedProducts(List<DealerProfile> dealers, List<Category> categories)
    {
        var products = new List<Product>();
        var productNames = new[]
        {
            "Wireless Bluetooth Headphones", "Smart Watch Pro", "Laptop Stand Adjustable", "USB-C Hub Multiport",
            "Mechanical Keyboard RGB", "Gaming Mouse Wireless", "Portable Charger 20000mAh", "Webcam HD 1080p",
            "Monitor Light Bar", "Desk Organizer Set"
        };

        var descriptions = new[]
        {
            "High-quality product with premium build quality",
            "Best seller in its category with excellent reviews",
            "Affordable yet durable for everyday use",
            "Professional grade for serious users",
            "Perfect gift for friends and family"
        };

        var statuses = new[] { ApprovalStatus.Approved, ApprovalStatus.Approved, ApprovalStatus.Approved, ApprovalStatus.Pending, ApprovalStatus.Rejected };

        int productCounter = 0;
        foreach (var dealer in dealers)
        {
            for (int j = 0; j < 50; j++)
            {
                var category = categories[j % categories.Count];
                var status = statuses[j % statuses.Length];
                productCounter++;

                products.Add(new Product
                {
                    Id = Guid.NewGuid(),
                    DealerId = dealer.Id,
                    CategoryId = category.Id,
                    Name = $"{dealer.ShopName} - {productNames[j % productNames.Length]} #{productCounter}",
                    Description = descriptions[j % descriptions.Length],
                    Price = Math.Round((decimal)(_random.NextDouble() * 500 + 5), 2),
                    StockQuantity = _random.Next(0, 200),
                    Sku = $"SKU-{dealer.Id.ToString()[..4].ToUpper()}-{j + 1:D3}",
                    ApprovalStatus = status,
                    RejectionReason = status == ApprovalStatus.Rejected ? "Does not meet quality standards" : null,
                    PublishedAt = status == ApprovalStatus.Approved ? DateTime.UtcNow.AddDays(-_random.Next(1, 60)) : null
                });
            }
        }
        return products;
    }

    private static List<Order> GetSeedOrders(List<CustomerProfile> customers, List<Product> products, List<DealerProfile> dealers)
    {
        var orders = new List<Order>();
        var statuses = new[] { OrderStatus.Pending, OrderStatus.Confirmed, OrderStatus.Processing, OrderStatus.Shipped, OrderStatus.Delivered, OrderStatus.Cancelled };

        foreach (var customer in customers)
        {
            // Each customer places 3-7 orders
            var orderCount = _random.Next(3, 8);
            for (int o = 0; o < orderCount; o++)
            {
                var orderProducts = products.OrderBy(_ => _random.Next()).Take(_random.Next(1, 5)).ToList();
                var totalAmount = orderProducts.Sum(p => p.Price);
                var status = statuses[_random.Next(statuses.Length)];

                var order = new Order
                {
                    Id = Guid.NewGuid(),
                    CustomerId = customer.Id,
                    Status = status,
                    TotalAmount = Math.Round(totalAmount, 2),
                    ShippingAddress = $"{_random.Next(1, 999)} Demo Street, Demo City, Country"
                };
                orders.Add(order);
            }
        }
        return orders;
    }
}
