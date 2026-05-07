namespace SAMMI.ECOM.Domain.DomainModels.VNPay
{
    public class VNPayIPNDTO
    {
        public string vnp_TxnRef { get; set; } // Mã đơn hàng
        public string vnp_Amount { get; set; } // Số tiền (đơn vị: VND)
        public string vnp_ResponseCode { get; set; } // Mã kết quả (ví dụ: "00" là thành công)
        public string vnp_TransactionNo { get; set; } // Mã giao dịch tại VNPay
        public string vnp_BankCode { get; set; } // Mã ngân hàng
        public string vnp_BankTranNo { get; set; } // Mã giao dịch tại ngân hàng
        public string vnp_CardType { get; set; } // Loại thẻ (ATM, Visa, MasterCard, etc.)
        public string vnp_PayDate { get; set; } // Thời gian thanh toán (định dạng: yyyyMMddHHmmss)
        public string vnp_OrderInfo { get; set; } // Thông tin đơn hàng
        public string vnp_TransactionStatus { get; set; } // Trạng thái giao dịch
        public string vnp_TmnCode { get; set; } // Mã merchant
        public string vnp_CurrCode { get; set; } // Mã tiền tệ (ví dụ: "VND")
        public string vnp_SecureHash { get; set; } // Checksum
        public string vnp_SecureHashType { get; set; } // Loại checksum (ví dụ: "SHA256")
    }
}
