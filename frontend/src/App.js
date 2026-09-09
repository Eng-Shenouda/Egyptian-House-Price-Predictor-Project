import React, { useState, useEffect } from 'react';
import './App.css';

const dictionary = {
  "asyut": "أسيوط",
  "assiut": "أسيوط",
  "6th of october": "6 أكتوبر",
  "october": "6 أكتوبر",
  "new cairo": "القاهرة الجديدة",
  "sheikh zayed": "الشيخ زايد",
  "zayed": "الشيخ زايد",
  "nasr city": "مدينة نصر",
  "maadi": "المعادي",
  "heliopolis": "مصر الجديدة",
  "alexandria": "الإسكندرية",
  "north coast": "الساحل الشمالي",
  "shorouk": "الشروق",
  "madinaty": "مدينتي",
  "rehab": "الرحاب",
  "badr city": "مدينة بدر",
  "obour": "العبور",
  "administrative capital": "العاصمة الإدارية",
  "giza": "الجيزة",
  "hurghada": "الغردقة",
  "ain sokhna": "العين السخنة",
  "zamalek": "الزمالك",
  "dokki": "الدقي",
  "mohandessin": "المهندسين",
  "mansoura": "المنصورة",
  "tanta": "طنطا",
  "apartment": "شقة سكنية",
  "villa": "فيلا مستقلة",
  "duplex": "دوبلكس",
  "townhouse": "تاون هاوس",
  "twin house": "توين هاوس",
  "penthouse": "بنتهاوس",
  "studio": "ستوديو",
  "chalet": "شاليه",
  "clinic": "عيادة",
  "office": "مكتب إداري",
  "store": "محل تجاري",
  "10th of ramadan": "العاشر من رمضان",
  "administrative office": "مكتب إداري"
};

const API_BASE_URL = "https://egyptian-house-price-predictor-project-production.up.railway.app";

const translateText = (text, targetLang) => {
  if (!text) return text;
  if (targetLang === 'en') return text;
  const cleanKey = text.toString().trim().toLowerCase();
  return dictionary[cleanKey] || text;
};

const formatNumber = (num, currentLang) => {
  if (num === null || num === undefined || num === '') return '';
  const locale = currentLang === 'ar' ? 'ar-EG' : 'en-US';
  let formatted = Number(num).toLocaleString(locale);
  if (currentLang === 'ar') {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    formatted = formatted.replace(/\d/g, (d) => arabicDigits[d]);
  }
  return formatted;
};

function App() {
  // وضع قائمة افتراضية جاهزة فوراً لضمان ظهور البيانات على الموبايل
  const defaultLocations = [
    "New Cairo", "Sheikh Zayed", "6th of October", "Nasr City", "Maadi", 
    "Heliopolis", "Alexandria", "North Coast", "Shorouk", "Madinaty", 
    "Rehab", "Zamalek", "Dokki", "Mohandessin", "10th of Ramadan"
  ];

  const defaultTypes = [
    "Apartment", "Villa", "Duplex", "Townhouse", "Twin House", 
    "Penthouse", "Studio", "Chalet", "Clinic", "Administrative Office"
  ];

  const [locations, setLocations] = useState(defaultLocations);
  const [types, setTypes] = useState(defaultTypes);
  const [lang, setLang] = useState('ar');
  
  const [formData, setFormData] = useState({
    location: '',
    type: '',
    bedrooms: 3,
    bathrooms: 2,
    size: 150
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const content = {
    ar: {
      companyName: " 🏢 🇪🇬 حاسبة أسعار العقارات في مصر",
      title: "حاسبة العقارات الذكية",
      subtitle: "توقعات دقيقة لأسعار الوحدات السكنية",
      locationLabel: "المدينة / المنطقة",
      typeLabel: "نوع العقار",
      sizeLabel: "المساحة (م²)",
      bedsLabel: "الغرف",
      bathsLabel: "الحمامات",
      btnCalculate: "احسب السعر المتوقع",
      btnLoading: "جاري الحساب...",
      totalPrice: "السعر الإجمالي التقديري",
      meterPrice: "سعر المتر",
      currency: "جنيه",
      langBtn: "English 🌐",
      dir: "rtl"
    },
    en: {
      companyName: "🏢 🇪🇬 Egyptian House Price Predictor",
      title: "Smart Real Estate Calculator",
      subtitle: "Accurate property price predictions",
      locationLabel: "Location / Area",
      typeLabel: "Property Type",
      sizeLabel: "Area (Sqm)",
      bedsLabel: "Bedrooms",
      bathsLabel: "Bathrooms",
      btnCalculate: "Calculate Price",
      btnLoading: "Calculating...",
      totalPrice: "Estimated Total Price",
      meterPrice: "Price / Sqm",
      currency: "EGP",
      langBtn: "عربي 🌐",
      dir: "ltr"
    }
  };

  const t = content[lang];

  useEffect(() => {
    fetch('https://egyptian-house-price-predictor-project-production.up.railway.app/options')
      .then((res) => res.json())
      .then((data) => {
        const locs = data.locations || data.data?.locations;
        if (locs && locs.length > 0) setLocations(locs);

        const typesList = data.property_types || data.types || data.data?.property_types;
        if (typesList && typesList.length > 0) setTypes(typesList);
      })
      .catch((err) => {
        console.log("Using static fallback data due to mobile network block:", err);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: formData.location,
          type: formData.type,
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
          size: Number(formData.size)
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setResult(data.predicted_price);
      }
    } catch (err) {
      alert('Error fetching prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleStep = (field, delta) => {
    setFormData((prev) => {
      const val = Number(prev[field]) || 0;
      const newVal = Math.max(1, val + delta);
      return { ...prev, [field]: newVal };
    });
  };

  const handleInputChange = (field, rawValue) => {
    const cleanVal = rawValue.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^0-9]/g, '');
    setFormData((prev) => ({ ...prev, [field]: cleanVal }));
  };

  const meterPrice = result ? Math.round(result / (Number(formData.size) || 1)) : 0;

  return (
    <div className="app-container" dir={t.dir}>
      <button className="lang-toggle" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
        {t.langBtn}
      </button>

      <div className="glass-card">
        <div className="header">
          <div className="company-badge">{t.companyName}</div>
          <h1>
            <span className="title-icon">📊</span> 
            <span>{t.title}</span>
          </h1>
          <p>{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* نوع العقار */}
          <div className="input-group">
            <label>🏢 {t.typeLabel}</label>
            <select
              className="form-control"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '15px', 
                fontSize: '16px', 
                borderRadius: '10px', 
                background: '#ffffff', 
                color: '#000000', 
                border: '2px solid #007bff',
                appearance: 'auto',
                WebkitAppearance: 'auto',
                display: 'block',
                zIndex: 9999,
                position: 'relative'
              }}
              required
            >
              <option value="">{lang === 'ar' ? 'اختر نوع العقار...' : 'Select property type...'}</option>
              {Array.isArray(types) && types.map((typ, idx) => (
                <option key={idx} value={typ}>
                  {typeof translateText === 'function' ? translateText(typ, lang) : typ}
                </option>
              ))}
            </select>
          </div>

          {/* المنطقة */}
          <div className="input-group">
            <label>📍 {t.locationLabel || 'المنطقة'}</label>
            <select
              className="form-control"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '15px', 
                fontSize: '16px', 
                borderRadius: '10px', 
                background: '#ffffff', 
                color: '#000000', 
                border: '2px solid #007bff',
                appearance: 'auto',
                WebkitAppearance: 'auto',
                display: 'block',
                zIndex: 9999,
                position: 'relative'
              }}
              required
            >
              <option value="">{lang === 'ar' ? 'اختر المنطقة...' : 'Select location...'}</option>
              {Array.isArray(locations) && locations.map((loc, idx) => (
                <option key={idx} value={loc}>
                  {typeof translateText === 'function' ? translateText(loc, lang) : loc}
                </option>
              ))}
            </select>
          </div>

          <div className="grid-3">
            <div className="input-group">
              <label>📐 {t.sizeLabel}</label>
              <div className="stepper-input">
                <button type="button" onClick={() => handleStep('size', -5)}>−</button>
                <input
                  type="text"
                  value={formatNumber(formData.size, lang)}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  required
                />
                <button type="button" onClick={() => handleStep('size', 5)}>+</button>
              </div>
            </div>

            <div className="input-group">
              <label>🛏️ {t.bedsLabel}</label>
              <div className="stepper-input">
                <button type="button" onClick={() => handleStep('bedrooms', -1)}>−</button>
                <input
                  type="text"
                  value={formatNumber(formData.bedrooms, lang)}
                  onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  required
                />
                <button type="button" onClick={() => handleStep('bedrooms', 1)}>+</button>
              </div>
            </div>

            <div className="input-group">
              <label>🛁 {t.bathsLabel}</label>
              <div className="stepper-input">
                <button type="button" onClick={() => handleStep('bathrooms', -1)}>−</button>
                <input
                  type="text"
                  value={formatNumber(formData.bathrooms, lang)}
                  onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                  required
                />
                <button type="button" onClick={() => handleStep('bathrooms', 1)}>+</button>
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? t.btnLoading : `✨ ${t.btnCalculate}`}
          </button>
        </form>

        {result !== null && (
          <div className="price-box">
            <div className="price-main">
              <span>{t.totalPrice}</span>
              <h2>
                {formatNumber(result, lang)} <small>{t.currency}</small>
              </h2>
            </div>
            <div className="price-sub">
              <span>{t.meterPrice}</span>
              <strong>
                {formatNumber(meterPrice, lang)} {t.currency} / {lang === 'ar' ? 'م²' : 'Sqm'}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;