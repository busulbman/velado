import { useState, useEffect } from 'react';
import { Save, Truck, DollarSign, Building2 } from 'lucide-react';
import { getSettings, updateSettings } from '../firebase/admin.js';
import AdminLayout from './components/AdminLayout.js';
import './AdminSettings.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    freeShippingLimit: 1000,
    shippingCost: 49,
    shippingCarrier: 'Yurtiçi Kargo'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ayarlar kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
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
      <div className="admin-settings">
        <div className="settings-header">
          <h1>Ayarlar</h1>
          <p>Mağaza genel ayarları</p>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon">
                <Truck size={20} />
              </div>
              <div>
                <h2>Kargo Ayarları</h2>
                <p>Kargo ücreti ve ücretsiz kargo limiti</p>
              </div>
            </div>

            <div className="settings-grid">
              <div className="form-group">
                <label>
                  <DollarSign size={16} />
                  Ücretsiz Kargo Limiti (TL)
                </label>
                <input
                  type="number"
                  name="freeShippingLimit"
                  value={settings.freeShippingLimit}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                />
                <span className="form-help">
                  Bu tutarın üzerindeki siparişlerde kargo ücretsiz olur.
                </span>
              </div>

              <div className="form-group">
                <label>
                  <DollarSign size={16} />
                  Kargo Ücreti (TL)
                </label>
                <input
                  type="number"
                  name="shippingCost"
                  value={settings.shippingCost}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                />
                <span className="form-help">
                  Limitin altındaki siparişlere uygulanacak kargo ücreti.
                </span>
              </div>

              <div className="form-group full">
                <label>
                  <Building2 size={16} />
                  Kargo Firması
                </label>
                <input
                  type="text"
                  name="shippingCarrier"
                  value={settings.shippingCarrier}
                  onChange={handleInputChange}
                  placeholder="örn: Yurtiçi Kargo"
                />
                <span className="form-help">
                  Sipariş onaylarında gösterilecek kargo firması adı.
                </span>
              </div>
            </div>
          </div>

          <div className="settings-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              <Save size={18} />
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
            {saved && (
              <span className="save-success">Ayarlar kaydedildi!</span>
            )}
          </div>
        </form>

        <div className="settings-info">
          <h3>Bilgi</h3>
          <ul>
            <li>Ücretsiz kargo limiti değişikliği anında tüm siparişlere yansır.</li>
            <li>Kargo firması değişikliği yeni siparişlerden itibaren geçerli olur.</li>
            <li>Aktif kampanyalar bu ayarlardan bağımsız çalışır.</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
