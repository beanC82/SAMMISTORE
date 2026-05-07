using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Domain.AggregateModels.AddressCategory;
using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Domain.AggregateModels.System;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Services.GHN_API;
using System.Data;
using System.Text.Json.Serialization;

namespace SAMMI.ECOM.Infrastructure
{
    public class WardSeed
    {
        [JsonPropertyName("Id")]
        public string Id { get; set; }
        [JsonPropertyName("Name")]
        public string Name { get; set; }
        [JsonPropertyName("Level")]
        public string Level { get; set; }
    }

    public class DistrictSeed
    {
        [JsonPropertyName("Id")]
        public string Id { get; set; }
        [JsonPropertyName("Name")]
        public string Name { get; set; }
        public List<WardSeed> Wards { get; set; }
    }

    public class ProvinceSeed
    {
        [JsonPropertyName("Id")]
        public string Id { get; set; }
        [JsonPropertyName("Name")]
        public string Name { get; set; }
        public List<DistrictSeed> Districts { get; set; }
    }
    public class DataSeeder
    {
        private readonly SammiEcommerceContext _context;
        private readonly string[] MANAGER_PERMISSION_CODE = new[]
        {
            // Quản lý tài khoản
            "ACCOUNT_VIEW",
            "ACCOUNT_UPDATE",
            "ACCOUNT_CHANGE_PASSWORD",
            "ACCOUNT_LOGOUT",
            // Quản lý khách hàng
            "CUSTOMER_CREATE",
            "CUSTOMER_UPDATE",
            "CUSTOMER_DELETE",
            "CUSTOMER_VIEW",
            // Quản lý sản phẩm
            "PRODUCT_CREATE",
            "PRODUCT_UPDATE",
            "PRODUCT_DELETE",
            "PRODUCT_VIEW",
            // danh mục loại sản phẩm
            "PRODUCT_CATEGORY_CREATE",
            "PRODUCT_CATEGORY_UPDATE",
            "PRODUCT_CATEGORY_DELETE",
            "PRODUCT_CATEGORY_VIEW",
            // danh mục thương hiệu
            "BRAND_CREATE",
            "BRAND_UPDATE",
            "BRAND_DELETE",
            "BRAND_VIEW",
            // Quản lý nhập hàng
            "IMPORT_CREATE",
            "IMPORT_UPDATE_STATUS",
            "IMPORT_DELETE",
            "IMPORT_VIEW",
            // Quản lý đơn hàng
            "ORDER_VIEW",
            "ORDER_DETAIL",
            "ORDER_UPDATE_STATUS",
            // thông báo
            "NOTIFICATION_VIEW",
            "NOTIFICATION_UPDATE",
            // chat
            "CHAT_MANAGER"
        };
        private readonly string[] CUSTOMER_PERMISSION_CODE = new[]
        {
            // Tài khoản & bảo mật
            "CUSTOMER_ACCOUNT_VIEW",
            "CUSTOMER_ACCOUNT_UPDATE",
            "CUSTOMER_ACCOUNT_CHANGE_PASSWORD",
            "CUSTOMER_ACCOUNT_LOGOUT",

            // Sản phẩm
            "CUSTOMER_PRODUCT_VIEW",
            "CUSTOMER_PRODUCT_SEARCH",
            "CUSTOMER_PRODUCT_ADVANCED_SEARCH",

            // Giỏ hàng & Đơn hàng
            "CUSTOMER_CART_MANAGE",
            "CUSTOMER_ORDER_PLACE",
            "CUSTOMER_ORDER_PAYMENT",

            // Theo dõi đơn hàng
            "CUSTOMER_ORDER_TRACK",
            "CUSTOMER_ORDER_CANCEL",

            // Thông báo & Thông tin nhận hàng
            "CUSTOMER_NOTIFICATION_MANAGE",
            "CUSTOMER_SHIPPING_INFO_MANAGE",

            // Đánh giá & Sản phẩm yêu thích
            "CUSTOMER_PRODUCT_REVIEW",
            "CUSTOMER_FAVORITE_PRODUCTS_MANAGE",

            // Voucher
            "CUSTOMER_VOUCHER_MANAGE"
        };
        private readonly IGHNService _ghnService;
        public DataSeeder(SammiEcommerceContext context,
            IGHNService ghnService)
        {
            _context = context;
            _ghnService = ghnService;
        }
        /*
        private async Task SeedAddress()
        {
            var listProvince = new List<SAMMI.ECOM.Domain.AggregateModels.AddressCategory.Province>();
            var listDistrict = new List<SAMMI.ECOM.Domain.AggregateModels.AddressCategory.District>();
            var listWard = new List<SAMMI.ECOM.Domain.AggregateModels.AddressCategory.Ward>();


            try
            {
                if (!_context.Provinces.Any() && !_context.Districts.Any() && !_context.Wards.Any())
                {
                    string json = File.ReadAllText(Path.Combine("Resources", "vietnamAddress.json"));
                    var provinces = JsonConvert.DeserializeObject<List<ProvinceSeed>>(json);

                    foreach (var province in provinces)
                    {
                        var pro = new SAMMI.ECOM.Domain.AggregateModels.AddressCategory.Province
                        {
                            Code = string.IsNullOrEmpty(province.Id) ? "" : province.Id,
                            Name = province.Name ?? "Unknown",
                        };
                        await _context.Provinces.AddAsync(pro);
                        await _context.SaveChangesAsync();
                        foreach (var district in province.Districts)
                        {
                            var districtEntity = new SAMMI.ECOM.Domain.AggregateModels.AddressCategory.District()
                            {
                                Code = string.IsNullOrEmpty(district.Id) ? "" : district.Id,
                                Name = district.Name ?? "Unknown",
                                ProvinceId = pro?.Id ?? 0
                            };
                            await _context.Districts.AddAsync(districtEntity);
                            await _context.SaveChangesAsync();
                            foreach (var ward in district.Wards)
                            {
                                var wardEntity = new SAMMI.ECOM.Domain.AggregateModels.AddressCategory.Ward
                                {
                                    Code = string.IsNullOrEmpty(ward.Id) ? "" : ward.Id,
                                    Name = ward.Name ?? "Unknown",
                                    DistrictId = districtEntity?.Id ?? 0
                                };
                                await _context.Wards.AddAsync(wardEntity);
                            }
                            await _context.SaveChangesAsync();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }
        */

        private async Task SeedAddress()
        {
            try
            {
                if (!_context.Provinces.Any() && !_context.Districts.Any() && !_context.Wards.Any())
                {
                    var provincesFromGHN = await _ghnService.GetProvinces();
                    if (provincesFromGHN == null || !provincesFromGHN.Any())
                    {
                        Console.WriteLine("No province data retrieved from GHN API.");
                        return;
                    }

                    // Chuẩn bị danh sách để lưu vào DB
                    var provincesToAdd = new List<Province>();
                    var districtsToAdd = new List<District>();
                    var wardsToAdd = new List<Ward>();

                    // Xử lý tỉnh/thành
                    foreach (var provinceFromGHN in provincesFromGHN)
                    {
                        var provinceEntity = new Province
                        {
                            Id = provinceFromGHN.ProvinceID, // Sử dụng ProvinceID từ GHN
                            Code = provinceFromGHN.Code.ToString(),
                            Name = provinceFromGHN.ProvinceName ?? "System"
                        };
                        provincesToAdd.Add(provinceEntity);

                        // Lấy danh sách quận/huyện
                        var districtsFromGHN = await _ghnService.GetDistricts(provinceFromGHN.ProvinceID);
                        if (districtsFromGHN != null)
                        {
                            foreach (var districtFromGHN in districtsFromGHN)
                            {
                                var districtEntity = new District
                                {
                                    Id = districtFromGHN.DistrictID, // Sử dụng DistrictID từ GHN
                                    Code = districtFromGHN.Code != null ? districtFromGHN.Code.ToString() : null,
                                    Name = districtFromGHN.DistrictName ?? "System",
                                    ProvinceId = provinceEntity.Id,
                                };
                                districtsToAdd.Add(districtEntity);

                                // Lấy danh sách phường/xã
                                var wardsFromGHN = await _ghnService.GetWards(districtFromGHN.DistrictID);
                                if (wardsFromGHN != null)
                                {
                                    foreach (var wardFromGHN in wardsFromGHN)
                                    {
                                        var wardEntity = new Ward
                                        {
                                            Code = wardFromGHN.WardCode, // Sử dụng WardCode từ GHN
                                            Name = wardFromGHN.WardName ?? "System",
                                            DistrictId = districtEntity.Id,
                                        };
                                        wardsToAdd.Add(wardEntity);
                                    }
                                }
                            }
                        }
                    }

                    // Lưu tất cả dữ liệu vào DB cùng lúc
                    await _context.Provinces.AddRangeAsync(provincesToAdd);
                    await _context.Districts.AddRangeAsync(districtsToAdd);
                    await _context.Wards.AddRangeAsync(wardsToAdd);

                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }


        private async Task SeedPermission()
        {
            if (!await _context.Permissions.AnyAsync())
            {
                /*
                List<Permission> permissions = new List<Permission>()
                {
                    // Khách hàng
                    new Permission() { Code = "CUSTOMER_CREATE", Name = "Thêm mới khách hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "CUSTOMER_UPDATE", Name = "Cập nhật thông tin khách hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "CUSTOMER_DELETE", Name = "Xóa khách hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "CUSTOMER_VIEW", Name = "Xem danh sách khách hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Nhân viên
                    new Permission() { Code = "EMPLOYEE_CREATE", Name = "Thêm mới nhân viên", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "EMPLOYEE_UPDATE", Name = "Cập nhật thông tin nhân viên", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "EMPLOYEE_DELETE", Name = "Xóa nhân viên", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "EMPLOYEE_VIEW", Name = "Xem danh sách nhân viên", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Nhà cung cấp
                    new Permission() { Code = "SUPPLIER_CREATE", Name = "Thêm mới nhà cung cấp", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "SUPPLIER_UPDATE", Name = "Cập nhật thông tin nhà cung cấp", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "SUPPLIER_DELETE", Name = "Xóa nhà cung cấp", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "SUPPLIER_VIEW", Name = "Xem danh sách nhà cung cấp", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Quản lý tỉnh/thành phố
                    new Permission() { Code = "PROVINCE_CREATE", Name = "Thêm mới tỉnh/thành phố", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "PROVINCE_UPDATE", Name = "Cập nhật thông tin tỉnh/thành phố", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "PROVINCE_DELETE", Name = "Xóa tỉnh/thành phố", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "PROVINCE_VIEW", Name = "Xem danh sách tỉnh/thành phố", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Quản lý quận/huyện
                    new Permission() { Code = "DISTRICT_CREATE", Name = "Thêm mới quận/huyện", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "DISTRICT_UPDATE", Name = "Cập nhật thông tin quận/huyện", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "DISTRICT_DELETE", Name = "Xóa quận/huyện", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "DISTRICT_VIEW", Name = "Xem danh sách quận/huyện", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Quản lý phường/xã
                    new Permission() { Code = "WARD_CREATE", Name = "Thêm mới phường/xã", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "WARD_UPDATE", Name = "Cập nhật thông tin phường/xã", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "WARD_DELETE", Name = "Xóa phường/xã", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "WARD_VIEW", Name = "Xem danh sách phường/xã", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // danh mục phương thức thanh toán
                    new Permission() { Code = "PAYMENT_METHOD_CREATE", Name = "Thêm mới phương thức thanh toán", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "PAYMENT_METHOD_UPDATE", Name = "Cập nhật thông tin phương thức thanh toán", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "PAYMENT_METHOD_DELETE", Name = "Xóa phương thức thanh toán", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "PAYMENT_METHOD_VIEW", Name = "Xem danh sách phương thức thanh toán", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // danh mục banner
                    new Permission() { Code = "BANNER_CREATE", Name = "Thêm mới banner", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "BANNER_UPDATE", Name = "Cập nhật thông tin banner", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "BANNER_DELETE", Name = "Xóa banner", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "BANNER_VIEW", Name = "Xem danh sách banner", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Vai trò & quyền
                    new Permission() { Code = "ROLE_CREATE", Name = "Thêm mới vai trò", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "ROLE_UPDATE", Name = "Cập nhật thông tin vai trò", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "ROLE_DELETE", Name = "Xóa vai trò", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "ROLE_VIEW", Name = "Xem danh sách vai trò", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "ROLE_ASSIGN_PERMISSION", Name = "Gán quyền cho vai trò", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Phiếu nhập hàng
                    new Permission() { Code = "IMPORT_CREATE", Name = "Tạo phiếu nhập hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "IMPORT_UPDATE_STATUS", Name = "Cập nhật trạng thái phiếu nhập hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "IMPORT_DELETE", Name = "Xóa phiếu nhập hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "IMPORT_VIEW", Name = "Xem danh sách phiếu nhập hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Đơn hàng
                    new Permission() { Code = "ORDER_VIEW", Name = "Xem danh sách đơn hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "ORDER_DETAIL", Name = "Xem chi tiết đơn hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "ORDER_UPDATE_STATUS", Name = "Cập nhật trạng thái đơn hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Quản lý danh mục loại sản phẩm
                    new Permission() { Code = "PRODUCT_CATEGORY_CREATE", Name = "Thêm mới danh mục loại sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "PRODUCT_CATEGORY_UPDATE", Name = "Cập nhật thông tin danh mục loại sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "PRODUCT_CATEGORY_DELETE", Name = "Xóa danh mục loại sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "PRODUCT_CATEGORY_VIEW", Name = "Xem danh sách danh mục loại sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Quản lý thương hiệu
                    new Permission() { Code = "BRAND_CREATE", Name = "Thêm mới thương hiệu", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "BRAND_UPDATE", Name = "Cập nhật thông tin thương hiệu", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "BRAND_DELETE", Name = "Xóa thương hiệu", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "BRAND_VIEW", Name = "Xem danh sách thương hiệu", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    
                    // Sản phẩm
                    new Permission() { Code = "PRODUCT_CREATE", Name = "Thêm mới sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "PRODUCT_UPDATE", Name = "Cập nhật thông tin sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "PRODUCT_DELETE", Name = "Xóa sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "PRODUCT_VIEW", Name = "Xem danh sách sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "PRODUCT_SEARCH", Name = "Tìm kiếm sản phẩm sử dụng Elasticsearch", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Quản lý thông báo hệ thống
                    new Permission() { Code = "NOTIFICATION_VIEW", Name = "Xem thông báo từ hệ thống", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "NOTIFICATION_UPDATE", Name = "Cập nhật trạng thái thông báo", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    
                    // Quản lý chat trực tuyến
                    new Permission() { Code = "CHAT_MANAGER", Name = "Quản lý cuộc trò chuyện trực tuyến", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Thống kê
                    new Permission() { Code = "REPORT_REVENUE", Name = "Thống kê doanh thu đơn hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "REPORT_STOCK", Name = "Thống kê số lượng tồn kho", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "REPORT_IMPORT", Name = "Thống kê nhập hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Tài khoản & bảo mật(người dùng)
                    new Permission() { Code = "ACCOUNT_VIEW", Name = "Xem thông tin tài khoản", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "ACCOUNT_UPDATE", Name = "Cập nhật thông tin tài khoản", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "ACCOUNT_CHANGE_PASSWORD", Name = "Đổi mật khẩu", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "ACCOUNT_LOGOUT", Name = "Đăng xuất", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                
                    
                    // role khách hàng
                    
                    // Sản phẩm
                    new Permission() { Code = "CUSTOMER_PRODUCT_VIEW", Name = "Khách hàng xem thông tin sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "CUSTOMER_PRODUCT_SEARCH", Name = "Khách hàng tìm kiếm sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "CUSTOMER_PRODUCT_ADVANCED_SEARCH", Name = "Khách hàng tìm kiếm sản phẩm nâng cao", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Giỏ hàng & Đơn hàng
                    new Permission() { Code = "CUSTOMER_CART_MANAGE", Name = "Khách hàng quản lý giỏ hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "CUSTOMER_ORDER_PLACE", Name = "Khách hàng đặt hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "CUSTOMER_ORDER_PAYMENT", Name = "Khách hàng thanh toán đơn hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Theo dõi đơn hàng
                    new Permission() { Code = "CUSTOMER_ORDER_TRACK", Name = "Khách hàng theo dõi đơn hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "CUSTOMER_ORDER_CANCEL", Name = "Khách hàng hủy đơn hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Thông báo & Thông tin nhận hàng
                    new Permission() { Code = "CUSTOMER_NOTIFICATION_MANAGE", Name = "Khách hàng quản lý thông báo", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "CUSTOMER_SHIPPING_INFO_MANAGE", Name = "Khách hàng quản lý thông tin nhận hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Đánh giá & Sản phẩm yêu thích
                    new Permission() { Code = "CUSTOMER_PRODUCT_REVIEW", Name = "Khách hàng đánh giá sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission() { Code = "CUSTOMER_FAVORITE_PRODUCTS_MANAGE", Name = "Khách hàng quản lý sản phẩm yêu thích", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Voucher
                    new Permission() { Code = "CUSTOMER_VOUCHER_MANAGE", Name = "Khách hàng quản lý voucher", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" }
                };
                */

                List<Permission> permissions = new List<Permission>()
                {
                    // Khách hàng
                    new Permission { Code = PermissionEnum.CustomerCreate.ToPolicyName(), Name = "Thêm mới khách hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.CustomerUpdate.ToPolicyName(), Name = "Cập nhật thông tin khách hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.CustomerDelete.ToPolicyName(), Name = "Xóa khách hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.CustomerView.ToPolicyName(), Name = "Xem danh sách khách hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },

                    // Nhân viên
                    new Permission { Code = PermissionEnum.EmployeeCreate.ToPolicyName(), Name = "Thêm mới nhân viên", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.EmployeeUpdate.ToPolicyName(), Name = "Cập nhật thông tin nhân viên", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.EmployeeDelete.ToPolicyName(), Name = "Xóa nhân viên", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.EmployeeView.ToPolicyName(), Name = "Xem danh sách nhân viên", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },

                    // Nhà cung cấp
                     new Permission { Code = PermissionEnum.SupplierCreate.ToPolicyName(), Name = "Thêm mới nhà cung cấp", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.SupplierUpdate.ToPolicyName(), Name = "Cập nhật thông tin nhà cung cấp", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.SupplierDelete.ToPolicyName(), Name = "Xóa nhà cung cấp", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.SupplierView.ToPolicyName(), Name = "Xem danh sách nhà cung cấp", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },

                             // Quản lý tỉnh/thành phố
                    //new Permission { Code = PermissionEnum.ProvinceCreate.ToPolicyName(), Name = "Thêm mới tỉnh/thành phố", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.ProvinceUpdate.ToPolicyName(), Name = "Cập nhật thông tin tỉnh/thành phố", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    //new Permission { Code = PermissionEnum.ProvinceDelete.ToPolicyName(), Name = "Xóa tỉnh/thành phố", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.ProvinceView.ToPolicyName(), Name = "Xem danh sách tỉnh/thành phố", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Quản lý quận/huyện
                    //new Permission { Code = PermissionEnum.DistrictCreate.ToPolicyName(), Name = "Thêm mới quận/huyện", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    //new Permission { Code = PermissionEnum.DistrictUpdate.ToPolicyName(), Name = "Cập nhật thông tin quận/huyện", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    //new Permission { Code = PermissionEnum.DistrictDelete.ToPolicyName(), Name = "Xóa quận/huyện", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.DistrictView.ToPolicyName(), Name = "Xem danh sách quận/huyện", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Quản lý phường/xã
                    //new Permission { Code = PermissionEnum.WardCreate.ToPolicyName(), Name = "Thêm mới phường/xã", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    //new Permission { Code = PermissionEnum.WardUpdate.ToPolicyName(), Name = "Cập nhật thông tin phường/xã", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    //new Permission { Code = PermissionEnum.WardDelete.ToPolicyName(), Name = "Xóa phường/xã", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.WardView.ToPolicyName(), Name = "Xem danh sách phường/xã", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Danh mục phương thức thanh toán
                    new Permission { Code = PermissionEnum.PaymentMethodCreate.ToPolicyName(), Name = "Thêm mới phương thức thanh toán", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    //new Permission { Code = PermissionEnum.PaymentMethodUpdate.ToPolicyName(), Name = "Cập nhật thông tin phương thức thanh toán", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    //new Permission { Code = PermissionEnum.PaymentMethodDelete.ToPolicyName(), Name = "Xóa phương thức thanh toán", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.PaymentMethodView.ToPolicyName(), Name = "Xem danh sách phương thức thanh toán", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System"},

                    // Danh mục banner
                    new Permission { Code = PermissionEnum.BannerCreate.ToPolicyName(), Name = "Thêm mới banner", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.BannerUpdate.ToPolicyName(), Name = "Cập nhật thông tin banner", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.BannerDelete.ToPolicyName(), Name = "Xóa banner", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.BannerView.ToPolicyName(), Name = "Xem danh sách banner", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },

                    // Vai trò & quyền
                    new Permission { Code = PermissionEnum.RoleCreate.ToPolicyName(), Name = "Thêm mới vai trò", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.RoleUpdate.ToPolicyName(), Name = "Cập nhật thông tin vai trò", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.RoleDelete.ToPolicyName(), Name = "Xóa vai trò", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.RoleView.ToPolicyName(), Name = "Xem danh sách vai trò", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.RoleAssignPermission.ToPolicyName(), Name = "Gán quyền cho vai trò", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },

                    // Phiếu nhập hàng
                    new Permission { Code = PermissionEnum.ImportCreate.ToPolicyName(), Name = "Tạo phiếu nhập hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.ImportUpdate.ToPolicyName(), Name = "Cập nhật thông tin phiếu nhập hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.ImportUpdateStatus.ToPolicyName(), Name = "Cập nhật trạng thái phiếu nhập hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.ImportDelete.ToPolicyName(), Name = "Xóa phiếu nhập hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.ImportView.ToPolicyName(), Name = "Xem danh sách phiếu nhập hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },

                    // Đơn hàng
                    new Permission { Code = PermissionEnum.OrderView.ToPolicyName(), Name = "Xem danh sách đơn hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    //new Permission { Code = PermissionEnum.OrderDetail.ToPolicyName(), Name = "Xem chi tiết đơn hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.OrderUpdateStatus.ToPolicyName(), Name = "Cập nhật trạng thái đơn hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },

                    // Quản lý danh mục loại sản phẩm
                    new Permission { Code = PermissionEnum.ProductCategoryCreate.ToPolicyName(), Name = "Thêm mới danh mục loại sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.ProductCategoryUpdate.ToPolicyName(), Name = "Cập nhật thông tin danh mục loại sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.ProductCategoryDelete.ToPolicyName(), Name = "Xóa danh mục loại sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.ProductCategoryView.ToPolicyName(), Name = "Xem danh sách danh mục loại sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },

                    // Quản lý thương hiệu
                    new Permission { Code = PermissionEnum.BrandCreate.ToPolicyName(), Name = "Thêm mới thương hiệu", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.BrandUpdate.ToPolicyName(), Name = "Cập nhật thông tin thương hiệu", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.BrandDelete.ToPolicyName(), Name = "Xóa thương hiệu", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.BrandView.ToPolicyName(), Name = "Xem danh sách thương hiệu", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },

                    // Sản phẩm
                    new Permission { Code = PermissionEnum.ProductCreate.ToPolicyName(), Name = "Thêm mới sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.ProductUpdate.ToPolicyName(), Name = "Cập nhật thông tin sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.ProductDelete.ToPolicyName(), Name = "Xóa sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.ProductView.ToPolicyName(), Name = "Xem danh sách sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.ProductSearch.ToPolicyName(), Name = "Tìm kiếm sản phẩm sử dụng Elasticsearch", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },

                    // Quản lý thông báo hệ thống
                    new Permission { Code = PermissionEnum.NotificationView.ToPolicyName(), Name = "Xem thông báo từ hệ thống", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.NotificationUpdate.ToPolicyName(), Name = "Cập nhật trạng thái thông báo", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },

                    // Quản lý chat trực tuyến
                    new Permission { Code = PermissionEnum.ChatManager.ToPolicyName(), Name = "Quản lý cuộc trò chuyện trực tuyến", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },

                    // Thống kê
                    new Permission { Code = PermissionEnum.ReportRevenue.ToPolicyName(), Name = "Thống kê doanh thu đơn hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.ReportStock.ToPolicyName(), Name = "Thống kê số lượng tồn kho", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.ReportImport.ToPolicyName(), Name = "Thống kê nhập hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },

                    // Tài khoản & bảo mật (người dùng)
                    new Permission { Code = PermissionEnum.AccountView.ToPolicyName(), Name = "Xem thông tin tài khoản", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System"},
                    new Permission { Code = PermissionEnum.AccountUpdate.ToPolicyName(), Name = "Cập nhật thông tin tài khoản", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System"},
                    new Permission { Code = PermissionEnum.AccountChangePassword.ToPolicyName(), Name = "Đổi mật khẩu", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission { Code = PermissionEnum.AccountLogout.ToPolicyName(), Name = "Đăng xuất", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Danh mục sự kiện
                    new Permission { Code = PermissionEnum.EventCreate.ToPolicyName(), Name = "Thêm mới sự kiện", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.EventUpdate.ToPolicyName(), Name = "Cập nhật thông tin sự kiện", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.EventDelete.ToPolicyName(), Name = "Xóa sự kiện", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.EventView.ToPolicyName(), Name = "Xem danh sách sự kiện", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },

                    // Danh mục voucher
                    new Permission { Code = PermissionEnum.VoucherCreate.ToPolicyName(), Name = "Thêm mới voucher", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.VoucherUpdate.ToPolicyName(), Name = "Cập nhật thông tin voucher", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.VoucherDelete.ToPolicyName(), Name = "Xóa voucher", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },
                    new Permission { Code = PermissionEnum.VoucherView.ToPolicyName(), Name = "Xem danh sách voucher", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System", IsShow = true },

                    // Role khách hàng
                    // Sản phẩm
                    new Permission { Code = PermissionEnum.CustomerProductView.ToPolicyName(), Name = "Khách hàng xem thông tin sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission { Code = PermissionEnum.CustomerProductSearch.ToPolicyName(), Name = "Khách hàng tìm kiếm sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission { Code = PermissionEnum.CustomerProductAdvancedSearch.ToPolicyName(), Name = "Khách hàng tìm kiếm sản phẩm nâng cao", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Giỏ hàng
                    new Permission { Code = PermissionEnum.CustomerCartView.ToPolicyName(), Name = "Khách hàng xem giỏ hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission { Code = PermissionEnum.CustomerCartAdd.ToPolicyName(), Name = "Khách hàng thêm sản phẩm vào giỏ hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission { Code = PermissionEnum.CustomerCartRemove.ToPolicyName(), Name = "Khách hàng xóa sản phẩm khỏi giỏ hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // đơn hàng
                    new Permission { Code = PermissionEnum.CustomerOrderPlace.ToPolicyName(), Name = "Khách hàng đặt hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission { Code = PermissionEnum.CustomerOrderPayment.ToPolicyName(), Name = "Khách hàng thanh toán đơn hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Theo dõi đơn hàng
                    new Permission { Code = PermissionEnum.CustomerOrderTrack.ToPolicyName(), Name = "Khách hàng theo dõi đơn hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission { Code = PermissionEnum.CustomerOrderCancel.ToPolicyName(), Name = "Khách hàng hủy đơn hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Thông báo & Thông tin nhận hàng
                    new Permission { Code = PermissionEnum.CustomerNotificationManage.ToPolicyName(), Name = "Khách hàng quản lý thông báo", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission { Code = PermissionEnum.CustomerShippingInfoManage.ToPolicyName(), Name = "Khách hàng quản lý thông tin nhận hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Đánh giá & Sản phẩm yêu thích
                    new Permission { Code = PermissionEnum.CustomerProductReview.ToPolicyName(), Name = "Khách hàng đánh giá sản phẩm", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },
                    new Permission { Code = PermissionEnum.CustomerFavoriteProductsManage.ToPolicyName(), Name = "Khách hàng quản lý sản phẩm yêu thích", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Voucher
                    new Permission { Code = PermissionEnum.CustomerVoucherManage.ToPolicyName(), Name = "Khách hàng quản lý voucher", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" },

                    // Địa chỉ giao hàng
                    new Permission { Code = PermissionEnum.CustomerDeliveryAddressManagement.ToPolicyName(), Name = "Khách hàng quản lý địa chỉ giao hàng", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System" }
                };
                try
                {
                    await _context.Permissions.AddRangeAsync(permissions);
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.ToString());
                }
            }
        }

        private async Task SeedRole()
        {
            if (!await _context.Roles.AnyAsync())
            {
                List<Role> roles = new List<Role>()
                {
                    new Role()
                    {
                        Code = "ADMIN",
                        Name = "Quản trị viên hệ thống",
                        IsLock = true,
                        IsActive = true,
                        IsDeleted = false,
                        CreatedDate = DateTime.Now,
                        CreatedBy = "N/A"
                    },
                    new Role()
                    {
                        Code = "MANAGER",
                        Name = "Quản lý",
                        IsActive = true,
                        IsDeleted = false,
                        CreatedDate = DateTime.Now,
                        CreatedBy = "N/A"
                    },
                    new Role()
                    {
                        Code = "EMPLOYEE",
                        Name = "Nhân viên",
                        IsActive = true,
                        IsDeleted = false,
                        CreatedDate = DateTime.Now,
                        CreatedBy = "N/A"
                    },
                    new Role()
                    {
                        Code = "CUSTOMER",
                        Name = "Khách hàng",
                        IsLock = true,
                        IsActive = true,
                        IsDeleted = false,
                        CreatedDate = DateTime.Now,
                        CreatedBy = "N/A"
                    }
                };

                try
                {
                    await _context.Roles.AddRangeAsync(roles);
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.ToString());
                }
            }
        }

        private async Task SeedRolePermission()
        {
            if (!await _context.RolePermissions.AnyAsync())
            {
                List<RolePermission> rolePermissions = new List<RolePermission>();
                List<Permission> permissions = await _context.Permissions.ToListAsync();
                var roles = await _context.Roles.ToListAsync();
                foreach (var r in roles)
                {
                    if (r.Code == RoleTypeEnum.ADMIN.ToString())
                    {
                        rolePermissions.AddRange(
                            permissions
                            .Where(p => PermissionCodes.PERMISSION_ADMIN_CODES.Select(x => x.ToPolicyName()).Contains(p.Code))
                            .Select(per => new RolePermission()
                            {
                                RoleId = r.Id,
                                PermissionId = per.Id,
                                Allow = true,
                                IsActive = true,
                                IsDeleted = false,
                                CreatedDate = DateTime.Now,
                                CreatedBy = "N/A"
                            })
                        );
                    }
                    else if (r.Code == RoleTypeEnum.MANAGER.ToString())
                    {
                        rolePermissions.AddRange(
                            permissions
                            .Where(per => PermissionCodes.PERMISSION_EMPLOYEE_CODES.Select(x => x.ToPolicyName()).Contains(per.Code))
                            .Select(per => new RolePermission()
                            {
                                RoleId = r.Id,
                                PermissionId = per.Id,
                                Allow = true,
                                IsActive = true,
                                IsDeleted = false,
                                CreatedDate = DateTime.Now,
                                CreatedBy = "N/A"
                            }));
                    }
                    else if(r.Code == RoleTypeEnum.EMPLOYEE.ToString())
                    {
                        rolePermissions.AddRange(
                            permissions
                            .Where(per => PermissionCodes.PERMISSION_EMPLOYEE_CODES.Select(x => x.ToPolicyName()).Contains(per.Code))
                            .Select(per => new RolePermission()
                            {
                                RoleId = r.Id,
                                PermissionId = per.Id,
                                Allow = true,
                                IsActive = true,
                                IsDeleted = false,
                                CreatedDate = DateTime.Now,
                                CreatedBy = "N/A"
                            }));
                    }
                    else if (r.Code == RoleTypeEnum.CUSTOMER.ToString())
                    {
                        rolePermissions.AddRange(
                            permissions
                            .Where(per => PermissionCodes.PERMISSION_CUSTOMER_CODES.Select(x => x.ToPolicyName()).Contains(per.Code))
                            .Select(per => new RolePermission()
                            {
                                RoleId = r.Id,
                                PermissionId = per.Id,
                                Allow = true,
                                IsActive = true,
                                IsDeleted = false,
                                CreatedDate = DateTime.Now,
                                CreatedBy = "N/A"
                            }));
                    }
                }

                try
                {
                    await _context.RolePermissions.AddRangeAsync(rolePermissions);
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.ToString());
                }
            }
        }

        private async Task SeedUsers()
        {
            if (!_context.Users.Any(x => x.Type == TypeUserEnum.Employee.ToString()))
            {
                var roles = await _context.Roles.ToListAsync();
                List<User> users = new List<User>()
                {
                    new User()
                    {
                        Code = "NV000001",
                        IsAdmin = true,
                        IdentityGuid = Guid.NewGuid().ToString(),
                        Type = TypeUserEnum.Employee.ToString(),
                        Phone = "012321232",
                        FirstName = "ad",
                        LastName = "min",
                        FullName = "admin",
                        WardId = 1,
                        Username = "admin",
                        Gender = 1,
                        Password = "AQAAAAEAACcQAAAAEL8NlQ45auZ/l+/y+AhBHLsmK7bUfDYcfMmEDpny1MOfSfZHVvy0lxvqPIQind8TCg==",
                        RoleId = roles.FirstOrDefault(x => x.Code == RoleTypeEnum.ADMIN.ToString()).Id,
                        IsActive = true,
                        IsDeleted = false,
                        IsLock = false,
                        CreatedDate = DateTime.Now,
                        CreatedBy = "N/A",
                        IsVerify = true
                    },
                    new User()
                    {
                        Code = "NV000002",
                        IsAdmin = false,
                        IdentityGuid = Guid.NewGuid().ToString(),
                        Type = TypeUserEnum.Employee.ToString(),
                        Phone = "012321443",
                        FirstName = "employee",
                        LastName = "employee",
                        FullName = "employee",
                        WardId = 1,
                        Username = "employee",
                        Gender = 1,
                        Password = "AQAAAAEAACcQAAAAEL8NlQ45auZ/l+/y+AhBHLsmK7bUfDYcfMmEDpny1MOfSfZHVvy0lxvqPIQind8TCg==",
                        RoleId = roles.FirstOrDefault(x => x.Code == RoleTypeEnum.EMPLOYEE.ToString()).Id,
                        IsActive = true,
                        IsDeleted = false,
                        IsLock = false,
                        CreatedDate = DateTime.Now,
                        CreatedBy = "N/A",
                        IsVerify = true
                    },
                    new User()
                    {
                        Code = "KH000001",
                        IsAdmin = false,
                        IdentityGuid = Guid.NewGuid().ToString(),
                        Type = TypeUserEnum.Customer.ToString(),
                        Phone = "0123216543",
                        FirstName = "Thu",
                        LastName = "Thảo",
                        FullName = "Thu Thảo",
                        WardId = 1,
                        Username = "thao",
                        Gender = 0,
                        Password = "AQAAAAEAACcQAAAAEL8NlQ45auZ/l+/y+AhBHLsmK7bUfDYcfMmEDpny1MOfSfZHVvy0lxvqPIQind8TCg==",
                        RoleId = roles.FirstOrDefault(x => x.Code == RoleTypeEnum.CUSTOMER.ToString()).Id,
                        IsActive = true,
                        IsDeleted = false,
                        IsLock = false,
                        CreatedDate = DateTime.Now,
                        CreatedBy = "N/A",
                        IsVerify = true
                    },
                };

                try
                {
                    await _context.Users.AddRangeAsync(users);
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.ToString());
                }
            }
        }

        private async Task SeedBrand()
        {
            if (!await _context.Brands.AnyAsync())
            {
                List<Brand> brands = new List<Brand>()
                {
                    new Brand() {Code = "TH000001",Name = "WHOO",IsActive = true,IsDeleted = false,CreatedDate = DateTime.Now,CreatedBy = "N/A"},
                    new Brand() {Code = "TH000002", Name = "SK-II", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "N/A"},
                    new Brand() {Code = "TH000003", Name = "Estee Lauder", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "N/A"},
                    new Brand() {Code = "TH000004", Name = "Lancome", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "N/A"},
                    new Brand() {Code = "TH000005", Name = "Shiseido", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "N/A"},
                    new Brand() {Code = "TH000006", Name = "Clinique", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "N/A"},
                    new Brand() {Code = "TH000007", Name = "Dior", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "N/A"},
                    new Brand() {Code = "TH000008", Name = "Chanel", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "N/A"},
                    new Brand() {Code = "TH000009", Name = "L'Oreal", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "N/A"},
                    new Brand() {Code = "TH000010", Name = "The Face Shop", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "N/A"}
                };


                try
                {
                    await _context.Brands.AddRangeAsync(brands);
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.ToString());
                }
            }
        }

        private async Task SeedProductCategory()
        {
            if (!await _context.ProductCategories.AnyAsync())
            {
                List<ProductCategory> categories = new List<ProductCategory>()
                {
                    new ProductCategory() {Code = "PC000001", Name = "Trang điểm", Level = 1, ParentId = null, IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "Unknown"},
                    new ProductCategory() {Code = "PC000002", Name = "Chăm sóc da", Level = 1, ParentId = null, IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "Unknown"},
                    new ProductCategory() {Code = "PC000003", Name = "Làm sạch da", Level = 2, ParentId = 2, IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "Unknown"},
                    new ProductCategory() {Code = "PC000004", Name = "Dưỡng ẩm", Level = 2, ParentId = 2, IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "Unknown"},
                    new ProductCategory() {Code = "PC000005", Name = "Son môi", Level = 2, ParentId = 1, IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "Unknown"},
                    new ProductCategory() {Code = "PC000006", Name = "Kem nền", Level = 2, ParentId = 1, IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "Unknown"},
                    new ProductCategory() {Code = "PC000007", Name = "Kem chống nắng", Level = 2, ParentId = 2, IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "Unknown"}
                };

                try
                {
                    await _context.ProductCategories.AddRangeAsync(categories);
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.ToString());
                }
            }
        }

        private async Task SeedDiscountType()
        {
            if (await _context.DiscountTypes.AnyAsync())
            {
                return;
            }
            var listType = new List<DiscountType>()
            {
                new DiscountType() { Code = DiscountTypeEnum.Percentage.ToString(), Name = "Giảm giá theo phần trăm", Description = "Giảm giá dựa trên tỷ lệ phần trăm của đơn hàng.", IsActive = true, IsDeleted = false, CreatedDate = DateTime.Now, CreatedBy = "System"},
                new DiscountType()
                {
                    Code = DiscountTypeEnum.FixedAmount.ToString(),
                    Name = "Giảm giá số tiền cố định",
                    Description = "Giảm một số tiền cố định từ tổng giá trị đơn hàng.",
                    IsActive = true,
                    IsDeleted = false,
                    CreatedDate = DateTime.Now,
                    CreatedBy = "System"
                },
                new DiscountType()
                {
                    Code = DiscountTypeEnum.FreeShipping.ToString(),
                    Name = "Miễn phí vận chuyển",
                    Description = "Giảm toàn bộ phí vận chuyển khi đạt điều kiện.",
                    IsActive = true,
                    IsDeleted = false,
                    CreatedDate = DateTime.Now,
                    CreatedBy = "System"
                },
                //new DiscountType()
                //{
                //    Code = DiscountTypeEnum.TieredDiscount.ToString(),
                //    Name = "Giảm giá theo cấp bậc",
                //    Description = "Giảm giá theo cấp bậc dựa trên số lượng hoặc giá trị đơn hàng.",
                //    IsActive = true,
                //    IsDeleted = false,
                //    CreatedDate = DateTime.Now,
                //    CreatedBy = "System"
                //},
                //new DiscountType()
                //{
                //    Code = DiscountTypeEnum.BundleDiscount.ToString(),
                //    Name = "Giảm giá khi mua combo",
                //    Description = "Giảm giá khi mua theo combo sản phẩm nhất định.",
                //    IsActive = true,
                //    IsDeleted = false,
                //    CreatedDate = DateTime.Now,
                //    CreatedBy = "System"
                //}
            };

            try
            {
                await _context.DiscountTypes.AddRangeAsync(listType);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }

        private async Task SeedPaymentMethod()
        {
            if (_context.PaymentMethods.Any())
            {
                return;
            }

            var methods = new List<PaymentMethod>
            {
                new PaymentMethod()
                {
                    Code = PaymentMethodEnum.COD.ToString(),
                    Name = "Thanh toán khi nhận hàng",
                    IsActive = true,
                    IsDeleted = false,
                    CreatedDate = DateTime.Now,
                    CreatedBy = "System"
                },
                new PaymentMethod()
                {
                    Code = PaymentMethodEnum.VNPAY.ToString(),
                    Name = "VNPay",
                    IsActive = true,
                    IsDeleted = false,
                    CreatedDate = DateTime.Now,
                    CreatedBy = "System"
                },
                new PaymentMethod()
                {
                    Code = PaymentMethodEnum.CASH.ToString(),
                    Name = "Tiền mặt",
                    IsActive = true,
                    IsDeleted = false,
                    CreatedDate = DateTime.Now,
                    CreatedBy = "System"
                }
            };

            try
            {
                await _context.PaymentMethods.AddRangeAsync(methods);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error seed payment method: ", ex.Message);
            }
        }

        private async Task SeedShippingCompany()
        {
            if (_context.ShippingCompanies.Any())
            {
                return;
            }
            var ships = new List<ShippingCompany>
            {
                new ShippingCompany()
                {
                    Name = "Giao hàng nhanh",
                    Website = "https://khachhang.ghn.vn/",
                    ContactInfo = "",
                    IsDefault = true,
                    IsActive = true,
                    IsDeleted = false,
                    CreatedDate = DateTime.Now,
                    CreatedBy = "System"
                },
                new ShippingCompany()
                {
                    Name = "ViettelPost",
                    Website = "https://viettelpost.vn/",
                    ContactInfo = "",
                    IsDefault = true,
                    IsActive = true,
                    IsDeleted = false,
                    CreatedDate = DateTime.Now,
                    CreatedBy = "System"
                },
            };
            try
            {
                await _context.ShippingCompanies.AddRangeAsync(ships);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error seed shipping company: ", ex.Message);
            }
        }

        public async Task SeedAsync()
        {
            await SeedAddress();
            await SeedPermission();
            await SeedRole();
            await SeedRolePermission();
            await SeedUsers();
            await SeedBrand();
            await SeedProductCategory();
            await SeedDiscountType();
            await SeedPaymentMethod();
            await SeedShippingCompany();
        }
    }
}
