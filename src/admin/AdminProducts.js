import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  Image as ImageIcon,
  Tag,
  Save,
  Package
} from 'lucide-react';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  getAllCategories
} from '../firebase/admin.js';
import {
  MAX_PRODUCT_IMAGES,
  canLoadProductImageUrl,
  isValidProductImageUrl,
  normalizeProductImages,
  validateLoadableProductImageUrls,
  validateProductImageInputs
} from '../utils/productImages.js';
import AdminLayout from './components/AdminLayout.js';
import './AdminProducts.css';

const createDefaultProduct = () => ({
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  category: '',
  sizes: [],
  colors: [],
  material: '',
  care: '',
  images: [''],
  featured: false,
  isNew: false,
  discount: ''
});

const getInitialImageFields = (product = {}) => {
  const images = normalizeProductImages(product);
  return images.length > 0 ? images : [''];
};

const createImagePreviewState = (status = 'idle', url = '', message = '') => ({
  status,
  url,
  message
});

const getEmptyImagePreviewStates = (count = 1) => (
  Array.from({ length: count }, () => createImagePreviewState())
);

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colorOptions = ['Siyah', 'Beyaz', 'Gri', 'Lacivert', 'Kahverengi', 'Bej', 'Haki', 'Bordo'];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [discountingProduct, setDiscountingProduct] = useState(null);
  const [formData, setFormData] = useState(() => createDefaultProduct());
  const [imagePreviewStates, setImagePreviewStates] = useState(() => (
    getEmptyImagePreviewStates(createDefaultProduct().images.length)
  ));
  const [imageError, setImageError] = useState('');
  const [saving, setSaving] = useState(false);
  const [discountForm, setDiscountForm] = useState({ type: 'percent', value: '' });
  const imagePreviewStatesRef = useRef(imagePreviewStates);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    imagePreviewStatesRef.current = imagePreviewStates;
  }, [imagePreviewStates]);

  useEffect(() => {
    let isCancelled = false;
    const trimmedImages = formData.images.map((image) => image.trim());
    const previousStates = imagePreviewStatesRef.current;

    setImagePreviewStates(
      trimmedImages.map((imageUrl, index) => {
        const previousState = previousStates[index];

        if (!imageUrl) {
          return createImagePreviewState();
        }

        if (!isValidProductImageUrl(imageUrl)) {
          return createImagePreviewState('error', imageUrl, 'Görsel yüklenemedi');
        }

        if (
          previousState?.url === imageUrl &&
          (previousState.status === 'loaded' || previousState.status === 'error')
        ) {
          return previousState;
        }

        return createImagePreviewState('loading', imageUrl);
      })
    );

    trimmedImages.forEach(async (imageUrl, index) => {
      const previousState = previousStates[index];

      if (!imageUrl || !isValidProductImageUrl(imageUrl)) {
        return;
      }

      if (
        previousState?.url === imageUrl &&
        (previousState.status === 'loaded' || previousState.status === 'error')
      ) {
        return;
      }

      const isLoadable = await canLoadProductImageUrl(imageUrl);

      if (isCancelled) {
        return;
      }

      setImagePreviewStates((prev) => {
        const next = [...prev];
        next[index] = createImagePreviewState(
          isLoadable ? 'loaded' : 'error',
          imageUrl,
          isLoadable ? '' : 'Görsel yüklenemedi'
        );
        return next;
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [formData.images]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getAllCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        ...createDefaultProduct(),
        ...product,
        images: getInitialImageFields(product),
        price: product.price?.toString() || '',
        originalPrice: product.originalPrice?.toString() || '',
        discount: product.discount?.toString() || ''
      });
    } else {
      setEditingProduct(null);
      setFormData(createDefaultProduct());
    }
    setImagePreviewStates(
      getEmptyImagePreviewStates(product ? getInitialImageFields(product).length : createDefaultProduct().images.length)
    );
    setImageError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(createDefaultProduct());
    setImagePreviewStates(getEmptyImagePreviewStates(createDefaultProduct().images.length));
    setImageError('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleColorToggle = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const handleImageLinkChange = (index, value) => {
    setImageError('');
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((image, imageIndex) => (
        imageIndex === index ? value : image
      ))
    }));
  };

  const handleAddImageField = () => {
    if (formData.images.length >= MAX_PRODUCT_IMAGES) {
      setImageError(`En fazla ${MAX_PRODUCT_IMAGES} görsel ekleyebilirsiniz.`);
      return;
    }

    setImageError('');
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const handleRemoveImage = (index) => {
    setImageError('');
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const imageValidation = validateProductImageInputs(formData.images);

    if (!imageValidation.isValid) {
      setImageError(imageValidation.message);
      return;
    }

    setSaving(true);
    setImageError('');

    try {
      const loadValidation = await validateLoadableProductImageUrls(imageValidation.images);

      if (!loadValidation.isValid) {
        setImagePreviewStates(
          formData.images.map((image) => {
            const trimmedImage = image.trim();

            if (!trimmedImage) {
              return createImagePreviewState();
            }

            const hasFailed = loadValidation.failedUrls.includes(trimmedImage);

            return createImagePreviewState(
              hasFailed ? 'error' : 'loaded',
              trimmedImage,
              hasFailed ? 'Görsel yüklenemedi' : ''
            );
          })
        );
        setImageError('Kaydetmeden önce yüklenemeyen görselleri düzeltin.');
        return;
      }

      const productData = {
        ...formData,
        images: imageValidation.images,
        price: parseFloat(formData.price) || 0,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        discount: formData.discount ? parseInt(formData.discount) : null
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }

      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Ürün kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await toggleProductActive(product.id, !product.isActive);
      await fetchData();
    } catch (error) {
      console.error('Error toggling product:', error);
    }
  };

  const handleDeleteClick = (product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct(deletingProduct.id);
      await fetchData();
      setShowDeleteModal(false);
      setDeletingProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleDiscountClick = (product) => {
    setDiscountingProduct(product);
    setDiscountForm({
      type: 'percent',
      value: product.discount?.toString() || ''
    });
    setShowDiscountModal(true);
  };

  const handleDiscountSave = async () => {
    if (!discountForm.value) {
      alert('Lütfen indirim değeri girin.');
      return;
    }

    try {
      const discountValue = parseFloat(discountForm.value);
      let newPrice = discountingProduct.originalPrice || discountingProduct.price;
      let discountPercent;

      if (discountForm.type === 'percent') {
        discountPercent = discountValue;
        newPrice = newPrice * (1 - discountValue / 100);
      } else {
        newPrice = newPrice - discountValue;
        discountPercent = Math.round((discountValue / (discountingProduct.originalPrice || discountingProduct.price)) * 100);
      }

      await updateProduct(discountingProduct.id, {
        originalPrice: discountingProduct.originalPrice || discountingProduct.price,
        price: Math.round(newPrice),
        discount: discountPercent
      });

      await fetchData();
      setShowDiscountModal(false);
      setDiscountingProduct(null);
    } catch (error) {
      console.error('Error applying discount:', error);
    }
  };

  const uniqueCategories = [
    ...new Set([
      ...categories.map((category) => category.name).filter(Boolean),
      ...products.map((product) => product.category).filter(Boolean)
    ])
  ];
  const canAddMoreImages = formData.images.length < MAX_PRODUCT_IMAGES;

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-products">
        <div className="products-header">
          <div className="products-header-left">
            <h1>Ürünler</h1>
            <span className="products-count">{products.length} ürün</span>
          </div>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Yeni Ürün
          </button>
        </div>

        <div className="products-filters">
          <div className="search-input">
            <Search size={18} />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">Tüm Kategoriler</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Kategori</th>
                <th>Fiyat</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-cell">
                      <div className="product-cell-image">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} />
                        ) : (
                          <ImageIcon size={20} />
                        )}
                      </div>
                      <div className="product-cell-info">
                        <span className="product-cell-name">{product.name}</span>
                        {product.isNew && <span className="badge badge-new">Yeni</span>}
                        {product.discount && <span className="badge badge-sale">%{product.discount}</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{product.category || '-'}</span>
                  </td>
                  <td>
                    <div className="price-cell">
                      <span className="price-current">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="price-original">{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${product.isActive !== false ? 'active' : 'inactive'}`}>
                      {product.isActive !== false ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="action-btn"
                        onClick={() => handleOpenModal(product)}
                        title="Düzenle"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => handleDiscountClick(product)}
                        title="İndirim"
                      >
                        <Tag size={16} />
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => handleToggleActive(product)}
                        title={product.isActive !== false ? 'Pasif Yap' : 'Aktif Yap'}
                      >
                        {product.isActive !== false ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        className="action-btn action-btn-danger"
                        onClick={() => handleDeleteClick(product)}
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="empty-state">
              <Package size={48} />
              <p>Ürün bulunamadı.</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}</h2>
              <button className="admin-modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-body">
              <div className="form-grid">
                <div className="form-group full">
                  <label>Ürün Adı *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group full">
                  <label>Açıklama</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Fiyat (TL) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Eski Fiyat (TL)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Kategori *</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    list="categories-list"
                    required
                  />
                  <datalist id="categories-list">
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div className="form-group">
                  <label>İndirim (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="form-group">
                  <label>Malzeme</label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Bakım Bilgisi</label>
                  <input
                    type="text"
                    name="care"
                    value={formData.care}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full">
                  <label>Bedenler</label>
                  <div className="option-buttons">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        type="button"
                        className={`option-btn ${formData.sizes.includes(size) ? 'active' : ''}`}
                        onClick={() => handleSizeToggle(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group full">
                  <label>Renkler</label>
                  <div className="option-buttons">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`option-btn ${formData.colors.includes(color) ? 'active' : ''}`}
                        onClick={() => handleColorToggle(color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group full">
                  <label>Görsel Linkleri</label>
                  <div className="image-upload-area">
                    <div className="image-upload-header">
                      <p className="image-upload-hint">
                        Direkt görsel linki yapıştırın. En fazla {MAX_PRODUCT_IMAGES} görsel ekleyebilirsiniz.
                      </p>
                      <button
                        type="button"
                        className="upload-btn"
                        onClick={handleAddImageField}
                        disabled={!canAddMoreImages}
                      >
                        <Plus size={18} />
                        Görsel Ekle
                      </button>
                    </div>

                    <span className="image-limit-note">
                      {formData.images.length} / {MAX_PRODUCT_IMAGES} görsel alanı
                    </span>

                    {formData.images.length > 0 ? (
                      <div className="image-link-list">
                        {formData.images.map((url, index) => {
                          const imageState = imagePreviewStates[index] || createImagePreviewState();
                          const trimmedUrl = url.trim();
                          const isLoaded = imageState.status === 'loaded';
                          const isLoading = imageState.status === 'loading';
                          const hasError = imageState.status === 'error';

                          return (
                            <div key={index} className="image-link-row">
                              <div className="image-link-input-group">
                                <label htmlFor={`product-image-${index}`}>Görsel {index + 1}</label>
                                <input
                                  id={`product-image-${index}`}
                                  type="url"
                                  className="image-link-input"
                                  placeholder="https://..."
                                  value={url}
                                  onChange={(e) => handleImageLinkChange(index, e.target.value)}
                                />
                                <span
                                  className={`image-link-status ${isLoaded ? 'valid' : ''} ${isLoading ? 'loading' : ''} ${hasError ? 'error' : ''}`}
                                >
                                  {!trimmedUrl && 'Görsel linki girin'}
                                  {trimmedUrl && isLoading && 'Görsel kontrol ediliyor...'}
                                  {trimmedUrl && isLoaded && 'Görsel hazır'}
                                  {trimmedUrl && hasError && 'Görsel yüklenemedi'}
                                </span>

                                {trimmedUrl && (
                                  <div className={`image-preview ${hasError ? 'error' : ''}`}>
                                    {isLoaded ? (
                                      <img src={trimmedUrl} alt={`Preview ${index + 1}`} />
                                    ) : (
                                      <div className="image-preview-placeholder">
                                        {isLoading ? 'Önizleme yükleniyor...' : <><ImageIcon size={18} /><span>Görsel yüklenemedi</span></>}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {hasError && (
                                  <p className="image-preview-warning">Görsel yüklenemedi</p>
                                )}
                              </div>

                              <button
                                type="button"
                                className="remove-image-btn"
                                onClick={() => handleRemoveImage(index)}
                                aria-label={`Görsel ${index + 1} sil`}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="image-empty-state">
                        Görsel eklemek için “Görsel Ekle” butonunu kullanın.
                      </div>
                    )}

                    {imageError && <p className="image-error">{imageError}</p>}
                  </div>
                </div>

                <div className="form-group full">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                      />
                      <span>Öne Çıkan Ürün</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isNew"
                        checked={formData.isNew}
                        onChange={handleInputChange}
                      />
                      <span>Yeni Ürün</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  İptal
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  <Save size={18} />
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="admin-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="admin-modal admin-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Ürünü Sil</h2>
              <button className="admin-modal-close" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p className="confirm-text">
                <strong>{deletingProduct?.name}</strong> ürününü silmek istediğinize emin misiniz?
                Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                İptal
              </button>
              <button className="btn-danger" onClick={handleDeleteConfirm}>
                <Trash2 size={18} />
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="admin-modal-overlay" onClick={() => setShowDiscountModal(false)}>
          <div className="admin-modal admin-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>İndirim Uygula</h2>
              <button className="admin-modal-close" onClick={() => setShowDiscountModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p className="product-info-text">
                {discountingProduct?.name} - {formatPrice(discountingProduct?.originalPrice || discountingProduct?.price)}
              </p>

              <div className="form-group">
                <label>İndirim Tipi</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="discountType"
                      checked={discountForm.type === 'percent'}
                      onChange={() => setDiscountForm(prev => ({ ...prev, type: 'percent' }))}
                    />
                    <span>Yüzde (%)</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="discountType"
                      checked={discountForm.type === 'fixed'}
                      onChange={() => setDiscountForm(prev => ({ ...prev, type: 'fixed' }))}
                    />
                    <span>Sabit Tutar (TL)</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>İndirim Değeri</label>
                <input
                  type="number"
                  value={discountForm.value}
                  onChange={(e) => setDiscountForm(prev => ({ ...prev, value: e.target.value }))}
                  min="0"
                  placeholder={discountForm.type === 'percent' ? 'örn: 20' : 'örn: 100'}
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-secondary" onClick={() => setShowDiscountModal(false)}>
                İptal
              </button>
              <button className="btn-primary" onClick={handleDiscountSave}>
                <Tag size={18} />
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
