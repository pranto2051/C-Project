using AutoMapper;
using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.DTOs.Auth;
using ECommerce.Application.DTOs.Dealer;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Application.DTOs.Product;
using ECommerce.Application.DTOs.Order;
using ECommerce.Application.DTOs.Category;
namespace ECommerce.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>()
            .ForMember(d => d.Role, opt => opt.MapFrom(s => s.Role.ToString()));

        CreateMap<DealerProfile, DealerProfileResponse>()
            .ForMember(d => d.UserFullName, opt => opt.MapFrom(s => s.User != null ? s.User.FullName : null))
            .ForMember(d => d.UserEmail, opt => opt.MapFrom(s => s.User != null ? s.User.Email : null))
            .ForMember(d => d.UserPhone, opt => opt.MapFrom(s => s.User != null ? s.User.Phone : null))
            .ForMember(d => d.UserIsActive, opt => opt.MapFrom(s => s.User != null && s.User.IsActive));

        CreateMap<Product, ProductResponse>()
            .ForMember(d => d.ApprovalStatus, opt => opt.MapFrom(s => s.ApprovalStatus.ToString()));

        CreateMap<Order, OrderResponse>()
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.CustomerName, opt => opt.MapFrom(s => s.Customer.User.FullName));

        CreateMap<Category, CategoryResponse>()
            .ForMember(d => d.ParentCategoryName, opt => opt.MapFrom(s => s.ParentCategory != null ? s.ParentCategory.Name : null));
    }
}
