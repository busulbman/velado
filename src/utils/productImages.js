export const MAX_PRODUCT_IMAGES = 5;

const normalizeImageValue = (value) => (
  typeof value === 'string' ? value.trim() : ''
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

export const canLoadProductImageUrl = (value, timeoutMs = 10000) => {
  const normalized = normalizeImageValue(value);

  if (!isValidProductImageUrl(normalized)) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;

    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
      clearTimeout(timeoutId);
    };

    const finish = (result) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve(result);
    };

    const timeoutId = window.setTimeout(() => finish(false), timeoutMs);

    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.decoding = 'async';
    image.referrerPolicy = 'no-referrer';
    image.src = normalized;
  });
};

export const validateLoadableProductImageUrls = async (values = []) => {
  const images = sanitizeProductImageUrls(values);
  const results = await Promise.all(
    images.map(async (imageUrl) => ({
      imageUrl,
      isLoadable: await canLoadProductImageUrl(imageUrl)
    }))
  );
  const failedUrls = results
    .filter((result) => !result.isLoadable)
    .map((result) => result.imageUrl);

  return {
    isValid: failedUrls.length === 0,
    failedUrls
  };
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

  return {
    ...product,
    images,
    imageUrl: primaryImage,
    image: primaryImage
  };
};

export const prepareProductForSave = (product = {}) => {
  const images = sanitizeProductImageUrls([
    ...(Array.isArray(product.images) ? product.images : []),
    product.imageUrl,
    product.image
  ]);
  const primaryImage = images[0] || '';

  return {
    ...product,
    images,
    imageUrl: primaryImage,
    image: primaryImage
  };
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
