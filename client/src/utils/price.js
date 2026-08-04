export function calculateDiscountedPrice(price, discountType, discountValue) {
    if (!discountType || discountType === 'none' || !discountValue || discountValue <= 0) {
        return price;
    }
    
    let finalPrice = price;
    if (discountType === 'percentage') {
        finalPrice = price - (price * (discountValue / 100));
    } else if (discountType === 'flat') {
        finalPrice = price - discountValue;
    }
    
    return Math.max(0, Math.round(finalPrice));
}

export function formatDiscountTag(discountType, discountValue) {
    if (!discountType || discountType === 'none' || !discountValue || discountValue <= 0) {
        return null;
    }
    
    if (discountType === 'percentage') {
        return `-${discountValue}%`;
    } else if (discountType === 'flat') {
        return `-৳${discountValue}`;
    }
    
    return null;
}
