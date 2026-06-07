import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Tags } from 'lucide-react';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../firebase/admin.js';
import AdminLayout from './components/AdminLayout.js';
import './AdminCategories.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', slug: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const slugify = (text) => {
    const charMap = {
      'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i',
      'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u'
    };

    return text
      .split('')
      .map(char => charMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        slug: category.slug || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', slug: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', slug: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'name' && !editingCategory) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        slug: formData.slug || slugify(formData.name)
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await createCategory(categoryData);
      }

      await fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Kategori kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (category) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCategory(deletingCategory.id);
      await fetchCategories();
      setShowDeleteModal(false);
      setDeletingCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

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
      <div className="admin-categories">
        <div className="categories-header">
          <div className="categories-header-left">
            <h1>Kategoriler</h1>
            <span className="categories-count">{categories.length} kategori</span>
          </div>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Yeni Kategori
          </button>
        </div>

        <div className="categories-grid">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.id} className="category-card">
                <div className="category-card-icon">
                  <Tags size={24} />
                </div>
                <div className="category-card-info">
                  <h3>{category.name}</h3>
                  {category.description && (
                    <p>{category.description}</p>
                  )}
                  <span className="category-slug">/{category.slug}</span>
                </div>
                <div className="category-card-actions">
                  <button
                    className="action-btn"
                    onClick={() => handleOpenModal(category)}
                    title="Düzenle"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="action-btn action-btn-danger"
                    onClick={() => handleDeleteClick(category)}
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state full">
              <Tags size={48} />
              <p>Henüz kategori bulunmuyor.</p>
              <button className="btn-primary" onClick={() => handleOpenModal()}>
                <Plus size={18} />
                İlk Kategoriyi Ekle
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal admin-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}</h2>
              <button className="admin-modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-body">
              <div className="form-group">
                <label>Kategori Adı *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="örn: T-Shirt"
                />
              </div>

              <div className="form-group">
                <label>Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="otomatik oluşturulur"
                />
              </div>

              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Kategori açıklaması (isteğe bağlı)"
                />
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
              <h2>Kategori Sil</h2>
              <button className="admin-modal-close" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p className="confirm-text">
                <strong>{deletingCategory?.name}</strong> kategorisini silmek istediğinize emin misiniz?
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
    </AdminLayout>
  );
};

export default AdminCategories;
