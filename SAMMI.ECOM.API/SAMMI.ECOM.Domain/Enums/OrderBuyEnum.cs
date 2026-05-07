using System.Runtime.InteropServices;
using System;

namespace SAMMI.ECOM.Domain.Enums
{
    public enum OperationTypeEnum
    {
        Add,
        Subtract,
        Replace
    }

    public enum PaymentMethodEnum
    {
        COD,
        VNPAY,
        CASH
    }

    public enum PaymentStatusEnum
    {
        Pending, // (Chờ thanh toán)	Đơn hàng đã được tạo nhưng chưa thanh toán.
        Unpaid, // (Chưa thanh toán)	Người mua chưa thực hiện thanh toán.
        Paid, // (Đã thanh toán)	Thanh toán đã được xác nhận thành công.
        Failed, // (Thanh toán thất bại)	Thanh toán không thành công do lỗi.
    }
    public enum ShippingStatusEnum
    {
        NotShipped, // (Chưa giao)	Đơn hàng chưa được vận chuyển.
        Processing, // (Đang xử lý)	Đơn hàng đang được chuẩn bị để vận chuyển. + vận chuyển
        Delivered, // (Đã nhận)	Khách hàng đã nhận được hàng.
        Lost, // (Mất hàng)	Đơn hàng bị thất lạc trong quá trình vận chuyển.
    }
    public enum OrderStatusEnum
    {
        Pending, // (Chờ xử lý)	Đơn hàng mới được tạo và đang chờ xác nhận.
        WaitingForPayment, // (Chờ thanh toán)	Đơn hàng đã tạo nhưng chưa thanh toán. Chờ khách hàng hoàn tất thanh toán.
        Processing, // (Đang xử lý)	Đơn hàng đang được xử lý, có thể đang chuẩn bị hàng.
        Completed, // (Hoàn tất)	Đơn hàng đã hoàn tất và giao dịch thành công.
        Cancelled, // (Đã hủy)	Đơn hàng đã bị hủy bởi người dùng hoặc hệ thống.
    }



    /*
    cho thanh toan(chưa thanh toan) - chưa giao(chưa thanh toan) -> chờ thanh toan
    da thanh toan - dang xu ly(chuẩn bị + dang giao) -> dang xu ly
    da thanh toan - da nhan -> hoan tat
    da thanh toan - lost(mat hang, khong nhan) -> da huy(khong nhan, mat hang)
    cho thanh toan(chưa thanh toan) - chưa giao(chưa thanh toan) -> da huy(khong thanh toan)

    Pending - NotShipped -> WaitingForPayment
    Paid - Processing -> Processing
    Paid - Delivered -> Completed
    Paid - Lost -> Cancelled
    Pending - NotShipped -> Cancelled


    chua thanh toan - chua giao(chua xac nhan) -> chờ xử lý(chua xac nhan)
    chua thanh toan - dang xu ly(da xac nhan) -> dang xu ly(dong goi hang + dang giao)
    da thanh toan - da nhan -> hoan tat
    chua thanh toan - lost(k nhan hang, mat hang) -> da huy
    chua thanh toan - chua giao(chua xac nhan) -> da huy

    Unpaid - NotShipped -> Pending
    Unpaid - Processing -> Processing
    Paid - Delivered -> Completed
    Paid - Lost -> Cancelled
    Unpaid - NotShipped -> Cancelled
    */

    // 1. Cod
    // b1. mới tạo đơn: OrderStatusEnum = Pending, PaymentStatusEnum = Unpaid, ShippingStatusEnum = Notshipped
    // cửa hàng đang xử lý đơn hàng, chuẩn bị hàng ...
    // b2. chuẩn bị đơn hàng: OrderStatusEnum = Processing, PaymentStatusEnum = Unpaid, ShippingStatusEnum = Notshipped
    // b3. Gửi đơn cho khách: OrderStatusEnum = WaitingForShipment, PaymentStatusEnum = Unpaid, ShippingStatusEnum = Processing
    // đang gửi đơn cho khách
    // cho update status ShippingStatusEnum sang mất hàng hoặc đã nhận
    // -> khách đã nhận được hàng và thanh toán
    // OrderStatusEnum = Completed, PaymentStatusEnum = Paid, ShippingStatusEnum = Delivered

    // 2. VNPay
    // b1. mới tạo đơn: OrderStatusEnum = WaitingForPayment, PaymentStatusEnum = Pending, ShippingStatusEnum = Notshipped
    // đang thanh toán đơn hàng:
    // cho update status PaymentStatusEnum Paid, Failed
    // -> khách hàng thanh toán thành công
    // b2. chuẩn bị đơn hàng: OrderStatusEnum = Processing, PaymentStatusEnum = Paid, ShippingStatusEnum = Notshipped
    // b3. Gửi đơn cho khách: OrderStatusEnum = WaitingForShipment, PaymentStatusEnum = Paid, ShippingStatusEnum = Processing
    // đang gửi đơn cho khách
    // cho update status ShippingStatusEnum sang mất hàng hoặc đã nhận
    // -> khách đã nhận được hàng
    // OrderStatusEnum = Completed, PaymentStatusEnum = Paid, ShippingStatusEnum = Delivered



    // mua tại cửa hàng: không phải phương thức thanh toán nhưng nó ảnh hưởng tới logic bên trên
    // ShippingStatusEnum = Processing, PaymentStatusEnum = pending, OrderStatusEnum = Processing
    // 1.cod
    // khách thanh toán xong -> PaymentStatusEnum = paid//update
    // update status OrderStatusEnum = Completed


    public enum PurchaseOrderStatus
    {
        Draft,          // Bản nháp
        PendingApproval, // Chờ duyệt
        Approved,       // Duyệt
        Processing,      // Đang xử lý
        Completed,        // Hoàn tất
        Canceled        // Hủy
    }
}
