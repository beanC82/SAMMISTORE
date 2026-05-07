export enum PromotionEventType {
    DirectDiscount = "DirectDiscount",      // Giảm giá trực tiếp
    OrderBasedPromotion = "OrderBasedPromotion", // Ưu đãi theo đơn hàng
    FlashSale = "FlashSale",          // Flash Sale & Giờ vàng
    SpecialOccasion = "SpecialOccasion",    // Khuyến mãi theo dịp đặc biệt
}

export const getEventTypeLabel = (type: PromotionEventType): string => {
    switch (type) {
        case PromotionEventType.DirectDiscount:
            return 'Giảm giá trực tiếp';
        case PromotionEventType.OrderBasedPromotion:
            return 'Ưu đãi theo đơn hàng';
        case PromotionEventType.FlashSale:
            return 'Flash Sale & Giờ vàng';
        case PromotionEventType.SpecialOccasion:
            return 'Khuyến mãi theo dịp đặc biệt';
        default:
            return 'Không xác định';
    }
} 