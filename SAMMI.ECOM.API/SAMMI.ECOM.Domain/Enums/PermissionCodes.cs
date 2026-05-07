using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SAMMI.ECOM.Domain.AggregateModels.System;

namespace SAMMI.ECOM.Domain.Enums
{
    public enum PermissionEnum
    {
        // Quản lý tài khoản (Manager)
        AccountView,
        AccountUpdate,
        AccountChangePassword,
        AccountLogout,
        // Quản lý khách hàng (Manager)
        CustomerCreate,
        CustomerUpdate,
        CustomerDelete,
        CustomerView,
        // Quản lý nhân viên
        EmployeeCreate,
        EmployeeUpdate,
        EmployeeDelete,
        EmployeeView,
        // Quản lý nhà cung cấp
        SupplierCreate,
        SupplierUpdate,
        SupplierDelete,
        SupplierView,
        // Quản lý sản phẩm (Manager)
        ProductCreate,
        ProductUpdate,
        ProductDelete,
        ProductView,
        ProductSearch,
        // Danh mục loại sản phẩm (Manager)
        ProductCategoryCreate,
        ProductCategoryUpdate,
        ProductCategoryDelete,
        ProductCategoryView,
        // Danh mục thương hiệu (Manager)
        BrandCreate,
        BrandUpdate,
        BrandDelete,
        BrandView,
        // Quản lý nhập hàng (Manager)
        ImportCreate,
        ImportUpdate,
        ImportUpdateStatus,
        ImportDelete,
        ImportView,
        // Quản lý đơn hàng (Manager)
        OrderView,
        OrderUpdateStatus,
        // Thông báo (Manager)
        NotificationView,
        NotificationUpdate,
        // Chat (Manager)
        ChatManager,

        // Quyền quản lý tỉnh/thành phố
        //ProvinceCreate,
        ProvinceUpdate,
        //ProvinceDelete,
        ProvinceView,

        // Quyền quản lý quận/huyện
        //DistrictCreate,
        //DistrictUpdate,
        //DistrictDelete,
        DistrictView,

        // Quyền quản lý phường/xã
        //WardCreate,
        //WardUpdate,
        //WardDelete,
        WardView,

        // Quyền quản lý phương thức thanh toán
        PaymentMethodCreate,
        //PaymentMethodUpdate,
        //PaymentMethodDelete,
        PaymentMethodView,

        // Quyền quản lý banner
        BannerCreate,
        BannerUpdate,
        BannerDelete,
        BannerView,

        // Quyền quản lý vai trò và quyền
        RoleCreate,
        RoleUpdate,
        RoleDelete,
        RoleView,
        RoleAssignPermission,

        // Quyền thống kê
        ReportRevenue,
        ReportStock,
        ReportImport,

        // Quyền quản lý sự kiện
        EventCreate,    
        EventUpdate,    
        EventDelete,    
        EventView,      

        // Quyền quản lý voucher
        VoucherCreate,  
        VoucherUpdate,  
        VoucherDelete,  
        VoucherView,    


        // Sản phẩm (Customer)
        CustomerProductView,
        CustomerProductSearch,
        CustomerProductAdvancedSearch,
        // Giỏ hàng (Customer)
        CustomerCartView,       // Xem giỏ hàng
        CustomerCartAdd,        // Thêm sản phẩm vào giỏ hàng
        CustomerCartRemove,

        //Đơn hàng (Customer)
        CustomerOrderPlace,
        CustomerOrderPayment,
        // Theo dõi đơn hàng (Customer)
        CustomerOrderTrack,
        CustomerOrderCancel,
        // Thông báo & Thông tin nhận hàng (Customer)
        CustomerNotificationManage,
        CustomerShippingInfoManage,
        // Đánh giá & Sản phẩm yêu thích (Customer)
        CustomerProductReview,
        CustomerFavoriteProductsManage,
        // Voucher (Customer)
        CustomerVoucherManage,
        // customer address
        CustomerDeliveryAddressManagement
    }

    public static class PermissionCodes
    {
        public static string ToPolicyName(this PermissionEnum permission)
        {
            return permission switch
            {
                // Quyền liên quan đến tài khoản
                PermissionEnum.AccountView => "ACCOUNT_VIEW", // Cho phép xem chi tiết tài khoản
                PermissionEnum.AccountUpdate => "ACCOUNT_UPDATE", // Cho phép cập nhật thông tin tài khoản
                PermissionEnum.AccountChangePassword => "ACCOUNT_CHANGE_PASSWORD", // Cho phép thay đổi mật khẩu tài khoản
                PermissionEnum.AccountLogout => "ACCOUNT_LOGOUT", // Cho phép đăng xuất tài khoản

                // Quyền quản lý khách hàng (dành cho admin)
                PermissionEnum.CustomerCreate => "CUSTOMER_CREATE", // Cho phép tạo mới hồ sơ khách hàng
                PermissionEnum.CustomerUpdate => "CUSTOMER_UPDATE", // Cho phép cập nhật hồ sơ khách hàng
                PermissionEnum.CustomerDelete => "CUSTOMER_DELETE", // Cho phép xóa hồ sơ khách hàng
                PermissionEnum.CustomerView => "CUSTOMER_VIEW", // Cho phép xem hồ sơ khách hàng

                // Quyền quản lý nhân viên (admin)
                PermissionEnum.EmployeeCreate => "EMPLOYEE_CREATE", // Cho phép tạo mới hồ sơ nhân viên
                PermissionEnum.EmployeeUpdate => "EMPLOYEE_UPDATE", // Cho phép cập nhật hồ sơ nhân viên
                PermissionEnum.EmployeeDelete => "EMPLOYEE_DELETE", // Cho phép xóa hồ sơ nhân viên
                PermissionEnum.EmployeeView => "EMPLOYEE_VIEW", // Cho phép xem hồ sơ nhân viên

                // Quyền quản lý nhà cung cấp (admin)
                PermissionEnum.SupplierCreate => "SUPPLIER_CREATE", // Cho phép tạo mới nhà cung cấp
                PermissionEnum.SupplierUpdate => "SUPPLIER_UPDATE", // Cho phép cập nhật thông tin nhà cung cấp
                PermissionEnum.SupplierDelete => "SUPPLIER_DELETE", // Cho phép xóa nhà cung cấp
                PermissionEnum.SupplierView => "SUPPLIER_VIEW", // Cho phép xem thông tin nhà cung cấp

                // Quyền quản lý sản phẩm (dành cho admin)
                PermissionEnum.ProductCreate => "PRODUCT_CREATE", // Cho phép tạo mới sản phẩm
                PermissionEnum.ProductUpdate => "PRODUCT_UPDATE", // Cho phép cập nhật chi tiết sản phẩm
                PermissionEnum.ProductDelete => "PRODUCT_DELETE", // Cho phép xóa sản phẩm
                PermissionEnum.ProductView => "PRODUCT_VIEW", // Cho phép xem chi tiết sản phẩm

                // Quyền quản lý danh mục sản phẩm (dành cho admin)
                PermissionEnum.ProductCategoryCreate => "PRODUCT_CATEGORY_CREATE", // Cho phép tạo danh mục sản phẩm
                PermissionEnum.ProductCategoryUpdate => "PRODUCT_CATEGORY_UPDATE", // Cho phép cập nhật danh mục sản phẩm
                PermissionEnum.ProductCategoryDelete => "PRODUCT_CATEGORY_DELETE", // Cho phép xóa danh mục sản phẩm
                PermissionEnum.ProductCategoryView => "PRODUCT_CATEGORY_VIEW", // Cho phép xem danh mục sản phẩm

                // Quyền quản lý thương hiệu (dành cho admin)
                PermissionEnum.BrandCreate => "BRAND_CREATE", // Cho phép tạo mới thương hiệu
                PermissionEnum.BrandUpdate => "BRAND_UPDATE", // Cho phép cập nhật chi tiết thương hiệu
                PermissionEnum.BrandDelete => "BRAND_DELETE", // Cho phép xóa thương hiệu
                PermissionEnum.BrandView => "BRAND_VIEW", // Cho phép xem chi tiết thương hiệu

                // Quyền quản lý nhập hàng (dành cho admin)
                PermissionEnum.ImportCreate => "IMPORT_CREATE", // Cho phép tạo bản ghi nhập hàng
                PermissionEnum.ImportUpdate => "IMPORT_UPDATE", // Cho phép sửa bản ghi nhập hàng
                PermissionEnum.ImportUpdateStatus => "IMPORT_UPDATE_STATUS", // Cho phép cập nhật trạng thái nhập hàng
                PermissionEnum.ImportDelete => "IMPORT_DELETE", // Cho phép xóa bản ghi nhập hàng
                PermissionEnum.ImportView => "IMPORT_VIEW", // Cho phép xem bản ghi nhập hàng

                // Quyền quản lý đơn hàng (dành cho admin)
                PermissionEnum.OrderView => "ORDER_VIEW", // Cho phép xem chi tiết đơn hàng
                PermissionEnum.OrderUpdateStatus => "ORDER_UPDATE_STATUS", // Cho phép cập nhật trạng thái đơn hàng

                // Quyền quản lý thông báo (dành cho admin)
                PermissionEnum.NotificationView => "NOTIFICATION_VIEW", // Cho phép xem thông báo
                PermissionEnum.NotificationUpdate => "NOTIFICATION_UPDATE", // Cho phép cập nhật thông báo

                // Quyền quản lý trò chuyện (dành cho admin)
                PermissionEnum.ChatManager => "CHAT_MANAGER", // Cho phép quản lý chức năng trò chuyện

                // Quyền quản lý tỉnh/thành phố
                //PermissionEnum.ProvinceCreate => "PROVINCE_CREATE",
                PermissionEnum.ProvinceUpdate => "PROVINCE_UPDATE",
                //PermissionEnum.ProvinceDelete => "PROVINCE_DELETE",
                PermissionEnum.ProvinceView => "PROVINCE_VIEW",
                PermissionEnum.ProductSearch => "PRODUCT_SEARCH",

                // Quyền quản lý quận/huyện
                //PermissionEnum.DistrictCreate => "DISTRICT_CREATE",
                //PermissionEnum.DistrictUpdate => "DISTRICT_UPDATE",
                //PermissionEnum.DistrictDelete => "DISTRICT_DELETE",
                PermissionEnum.DistrictView => "DISTRICT_VIEW",

                // Quyền quản lý phường/xã
                //PermissionEnum.WardCreate => "WARD_CREATE",
                //PermissionEnum.WardUpdate => "WARD_UPDATE",
                //PermissionEnum.WardDelete => "WARD_DELETE",
                PermissionEnum.WardView => "WARD_VIEW",

                // Quyền quản lý phương thức thanh toán
                PermissionEnum.PaymentMethodCreate => "PAYMENT_METHOD_CREATE",
                //PermissionEnum.PaymentMethodUpdate => "PAYMENT_METHOD_UPDATE",
                //PermissionEnum.PaymentMethodDelete => "PAYMENT_METHOD_DELETE",
                PermissionEnum.PaymentMethodView => "PAYMENT_METHOD_VIEW",

                // Quyền quản lý banner
                PermissionEnum.BannerCreate => "BANNER_CREATE",
                PermissionEnum.BannerUpdate => "BANNER_UPDATE",
                PermissionEnum.BannerDelete => "BANNER_DELETE",
                PermissionEnum.BannerView => "BANNER_VIEW",

                // Quyền quản lý vai trò và quyền
                PermissionEnum.RoleCreate => "ROLE_CREATE",
                PermissionEnum.RoleUpdate => "ROLE_UPDATE",
                PermissionEnum.RoleDelete => "ROLE_DELETE",
                PermissionEnum.RoleView => "ROLE_VIEW",
                PermissionEnum.RoleAssignPermission => "ROLE_ASSIGN_PERMISSION",

                // Quyền thống kê
                PermissionEnum.ReportRevenue => "REPORT_REVENUE",
                PermissionEnum.ReportStock => "REPORT_STOCK",
                PermissionEnum.ReportImport => "REPORT_IMPORT",

                // Quyền quản lý sự kiện
                PermissionEnum.EventCreate => "EVENT_CREATE",
                PermissionEnum.EventUpdate => "EVENT_UPDATE",
                PermissionEnum.EventDelete => "EVENT_DELETE",
                PermissionEnum.EventView => "EVENT_VIEW",

                // Quyền quản lý voucher
                PermissionEnum.VoucherCreate => "VOUCHER_CREATE",
                PermissionEnum.VoucherUpdate => "VOUCHER_UPDATE",
                PermissionEnum.VoucherDelete => "VOUCHER_DELETE",
                PermissionEnum.VoucherView => "VOUCHER_VIEW",




                // Quyền xem và tìm kiếm sản phẩm (dành cho khách hàng)
                PermissionEnum.CustomerProductView => "CUSTOMER_PRODUCT_VIEW", // Cho phép khách hàng xem sản phẩm
                PermissionEnum.CustomerProductSearch => "CUSTOMER_PRODUCT_SEARCH", // Cho phép khách hàng tìm kiếm sản phẩm
                PermissionEnum.CustomerProductAdvancedSearch => "CUSTOMER_PRODUCT_ADVANCED_SEARCH", // Cho phép khách hàng tìm kiếm nâng cao sản phẩm

                // Quyền quản lý giỏ hàng (dành cho khách hàng)
                PermissionEnum.CustomerCartView => "CUSTOMER_CART_VIEW",       // Quyền mới
                PermissionEnum.CustomerCartAdd => "CUSTOMER_CART_ADD",         // Quyền mới
                PermissionEnum.CustomerCartRemove => "CUSTOMER_CART_REMOVE",   // Quyền mới

                // đơn hàng (dành cho khách hàng)
                PermissionEnum.CustomerOrderPlace => "CUSTOMER_ORDER_PLACE", // Cho phép khách hàng đặt đơn hàng
                PermissionEnum.CustomerOrderPayment => "CUSTOMER_ORDER_PAYMENT", // Cho phép khách hàng thanh toán đơn hàng
                PermissionEnum.CustomerOrderTrack => "CUSTOMER_ORDER_TRACK", // Cho phép khách hàng theo dõi đơn hàng
                PermissionEnum.CustomerOrderCancel => "CUSTOMER_ORDER_CANCEL", // Cho phép khách hàng hủy đơn hàng

                // Quyền quản lý thông báo và thông tin giao hàng (dành cho khách hàng)
                PermissionEnum.CustomerNotificationManage => "CUSTOMER_NOTIFICATION_MANAGE", // Cho phép khách hàng quản lý thông báo
                PermissionEnum.CustomerShippingInfoManage => "CUSTOMER_SHIPPING_INFO_MANAGE", // Cho phép khách hàng quản lý thông tin giao hàng

                // Quyền liên quan đến đánh giá và sản phẩm yêu thích (dành cho khách hàng)
                PermissionEnum.CustomerProductReview => "CUSTOMER_PRODUCT_REVIEW", // Cho phép khách hàng đánh giá sản phẩm
                PermissionEnum.CustomerFavoriteProductsManage => "CUSTOMER_FAVORITE_PRODUCTS_MANAGE", // Cho phép khách hàng quản lý sản phẩm yêu thích
                PermissionEnum.CustomerVoucherManage => "CUSTOMER_VOUCHER_MANAGE", // Cho phép khách hàng quản lý voucher

                // quyền quản lý địa chỉ
                PermissionEnum.CustomerDeliveryAddressManagement => "CUSTOMER_DELIVERY_ADDRESS_MANAGE",
                // Xử lý trường hợp quyền không xác định
                _ => throw new ArgumentException($"Quyền không xác định: {permission}")
            };
        }

        public static readonly PermissionEnum[] PERMISSION_CODES = new[]
        {
            // Quyền tài khoản
            PermissionEnum.AccountView,
            PermissionEnum.AccountUpdate,
            PermissionEnum.AccountChangePassword,
            PermissionEnum.AccountLogout,

            // Quyền quản lý khách hàng (admin)
            PermissionEnum.CustomerCreate,
            PermissionEnum.CustomerUpdate,
            PermissionEnum.CustomerDelete,
            PermissionEnum.CustomerView,

            // Quyền quản lý nhân viên (admin)
            PermissionEnum.EmployeeCreate,
            PermissionEnum.EmployeeUpdate,
            PermissionEnum.EmployeeDelete,
            PermissionEnum.EmployeeView,

            // Quyền quản lý nhà cung cấp (admin)
            PermissionEnum.SupplierCreate,
            PermissionEnum.SupplierUpdate,
            PermissionEnum.SupplierDelete,
            PermissionEnum.SupplierView,

            // Quyền quản lý sản phẩm (admin)
            PermissionEnum.ProductCreate,
            PermissionEnum.ProductUpdate,
            PermissionEnum.ProductDelete,
            PermissionEnum.ProductView,
            PermissionEnum.ProductSearch,


            // Quyền quản lý danh mục sản phẩm (admin)
            PermissionEnum.ProductCategoryCreate,
            PermissionEnum.ProductCategoryUpdate,
            PermissionEnum.ProductCategoryDelete,
            PermissionEnum.ProductCategoryView,

            // Quyền quản lý thương hiệu (admin)
            PermissionEnum.BrandCreate,
            PermissionEnum.BrandUpdate,
            PermissionEnum.BrandDelete,
            PermissionEnum.BrandView,

            // Quyền quản lý nhập hàng (admin)
            PermissionEnum.ImportCreate,
            PermissionEnum.ImportUpdateStatus,
            PermissionEnum.ImportDelete,
            PermissionEnum.ImportView,

            // Quyền quản lý đơn hàng (admin)
            PermissionEnum.OrderView,
            PermissionEnum.OrderUpdateStatus,

            // Quyền quản lý thông báo (admin)
            PermissionEnum.NotificationView,
            PermissionEnum.NotificationUpdate,

            // Quyền quản lý trò chuyện (admin)
            PermissionEnum.ChatManager,

            // Quyền quản lý tỉnh/thành phố
            //PermissionEnum.ProvinceCreate,
            //PermissionEnum.ProvinceUpdate,
            //PermissionEnum.ProvinceDelete,
            PermissionEnum.ProvinceView,

            // Quyền quản lý quận/huyện
            //PermissionEnum.DistrictCreate,
            //PermissionEnum.DistrictUpdate,
            //PermissionEnum.DistrictDelete,
            PermissionEnum.DistrictView,

            // Quyền quản lý phường/xã
            //PermissionEnum.WardCreate,
            //PermissionEnum.WardUpdate,
            //PermissionEnum.WardDelete,
            PermissionEnum.WardView,

            // Quyền quản lý phương thức thanh toán
            PermissionEnum.PaymentMethodCreate,
            //PermissionEnum.PaymentMethodUpdate,
            //PermissionEnum.PaymentMethodDelete,
            PermissionEnum.PaymentMethodView,

            // Quyền quản lý banner
            PermissionEnum.BannerCreate,
            PermissionEnum.BannerUpdate,
            PermissionEnum.BannerDelete,
            PermissionEnum.BannerView,

            // Quyền quản lý vai trò và quyền
            PermissionEnum.RoleCreate,
            PermissionEnum.RoleUpdate,
            PermissionEnum.RoleDelete,
            PermissionEnum.RoleView,
            PermissionEnum.RoleAssignPermission,

             // Quyền thống kê
            PermissionEnum.ReportRevenue,
            PermissionEnum.ReportStock,
            PermissionEnum.ReportImport,

            // Quyền quản lý event
            PermissionEnum.EventCreate,
            PermissionEnum.EventUpdate,
            PermissionEnum.EventDelete,
            PermissionEnum.EventView,

            // quyền quản lý voucher
            PermissionEnum.VoucherCreate,
            PermissionEnum.VoucherUpdate,
            PermissionEnum.VoucherDelete,
            PermissionEnum.VoucherView,


            // Quyền xem và tìm kiếm sản phẩm (khách hàng)
            PermissionEnum.CustomerProductView,
            PermissionEnum.CustomerProductSearch,
            PermissionEnum.CustomerProductAdvancedSearch,

            // Quyền quản lý giỏ hàng  (khách hàng)
            PermissionEnum.CustomerCartView,
            PermissionEnum.CustomerCartAdd,
            PermissionEnum.CustomerCartRemove,

            // Quyền quản lý đơn hàng
            PermissionEnum.CustomerOrderPlace,
            PermissionEnum.CustomerOrderPayment,
            PermissionEnum.CustomerOrderTrack,
            PermissionEnum.CustomerOrderCancel,

            // Quyền quản lý thông báo và thông tin giao hàng (khách hàng)
            PermissionEnum.CustomerNotificationManage,
            PermissionEnum.CustomerShippingInfoManage,

            // Quyền đánh giá và quản lý sản phẩm yêu thích (khách hàng)
            PermissionEnum.CustomerProductReview,
            PermissionEnum.CustomerFavoriteProductsManage,
            PermissionEnum.CustomerVoucherManage,

            // quyền quản lý địa chỉ nhận
            PermissionEnum.CustomerDeliveryAddressManagement
        };

        public static readonly PermissionEnum[] PERMISSION_ADMIN_CODES = new[]
        {
            // Quyền tài khoản
            PermissionEnum.AccountView,
            PermissionEnum.AccountUpdate,
            PermissionEnum.AccountChangePassword,
            PermissionEnum.AccountLogout,

            // Quyền quản lý khách hàng (admin)
            PermissionEnum.CustomerCreate,
            PermissionEnum.CustomerUpdate,
            PermissionEnum.CustomerDelete,
            PermissionEnum.CustomerView,

            // Quyền quản lý nhân viên (admin)
            PermissionEnum.EmployeeCreate,
            PermissionEnum.EmployeeUpdate,
            PermissionEnum.EmployeeDelete,
            PermissionEnum.EmployeeView,

            // Quyền quản lý nhà cung cấp (admin)
            PermissionEnum.SupplierCreate,
            PermissionEnum.SupplierUpdate,
            PermissionEnum.SupplierDelete,
            PermissionEnum.SupplierView,

            // Quyền quản lý sản phẩm (admin)
            PermissionEnum.ProductCreate,
            PermissionEnum.ProductUpdate,
            PermissionEnum.ProductDelete,
            PermissionEnum.ProductView,
            PermissionEnum.ProductSearch,


            // Quyền quản lý danh mục sản phẩm (admin)
            PermissionEnum.ProductCategoryCreate,
            PermissionEnum.ProductCategoryUpdate,
            PermissionEnum.ProductCategoryDelete,
            PermissionEnum.ProductCategoryView,

            // Quyền quản lý thương hiệu (admin)
            PermissionEnum.BrandCreate,
            PermissionEnum.BrandUpdate,
            PermissionEnum.BrandDelete,
            PermissionEnum.BrandView,

            // Quyền quản lý nhập hàng (admin)
            PermissionEnum.ImportCreate,
            PermissionEnum.ImportUpdate,
            PermissionEnum.ImportUpdateStatus,
            PermissionEnum.ImportDelete,
            PermissionEnum.ImportView,

            // Quyền quản lý đơn hàng (admin)
            PermissionEnum.OrderView,
            PermissionEnum.OrderUpdateStatus,

            // Quyền quản lý thông báo (admin)
            PermissionEnum.NotificationView,
            PermissionEnum.NotificationUpdate,

            // Quyền quản lý trò chuyện (admin)
            PermissionEnum.ChatManager,

            // Quyền quản lý tỉnh/thành phố
            PermissionEnum.ProvinceView,

            // Quyền quản lý quận/huyện
            PermissionEnum.DistrictView,

            // Quyền quản lý phường/xã
            PermissionEnum.WardView,

            // Quyền quản lý phương thức thanh toán
            PermissionEnum.PaymentMethodCreate,
            PermissionEnum.PaymentMethodView,

            // Quyền quản lý banner
            PermissionEnum.BannerCreate,
            PermissionEnum.BannerUpdate,
            PermissionEnum.BannerDelete,
            PermissionEnum.BannerView,

            // Quyền quản lý vai trò và quyền
            PermissionEnum.RoleCreate,
            PermissionEnum.RoleUpdate,
            PermissionEnum.RoleDelete,
            PermissionEnum.RoleView,
            PermissionEnum.RoleAssignPermission,

             // Quyền thống kê
            PermissionEnum.ReportRevenue,
            PermissionEnum.ReportStock,
            PermissionEnum.ReportImport,

            // Quyền quản lý event
            PermissionEnum.EventCreate,
            PermissionEnum.EventUpdate,
            PermissionEnum.EventDelete,
            PermissionEnum.EventView,

            // quyền quản lý voucher
            PermissionEnum.VoucherCreate,
            PermissionEnum.VoucherUpdate,
            PermissionEnum.VoucherDelete,
            PermissionEnum.VoucherView,
        };

        public static readonly PermissionEnum[] PERMISSION_EMPLOYEE_CODES = new[]
        {
            // Quyền tài khoản
            PermissionEnum.AccountView,
            PermissionEnum.AccountUpdate,
            PermissionEnum.AccountChangePassword,
            PermissionEnum.AccountLogout,

            // Quyền quản lý sản phẩm (admin)
            PermissionEnum.ProductView,
            PermissionEnum.ProductSearch,


            // Quyền quản lý danh mục sản phẩm (admin)
            PermissionEnum.ProductCategoryView,

            // Quyền quản lý thương hiệu (admin)
            PermissionEnum.BrandView,

            // Quyền quản lý nhập hàng (admin)
            PermissionEnum.ImportCreate,
            PermissionEnum.ImportUpdate,
            PermissionEnum.ImportUpdateStatus,
            PermissionEnum.ImportView,

            // Quyền quản lý đơn hàng (admin)
            PermissionEnum.OrderView,
            PermissionEnum.OrderUpdateStatus,

            // Quyền quản lý thông báo (admin)
            PermissionEnum.NotificationView,
            PermissionEnum.NotificationUpdate,

            // Quyền quản lý trò chuyện (admin)
            PermissionEnum.ChatManager,

            // Quyền quản lý tỉnh/thành phố
            PermissionEnum.ProvinceView,

            // Quyền quản lý quận/huyện
            PermissionEnum.DistrictView,

            // Quyền quản lý phường/xã
            PermissionEnum.WardView,

            // Quyền quản lý phương thức thanh toán
            PermissionEnum.PaymentMethodView,

            // Quyền quản lý banner
            PermissionEnum.BannerView,

            // Quyền quản lý vai trò và quyền
            PermissionEnum.RoleView,

            // Quyền quản lý event
            PermissionEnum.EventView,

            // quyền quản lý voucher
            PermissionEnum.VoucherView,
        };

        public static readonly PermissionEnum[] PERMISSION_CUSTOMER_CODES = new[]
        {
            // Quyền tài khoản
            PermissionEnum.AccountView,
            PermissionEnum.AccountUpdate,
            PermissionEnum.AccountChangePassword,
            PermissionEnum.AccountLogout,

            PermissionEnum.NotificationView,
            PermissionEnum.NotificationUpdate,

            //  tỉnh/thành phố
            PermissionEnum.ProvinceView,

            // Quyền quận/huyện
            PermissionEnum.DistrictView,

            // Quyền phường/xã
            PermissionEnum.WardView,

            PermissionEnum.ProductCategoryView,

            PermissionEnum.BrandView,

            PermissionEnum.PaymentMethodView,

            PermissionEnum.BannerView,

            // Quyền xem và tìm kiếm sản phẩm (khách hàng)
            PermissionEnum.CustomerProductView,
            PermissionEnum.CustomerProductSearch,
            PermissionEnum.CustomerProductAdvancedSearch,

            // Quyền quản lý giỏ hàng  (khách hàng)
            PermissionEnum.CustomerCartView,
            PermissionEnum.CustomerCartAdd,
            PermissionEnum.CustomerCartRemove,

            // Quyền quản lý đơn hàng
            PermissionEnum.CustomerOrderPlace,
            PermissionEnum.CustomerOrderPayment,
            PermissionEnum.CustomerOrderTrack,
            PermissionEnum.CustomerOrderCancel,

            // Quyền quản lý thông báo và thông tin giao hàng (khách hàng)
            PermissionEnum.CustomerNotificationManage,
            PermissionEnum.CustomerShippingInfoManage,

            // Quyền đánh giá và quản lý sản phẩm yêu thích (khách hàng)
            PermissionEnum.CustomerProductReview,
            PermissionEnum.CustomerFavoriteProductsManage,
            PermissionEnum.CustomerVoucherManage,

            // quyền quản lý địa chỉ nhận
            PermissionEnum.CustomerDeliveryAddressManagement
        };

        public static readonly PermissionEnum[] PERMISSION_DEFAULT_CODES = new[]
        {
            // Quyền tài khoản
            PermissionEnum.AccountView,
            PermissionEnum.AccountUpdate,
            PermissionEnum.AccountChangePassword,
            PermissionEnum.AccountLogout,

            // Quyền quản lý sản phẩm (admin)
            PermissionEnum.ProductView,
            PermissionEnum.ProductSearch,


            // Quyền quản lý danh mục sản phẩm (admin)
            PermissionEnum.ProductCategoryView,

            // Quyền quản lý thương hiệu (admin)
            PermissionEnum.BrandView,

            // Quyền quản lý thông báo (admin)
            PermissionEnum.NotificationView,
            PermissionEnum.NotificationUpdate,

            // Quyền quản lý trò chuyện (admin)
            PermissionEnum.ChatManager,

            // Quyền quản lý tỉnh/thành phố
            PermissionEnum.ProvinceView,

            // Quyền quản lý quận/huyện
            PermissionEnum.DistrictView,

            // Quyền quản lý phường/xã
            PermissionEnum.WardView,

            // Quyền quản lý phương thức thanh toán
            PermissionEnum.PaymentMethodView,

            // Quyền quản lý banner
            PermissionEnum.BannerView,

            // Quyền quản lý event
            PermissionEnum.EventView,

            // quyền quản lý voucher
            PermissionEnum.VoucherView,
        };

        public static readonly PermissionEnum[] AllPermissionCodes = Enum.GetValues(typeof(PermissionEnum))
            .Cast<PermissionEnum>()
            .ToArray();

        public static IEnumerable<string> AllPermissions => AllPermissionCodes
            .Select(p => p.ToPolicyName());
    }
}
