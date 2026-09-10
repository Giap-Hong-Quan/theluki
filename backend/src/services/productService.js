import ApiError from "../exceptions/ApiError.js";
import Product from "../models/Product.js";

/**
 * Helper kiểm tra tồn kho & thông tin sản phẩm/biến thể (Màu sắc, Kích cỡ, SKU, Ảnh, Giá)
 */
export const checkProductVariantStock = (product, colorOrOptions, sizeParam, requestedQtyParam) => {
    let variantId = null;
    let sizeId = null;
    let color = null;
    let size = null;
    let requestedQty = 1;

    if (typeof colorOrOptions === "object" && colorOrOptions !== null) {
        variantId = colorOrOptions.variantId;
        sizeId = colorOrOptions.sizeId;
        color = colorOrOptions.color;
        size = colorOrOptions.size;
        requestedQty = sizeParam ?? 1;
    } else {
        color = colorOrOptions;
        size = sizeParam;
        requestedQty = requestedQtyParam ?? 1;
    }

    if (!product || product.isActive === false || (product.deletedAt && product.deletedAt !== null)) {
        throw new ApiError(404, "Sản phẩm không tồn tại hoặc đã ngừng kinh doanh");
    }

    let availableStock = product.stock;
    let variantSku = product.sku;
    let variantImage = product.thumbnail;
    let foundColor = color || "";
    let foundSize = size || "";
    let foundVariantId = variantId || null;
    let foundSizeId = sizeId || null;

    if (product.variants && product.variants.length > 0) {
        // Tìm biến thể theo variantId hoặc tên color
        let colorVar = null;
        if (variantId) {
            colorVar = product.variants.find(
                (v) => v._id && v._id.toString() === variantId.toString()
            );
        }
        if (!colorVar && color) {
            colorVar = product.variants.find(
                (v) => v.color && v.color.trim().toLowerCase() === color.trim().toLowerCase()
            );
        }
        if (!colorVar) {
            colorVar = product.variants[0];
        }

        if (!colorVar) {
            throw new ApiError(400, `Biến thể sản phẩm không tồn tại`);
        }

        foundColor = colorVar.color;
        foundVariantId = colorVar._id;

        // Tìm size theo sizeId hoặc tên size
        let sizeOpt = null;
        if (sizeId && colorVar.sizes) {
            sizeOpt = colorVar.sizes.find(
                (s) => s._id && s._id.toString() === sizeId.toString()
            );
        }
        if (!sizeOpt && size && colorVar.sizes) {
            sizeOpt = colorVar.sizes.find(
                (s) => s.size && s.size.trim().toLowerCase() === size.trim().toLowerCase()
            );
        }
        if (!sizeOpt && colorVar.sizes && colorVar.sizes.length > 0) {
            sizeOpt = colorVar.sizes[0];
        }

        if (!sizeOpt) {
            throw new ApiError(400, `Kích cỡ sản phẩm không tồn tại cho màu '${foundColor}'`);
        }

        foundSize = sizeOpt.size;
        foundSizeId = sizeOpt._id;
        availableStock = sizeOpt.stock;
        variantSku = colorVar.sku || `${product.sku}-${sizeOpt.size.toUpperCase()}`;
        variantImage = colorVar.image || product.thumbnail;
    }

    if (requestedQty > availableStock) {
        throw new ApiError(
            400,
            `Số lượng đặt mua (${requestedQty}) vượt quá số lượng tồn kho khả dụng (${availableStock})`
        );
    }

    return {
        name: product.name,
        price: product.price,
        sku: variantSku,
        thumbnail: variantImage,
        color: foundColor,
        size: foundSize,
        variantId: foundVariantId,
        sizeId: foundSizeId,
        availableStock
    };
};

/**
 * Trừ tồn kho THẬT khi đơn hàng được tạo (khác `checkProductVariantStock` ở trên - hàm đó
 * chỉ KIỂM TRA, hàm này thực sự trừ số lượng trong DB). Nhận thêm `session` để nằm chung
 * transaction với việc tạo Order - nếu bước nào sau đó lỗi thì tồn kho vừa trừ sẽ tự rollback.
 */
export const decreaseProductStock = async (productId, color, size, quantity, session) => {
    const product = await Product.findById(productId).session(session);
    if (!product || product.isActive === false || (product.deletedAt && product.deletedAt !== null)) {
        throw new ApiError(404, "Sản phẩm không tồn tại hoặc đã ngừng kinh doanh");
    }

    if (product.variants && product.variants.length > 0) {
        const colorVar = product.variants.find(
            (v) => v.color && v.color.trim().toLowerCase() === color.trim().toLowerCase()
        );
        if (!colorVar) {
            throw new ApiError(400, `Phân loại màu '${color}' không tồn tại cho sản phẩm '${product.name}'`);
        }

        const sizeOpt = colorVar.sizes?.find(
            (s) => s.size && s.size.trim().toLowerCase() === size.trim().toLowerCase()
        );
        if (!sizeOpt) {
            throw new ApiError(400, `Kích cỡ '${size}' không tồn tại cho màu '${color}'`);
        }

        if (sizeOpt.stock < quantity) {
            throw new ApiError(400, `Sản phẩm '${product.name}' (${color}/${size}) không đủ tồn kho`);
        }
        sizeOpt.stock -= quantity;
    } else {
        if (product.stock < quantity) {
            throw new ApiError(400, `Sản phẩm '${product.name}' không đủ tồn kho`);
        }
        product.stock -= quantity;
    }

    product.sold += quantity;
    await product.save({ session });
};

/**
 * Hoàn lại tồn kho khi đơn hàng bị hủy (ngược lại với `decreaseProductStock` ở trên).
 * Hỗ trợ tìm kiếm theo variantId & sizeId hoặc color & size.
 */
export const restoreProductStock = async (productId, colorOrOptions, sizeParam, quantityParam) => {
    let variantId = null;
    let sizeId = null;
    let color = null;
    let size = null;
    let quantity = 1;

    if (typeof colorOrOptions === "object" && colorOrOptions !== null) {
        variantId = colorOrOptions.variantId;
        sizeId = colorOrOptions.sizeId;
        color = colorOrOptions.color;
        size = colorOrOptions.size;
        quantity = colorOrOptions.quantity ?? 1;
    } else {
        color = colorOrOptions;
        size = sizeParam;
        quantity = quantityParam ?? 1;
    }

    const product = await Product.findById(productId);
    if (!product) return; // Sản phẩm có thể đã bị xóa hẳn, bỏ qua không hoàn kho được nữa

    if (product.variants && product.variants.length > 0) {
        let colorVar = null;
        if (variantId) {
            colorVar = product.variants.find(
                (v) => v._id && v._id.toString() === variantId.toString()
            );
        }
        if (!colorVar && color) {
            colorVar = product.variants.find(
                (v) => v.color && v.color.trim().toLowerCase() === color.trim().toLowerCase()
            );
        }

        if (colorVar && colorVar.sizes) {
            let sizeOpt = null;
            if (sizeId) {
                sizeOpt = colorVar.sizes.find(
                    (s) => s._id && s._id.toString() === sizeId.toString()
                );
            }
            if (!sizeOpt && size) {
                sizeOpt = colorVar.sizes.find(
                    (s) => s.size && s.size.trim().toLowerCase() === size.trim().toLowerCase()
                );
            }
            if (sizeOpt) {
                sizeOpt.stock += quantity;
            }
        }
    } else {
        product.stock += quantity;
    }

    product.sold = Math.max(0, (product.sold || 0) - quantity);
    await product.save();
};
