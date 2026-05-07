using AutoMapper;
using SAMMI.ECOM.Domain.AggregateModels;
using SAMMI.ECOM.Domain.AggregateModels.AddressCategory;
using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Domain.AggregateModels.System;
using SAMMI.ECOM.Domain.Commands;
using SAMMI.ECOM.Domain.Commands.OrderBuy;
using SAMMI.ECOM.Domain.Commands.Products;
using SAMMI.ECOM.Domain.Commands.System;
using SAMMI.ECOM.Domain.DomainModels.Auth;
using SAMMI.ECOM.Domain.DomainModels.CategoryAddress;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.Products;
using SAMMI.ECOM.Domain.DomainModels.System;

namespace SAMMI.ECOM.API.Infrastructure.AutoMapperConfigs
{
    public class CategoryMappingProfile : Profile
    {
        public CategoryMappingProfile()
        {
            CreateMap<CUProvinceCommand, Province>();
            CreateMap<Province, ProvinceDTO>();

            CreateMap<CUDistrictCommand, District>();
            CreateMap<District, DistrictDTO>();

            CreateMap<CUWardCommand, Ward>();
            CreateMap<Ward, WardDTO>();

            CreateMap<RefreshToken, RefreshTokenDTO>();


            //product
            CreateMap<CreateProductCommand, Product>();
            CreateMap<UpdateProductCommand, Product>();
            CreateMap<Product, ProductDTO>();

            // image
            CreateMap<CreateImageCommand, Image>();
            CreateMap<Image, ImageDTO>();

            // banner
            CreateMap<CUBannerCommand, Banner>();
            CreateMap<Banner, BannerDTO>();

            // paymentmethod
            CreateMap<CUPaymentMethodCommand, PaymentMethod>();
            CreateMap<PaymentMethod, PaymentMethodDTO>();

            CreateMap<CUBrandCommand, Brand>();
            CreateMap<Brand, BrandDTO>();

            CreateMap<CUProductCategoryCommand, ProductCategory>();
            CreateMap<ProductCategory, ProductCategoryDTO>();

            CreateMap<CUCustomerAddressCommand, CustomerAddress>();
            CreateMap<CustomerAddress, CustomerAddressDTO>();


            CreateMap<MyVoucher, MyVoucherDTO>();

            CreateMap<FavouriteProduct, FavouriteProductDTO>();

            CreateMap<CURoleCommand, Role>();
            CreateMap<Role, RoleDTO>();

            CreateMap<CURolePermissionCommand, RolePermission>();
            CreateMap<RolePermission, RolePermissionDTO>();

            CreateMap<Permission, PermissionDTO>();

            CreateMap<NotificationCommand, Notification>();
            CreateMap<Notification, NotificationDTO>();
            //CreateMap<>();
        }
    }
}
