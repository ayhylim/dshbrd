/**
 * Float/Desimal Validation Utilities
 * Helper functions untuk validasi dan handling float/desimal numbers
 */

// 💡 Validasi apakah input adalah angka valid (integer atau float)
export const isValidNumber = value => {
    if (value === undefined || value === null || value === "") {
        return false;
    }
    const num = parseFloat(value);
    return !isNaN(num);
};

// 💡 Validasi apakah angka positif atau zero
export const isNonNegative = value => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
};

// 💡 Konversi string ke float dengan validasi
export const convertToFloat = (value, defaultValue = 0) => {
    if (value === undefined || value === null || value === "") {
        return defaultValue;
    }
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
};

// 💡 Format display dengan 2-3 desimal jika perlu
export const formatFloatDisplay = (value, decimals = "auto") => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0";

    if (decimals === "auto") {
        // Jika ada desimal, tampilkan; jika tidak ada, tampilkan integer saja
        const str = num.toString();
        return str; // Tampilkan sesuai input
    }

    // Jika specify decimals tertentu
    return num.toFixed(decimals);
};

// 💡 Validasi input field (untuk component)
export const validateFloatInput = value => {
    if (value === "" || value === undefined) return {valid: true, value: ""};

    // Hapus karakter non-numeric kecuali titik
    const cleaned = value.toString().replace(/[^0-9.]/g, "");

    // Validasi hanya 1 titik
    const dotCount = (cleaned.match(/\./g) || []).length;
    if (dotCount > 1) {
        return {valid: false, error: "Hanya boleh 1 titik (.) untuk desimal"};
    }

    // Validasi nilai negatif
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num < 0) {
        return {valid: false, error: "Angka tidak boleh negatif"};
    }

    return {valid: true, value: cleaned};
};

// 💡 Compare float dengan tolerance (untuk floating point precision)
export const compareFloat = (a, b, tolerance = 0.0001) => {
    return Math.abs(parseFloat(a) - parseFloat(b)) < tolerance;
};

// 💡 Round float ke desimal tertentu (untuk calculation)
export const roundFloat = (value, decimals = 2) => {
    return Math.round(parseFloat(value) * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// 💡 Validasi range
export const isInRange = (value, min = 0, max = Infinity) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
};

// 💡 Validasi untuk order amount (harus > 0 dan <= available stock)
export const validateOrderAmount = (amount, availableStock) => {
    const num = parseFloat(amount);

    if (isNaN(num)) {
        return {valid: false, error: "Jumlah harus berupa angka valid"};
    }

    if (num <= 0) {
        return {valid: false, error: "Jumlah harus lebih dari 0"};
    }

    if (num > availableStock) {
        return {valid: false, error: `Jumlah melebihi stok tersedia (${availableStock})`};
    }

    return {valid: true, value: num};
};

// 💡 Kalkulasi stok baru setelah order
export const calculateNewStock = (currentStock, orderAmount) => {
    const current = parseFloat(currentStock);
    const order = parseFloat(orderAmount);

    if (isNaN(current) || isNaN(order)) {
        return {valid: false, error: "Nilai tidak valid"};
    }

    const newStock = current - order;

    if (newStock < 0) {
        return {valid: false, error: "Stok akan jadi negatif"};
    }

    return {valid: true, value: roundFloat(newStock, 10)}; // 10 desimal precision
};

// 💡 Format untuk currency display (jika price)
export const formatCurrency = value => {
    const num = parseFloat(value);
    if (isNaN(num)) return "Rp 0";

    return (
        "Rp " +
        num.toLocaleString("id-ID", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })
    );
};

// 💡 Validasi stock threshold (untuk notifikasi)
export const isStockBelowThreshold = (currentStock, threshold) => {
    const stock = parseFloat(currentStock);
    const thresh = parseFloat(threshold);
    return !isNaN(stock) && !isNaN(thresh) && stock < thresh;
};

export default {
    isValidNumber,
    isNonNegative,
    convertToFloat,
    formatFloatDisplay,
    validateFloatInput,
    compareFloat,
    roundFloat,
    isInRange,
    validateOrderAmount,
    calculateNewStock,
    formatCurrency,
    isStockBelowThreshold
};
