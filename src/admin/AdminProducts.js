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
  Package,
  Upload
} from 'lucide-react';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  getAllCategories,
  uploadProductImage,
  MAX_PRODUCT_IMAGE_FILE_SIZE_BYTES,
  MAX_PRODUCT_IMAGE_FILE_SIZE_MB,
  SUPPORTED_PRODUCT_IMAGE_TYPES
} from '../firebase/admin.js';
import {
  MAX_PRODUCT_IMAGES,
  getProductStockQuantity,
  isProductSoldOut,
  normalizeProductImages,
  validateProductImageInputs
} from '../utils/productImages.js';
import AdminLayout from './components/AdminLayout.js';
import './AdminProducts.css';

const createDefaultProduct = () => ({
  name: '',
  description: '',
  price: '',
  stockQuantity: '',
  originalPrice: '',
  category: '',
  sizes: [],
  colors: [],
  material: '',
  care: '',
  images: [],
  featured: false,
  isNew: false,
  discount: ''
});

const getInitialImageFields = (product = {}) => {
  const images = normalizeProductImages(product);
  return images.length > 0 ? images : [];
};

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colorOptions = ['Siyah', 'Beyaz', 'Gri', 'Lacivert', 'Kahverengi', 'Bej', 'Haki', 'Bordo'];
const isBrowserFile = (file) => (
  typeof File !== 'undefined' && file instanceof File
);

const isImageFile = (file) => (
  isBrowserFile(file) &&
  typeof file.type === 'string' &&
  file.type.startsWith('image/')
);

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
  const [imageError, setImageError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [saving, setSaving] = useState(false);
  const [discountForm, setDiscountForm] = useState({ type: 'percent', value: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

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
        stockQuantity: getProductStockQuantity(product)?.toString() || '',
        originalPrice: product.originalPrice?.toString() || '',
        discount: product.discount?.toString() || ''
      });
    } else {
      setEditingProduct(null);
      setFormData(createDefaultProduct());
    }
    setUploadProgress({ current: 0, total: 0, percent: 0 });
    setImageError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (uploadingImages) {
      return;
    }

    setShowModal(false);
    setEditingProduct(null);
    setFormData(createDefaultProduct());
    setUploadProgress({ current: 0, total: 0, percent: 0 });
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

  const isSupportedImageFile = (file) => (
    isImageFile(file) &&
    SUPPORTED_PRODUCT_IMAGE_TYPES.includes(file.type.toLowerCase())
  );

  const handleImageUpload = async (e) => {
    const fileList = e.target?.files;

    if (!fileList || fileList.length === 0 || !fileList[0]) {
      return;
    }

    const selectedFiles = Array.from(fileList);

    if (selectedFiles.length === 0) {
      return;
    }

    const invalidFileObject = selectedFiles.find((file) => !isBrowserFile(file));
    if (invalidFileObject) {
      setImageError('Seçilen dosya okunamadı. Lütfen tekrar deneyin.');
      e.target.value = '';
      return;
    }

    const nonImageFile = selectedFiles.find((file) => !isImageFile(file));
    if (nonImageFile) {
      setImageError('Lütfen sadece görsel dosyası seçin.');
      e.target.value = '';
      return;
    }

    const remainingSlots = MAX_PRODUCT_IMAGES - formData.images.length;
    if (remainingSlots <= 0) {
      setImageError(`En fazla ${MAX_PRODUCT_IMAGES} görsel ekleyebilirsiniz.`);
      e.target.value = '';
      return;
    }

    const unsupportedFile = selectedFiles.find((file) => !isSupportedImageFile(file));
    if (unsupportedFile) {
      setImageError('Sadece PNG veya JPG/JPEG dosyaları yükleyebilirsiniz.');
      e.target.value = '';
      return;
    }

    const oversizedFile = selectedFiles.find((file) => file.size > MAX_PRODUCT_IMAGE_FILE_SIZE_BYTES);
    if (oversizedFile) {
      setImageError(`Her görsel en fazla ${MAX_PRODUCT_IMAGE_FILE_SIZE_MB} MB olabilir.`);
      e.target.value = '';
      return;
    }

    const filesToUpload = selectedFiles.slice(0, remainingSlots);

    if (filesToUpload.length < selectedFiles.length) {
      setImageError(`Sadece ilk ${filesToUpload.length} görsel yüklenecek. Maksimum ${MAX_PRODUCT_IMAGES} görsel destekleniyor.`);
    } else {
      setImageError('');
    }

    setUploadingImages(true);
    setUploadProgress({ current: 0, total: filesToUpload.length, percent: 0 });

    try {
      const uploadedUrls = [];

      for (const [index, file] of filesToUpload.entries()) {
        const uploadedUrl = await uploadProductImage(file);
        uploadedUrls.push(uploadedUrl);

        setUploadProgress({
          current: index + 1,
          total: filesToUpload.length,
          percent: Math.round(((index + 1) / filesToUpload.length) * 100)
        });
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      setImageError(error.message || 'Görseller yüklenirken hata oluştu.');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
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
    const normalizedStockQuantity = Number.parseInt(formData.stockQuantity, 10);

    if (!Number.isInteger(normalizedStockQuantity) || normalizedStockQuantity < 0) {
      setImageError('Stok adedi 0 veya daha büyük bir tam sayı olmalıdır.');
      return;
    }

    const imageValidation = validateProductImageInputs(formData.images);

    if (!imageValidation.isValid) {
      setImageError(imageValidation.message);
      return;
    }

    if (uploadingImages) {
      setImageError('Görsel yükleme tamamlanmadan kaydedemezsiniz.');
      return;
    }

    setSaving(true);
    setImageError('');

    try {
      const productData = {
        ...formData,
        images: imageValidation.images,
        price: parseFloat(formData.price) || 0,
        stockQuantity: normalizedStockQuantity,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        discount: formData.discount ? parseInt(formData.discount, 10) : null
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
  const canUploadMoreImages = formData.images.length < MAX_PRODUCT_IMAGES;

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
                <th>Stok</th>
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
                    {isProductSoldOut(product) ? (
                      <span className="stock-badge sold-out">Tükendi</span>
                    ) : (
                      <span className="stock-badge">
                        {getProductStockQuantity(product) ?? '-'}
                      </span>
                    )}
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
              <button className="admin-modal-close" onClick={handleCloseModal} disabled={uploadingImages}>
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
                  <label>Stok Adedi *</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    required
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
                  <label>Ürün Görselleri</label>
                  <div className="image-upload-area">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="image-file-input"
                      onChange={handleImageUpload}
                    />
                    <div className="image-upload-header">
                      <p className="image-upload-hint">
                        PNG veya JPG seçin. Her görsel en fazla {MAX_PRODUCT_IMAGE_FILE_SIZE_MB} MB olabilir. Görseller ImgBB'ye sırayla yüklenir ve URL'leri otomatik kaydedilir.
                      </p>
                      <button
                        type="button"
                        className="upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!canUploadMoreImages || uploadingImages}
                      >
                        <Upload size={18} />
                        {uploadingImages ? 'Yükleniyor...' : 'Görsel Seç'}
                      </button>
                    </div>

                    <span className="image-limit-note">
                      {formData.images.length} / {MAX_PRODUCT_IMAGES} görsel yüklendi
                    </span>

                    {uploadingImages && uploadProgress.total > 0 && (
                      <div className="upload-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${uploadProgress.percent}%` }}
                          />
                        </div>
                        <span className="progress-text">
                          {uploadProgress.current} / {uploadProgress.total} (%{uploadProgress.percent})
                        </span>
                      </div>
                    )}

                    {formData.images.length > 0 ? (
                      <div className="image-previews">
                        {formData.images.map((url, index) => (
                          <div key={url} className="image-preview-card">
                            <div className="image-preview">
                              <img src={url} alt={`Görsel ${index + 1}`} />
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
                        ))}
                      </div>
                    ) : (
                      <div className="image-empty-state">
                        Görsel eklemek için yukarıdan PNG veya JPG dosyası seçin.
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
                <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={uploadingImages}>
                  İptal
                </button>
                <button type="submit" className="btn-primary" disabled={saving || uploadingImages}>
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
