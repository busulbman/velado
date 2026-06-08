export const MAX_PRODUCT_IMAGES = 5;
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const normalizeImageValue = (value) => (
  typeof value === 'string' ? value.trim() : ''
);

export const normalizeStockQuantity = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);
  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
};

export const getProductStockQuantity = (product = {}) => (
  normalizeStockQuantity(product.stockQuantity)
);

export const isProductSoldOut = (product = {}) => (
  getProductStockQuantity(product) === 0
);

export const isValidProductImageUrl = (value) => {
  const normalized = normalizeImageValue(value);

  if (!normalized) {
    return false;
  }

  try {
    const url = new URL(normalized);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

export const sanitizeProductImageUrls = (value, limit = MAX_PRODUCT_IMAGES) => {
  const candidates = Array.isArray(value) ? value : [value];
  const images = [];

  candidates.forEach((candidate) => {
    const imageUrl = normalizeImageValue(candidate);

    if (!imageUrl || !isValidProductImageUrl(imageUrl) || images.includes(imageUrl)) {
      return;
    }

    if (images.length < limit) {
      images.push(imageUrl);
    }
  });

  return images;
};

export const normalizeProductImages = (product = {}) => (
  sanitizeProductImageUrls([
    ...(Array.isArray(product.images) ? product.images : []),
    product.imageUrl,
    product.image
  ])
);

export const normalizeProductData = (product = {}) => {
  const images = normalizeProductImages(product);
  const primaryImage = images[0] || '';
  const stockQuantity = getProductStockQuantity(product);

  return {
    ...product,
    images,
    imageUrl: primaryImage,
    image: primaryImage,
    stockQuantity
  };
};

export const prepareProductForSave = (product = {}, options = {}) => {
  const { partial = false } = options;
  const normalizedProduct = { ...product };
  const shouldNormalizeImages = !partial || ['images', 'imageUrl', 'image'].some((key) => hasOwn(product, key));
  const shouldNormalizeStock = !partial || hasOwn(product, 'stockQuantity');

  if (shouldNormalizeImages) {
    const images = sanitizeProductImageUrls([
      ...(Array.isArray(product.images) ? product.images : []),
      product.imageUrl,
      product.image
    ]);
    const primaryImage = images[0] || '';

    normalizedProduct.images = images;
    normalizedProduct.imageUrl = primaryImage;
    normalizedProduct.image = primaryImage;
  }

  if (shouldNormalizeStock) {
    const stockQuantity = normalizeStockQuantity(product.stockQuantity);
    normalizedProduct.stockQuantity = stockQuantity ?? 0;
  }

  return normalizedProduct;
};

export const validateProductImageInputs = (imageInputs = []) => {
  const inputs = Array.isArray(imageInputs) ? imageInputs : [];

  if (inputs.length === 0) {
    return {
      isValid: false,
      images: [],
      message: 'En az 1 görsel linki eklemelisiniz.'
    };
  }

  if (inputs.length > MAX_PRODUCT_IMAGES) {
    return {
      isValid: false,
      images: sanitizeProductImageUrls(inputs),
      message: `En fazla ${MAX_PRODUCT_IMAGES} görsel ekleyebilirsiniz.`
    };
  }

  const trimmedInputs = inputs.map(normalizeImageValue);

  if (trimmedInputs.some((value) => !value)) {
    return {
      isValid: false,
      images: sanitizeProductImageUrls(trimmedInputs),
      message: 'Boş görsel linki bırakamazsınız.'
    };
  }

  const uniqueCount = new Set(trimmedInputs).size;
  if (uniqueCount !== trimmedInputs.length) {
    return {
      isValid: false,
      images: sanitizeProductImageUrls(trimmedInputs),
      message: 'Aynı görsel linkini birden fazla kez ekleyemezsiniz.'
    };
  }

  const invalidLink = trimmedInputs.find((value) => !isValidProductImageUrl(value));
  if (invalidLink) {
    return {
      isValid: false,
      images: sanitizeProductImageUrls(trimmedInputs),
      message: 'Lütfen sadece geçerli http/https görsel linkleri girin.'
    };
  }

  return {
    isValid: true,
    images: sanitizeProductImageUrls(trimmedInputs),
    message: ''
  };
};
