using AutoMapper;
using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.DTOs.Auth;
using ECommerce.Application.DTOs.Dealer;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

public class AdminService : IAdminService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IPasswordHasher _passwordHasher;

    public AdminService(IUnitOfWork unitOfWork, IMapper mapper, IPasswordHasher passwordHasher)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _passwordHasher = passwordHasher;
    }

    public async Task<List<UserDto>> GetAllUsersAsync(string? role, bool? isActive, string? search, int page, int pageSize)
    {
        var query = _unitOfWork.Users.GetQueryable();

        if (!string.IsNullOrWhiteSpace(role) && Enum.TryParse<UserRole>(role, true, out var userRole))
            query = query.Where(u => u.Role == userRole);

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u => u.Email.Contains(search!) || u.FullName.Contains(search!));

        query = query.OrderBy(u => u.FullName);

        var users = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return users.Select(_mapper.Map<UserDto>).ToList();
    }

    public async Task<UserDto> UpdateUserStatusAsync(Guid userId, UserStatusUpdate request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<UserDto>(user);
    }

    public async Task<List<DealerProfileResponse>> GetAllDealersAsync(string? search, string? category, int page, int pageSize)
    {
        var query = _unitOfWork.DealerProfiles.GetQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(d => d.ShopName.Contains(search));

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(d => d.ShopCategory == category);

        query = query.OrderBy(d => d.ShopName);

        var dealers = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return dealers.Select(_mapper.Map<DealerProfileResponse>).ToList();
    }

    public async Task<DealerProfileResponse?> GetDealerByIdAsync(Guid dealerId)
    {
        var dealer = await _unitOfWork.DealerProfiles.GetByIdAsync(dealerId);
        return dealer == null ? null : _mapper.Map<DealerProfileResponse>(dealer);
    }

    public async Task<DealerProfileResponse> CreateDealerAsync(AdminDealerRequest request)
    {
        // Create user account
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FullName = request.FullName,
            Phone = request.Phone,
            Role = UserRole.Dealer,
            IsActive = true,
            PasswordHash = _passwordHasher.Hash(request.Password)
        };
        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        // Create dealer profile
        var dealer = new DealerProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            ShopName = request.ShopName,
            ShopDescription = request.ShopDescription,
            ShopCategory = request.ShopCategory,
            Address = request.Address,
            LogoUrl = request.LogoUrl,
            IsApproved = request.IsApproved
        };
        await _unitOfWork.DealerProfiles.AddAsync(dealer);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<DealerProfileResponse>(dealer);
    }

    public async Task<DealerProfileResponse?> UpdateDealerAsync(Guid dealerId, AdminDealerRequest request)
    {
        var dealer = await _unitOfWork.DealerProfiles.GetByIdAsync(dealerId);
        if (dealer == null) return null;

        dealer.ShopName = request.ShopName;
        dealer.ShopDescription = request.ShopDescription;
        dealer.ShopCategory = request.ShopCategory;
        dealer.Address = request.Address;
        dealer.LogoUrl = request.LogoUrl;
        dealer.IsApproved = request.IsApproved;
        dealer.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.DealerProfiles.UpdateAsync(dealer);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<DealerProfileResponse>(dealer);
    }

    public async Task<bool> DeleteDealerAsync(Guid dealerId)
    {
        var dealer = await _unitOfWork.DealerProfiles.GetByIdAsync(dealerId);
        if (dealer == null) return false;

        // Delete user account (cascades to dealer profile)
        var user = await _unitOfWork.Users.GetByIdAsync(dealer.UserId);
        if (user != null)
        {
            await _unitOfWork.Users.DeleteAsync(user);
            await _unitOfWork.SaveChangesAsync();
        }
        return true;
    }

    public async Task<bool> ApproveDealerAsync(Guid dealerId)
    {
        var dealer = await _unitOfWork.DealerProfiles.GetByIdAsync(dealerId);
        if (dealer == null) return false;

        dealer.IsApproved = true;
        dealer.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.DealerProfiles.UpdateAsync(dealer);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<StatsResponse> GetStatsAsync()
    {
        var users = await _unitOfWork.Users.GetQueryable().ToListAsync();
        var products = await _unitOfWork.Products.GetQueryable().ToListAsync();
        var orders = await _unitOfWork.Orders.GetQueryable().ToListAsync();

        var totalRevenue = orders.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => o.TotalAmount);

        return new StatsResponse
        {
            TotalUsers = users.Count,
            TotalDealers = users.Count(u => u.Role == UserRole.Dealer),
            TotalCustomers = users.Count(u => u.Role == UserRole.Customer),
            TotalProducts = products.Count,
            PendingProducts = products.Count(p => p.ApprovalStatus == ApprovalStatus.Pending),
            ApprovedProducts = products.Count(p => p.ApprovalStatus == ApprovalStatus.Approved),
            RejectedProducts = products.Count(p => p.ApprovalStatus == ApprovalStatus.Rejected),
            TotalOrders = orders.Count,
            TotalRevenue = totalRevenue
        };
    }
}
