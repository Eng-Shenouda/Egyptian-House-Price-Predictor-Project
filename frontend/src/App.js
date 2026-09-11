import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const dictionary = {
  // --- مناطق مصر ---
  "new cairo": "القاهرة الجديدة",
  "sheikh zayed": "الشيخ زايد",
  "zayed": "الشيخ زايد",
  "6th of october": "6 أكتوبر",
  "october": "6 أكتوبر",
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
  "new capital": "العاصمة الإدارية الجديدة",
  "giza": "الجيزة",
  "hurghada": "الغردقة",
  "ain sokhna": "العين السخنة",
  "zamalek": "الزمالك",
  "dokki": "الدقي",
  "mohandessin": "المهندسين",
  "mansoura": "المنصورة",
  "tanta": "طنطا",
  "asyut": "أسيوط",
  "assiut": "أسيوط",
  "10th of ramadan": "العاشر من رمضان",
  "ismailia": "الإسماعيلية",
  "suez": "السويس",
  "port said": "بورسعيد",
  "fayoum": "الفيوم",
  "minya": "المنيا",
  "el gouna": "الجونة",
  "smouha": "سموحة",
  "miami": "ميامي",
  "montaza": "المنتزه",
  "louran": "لوران",
  "gleem": "جليم",

  // --- أنواع العقارات ---
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
  "administrative office": "مكتب إداري",
  "store": "محل تجاري",
  "building": "مبنى بالكامل",
  "land": "قطعة أرض"
};

const API_BASE_URL = "http://127.0.0.1:5000";

// دالة ذكية تدمج الاسم الأصلي مع الترجمة بالعربي حسب لغة الموقع
const formatDualLabel = (text, targetLang) => {
  if (!text) return text;
  const key = text.toString().trim().toLowerCase();
  const translated = dictionary[key];
  
  if (!translated) {
    return text; // لو مش موجود في القاموس يعرضه زي ما هو
  }

  if (targetLang === 'ar') {
    return `${translated} (${text})`;
  } else {
    return `${text} (${translated})`;
  }
};

const parseArabicNumber = (str) => {
  if (!str) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishStr = str.toString().replace(/[٠-٩]/g, (d) => arabicDigits.indexOf(d));
  return englishStr.replace(/[^0-9]/g, '');
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
  const defaultLocations = [
    "New Cairo", "Sheikh Zayed", "6th of October", "Nasr City", "Maadi",
    "Heliopolis", "Alexandria", "North Coast", "Shorouk", "Madinaty",
    "Rehab", "Zamalek", "Dokki", "Mohandessin", "10th of Ramadan", "Ismailia"
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

  const [typeOpen, setTypeOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const typeRef = useRef(null);
  const locationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeRef.current && !typeRef.current.contains(event.target)) setTypeOpen(false);
      if (locationRef.current && !locationRef.current.contains(event.target)) setLocationOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const content = {
    ar: {
      companyBadge: "🏢 السوق العقاري المصري الرسمي",
      title: "حاسبة العقارات الذكية",
      subtitle: "نظام متطور لتحليل وتوقع أسعار الوحدات السكنية بدقة عالية في مصر",
      locationLabel: "المدينة / المنطقة",
      typeLabel: "نوع العقار",
      sizeLabel: "المساحة (م²)",
      bedsLabel: "الغرف",
      bathsLabel: "الحمامات",
      btnCalculate: "احسب السعر المتوقع الآن",
      btnLoading: "جاري تحليل الأسعار...",
      totalPrice: "السعر الإجمالي التقديري",
      meterPrice: "متوسط سعر المتر",
      currency: "جنيه مصري",
      langBtn: "English 🌐",
      dir: "rtl",
      alertMsg: "برجاء اختيار نوع العقار والمنطقة أولاً للحصول على توقع واقعي ودقيق!"
    },
    en: {
      companyBadge: "🏢 Official Egyptian Real Estate Market",
      title: "Smart Real Estate Calculator",
      subtitle: "Advanced AI-powered system for accurate property price predictions in Egypt",
      locationLabel: "Location / Area",
      typeLabel: "Property Type",
      sizeLabel: "Area (Sqm)",
      bedsLabel: "Bedrooms",
      bathsLabel: "Bathrooms",
      btnCalculate: "Calculate Expected Price",
      btnLoading: "Analyzing Prices...",
      totalPrice: "Estimated Total Price",
      meterPrice: "Price per Sqm",
      currency: "EGP",
      langBtn: "عربي 🌐",
      dir: "ltr",
      alertMsg: "Please select both the property type and location for an accurate prediction!"
    }
  };

  const t = content[lang];

  useEffect(() => {
    fetch(`${API_BASE_URL}/options`)
      .then((res) => res.json())
      .then((data) => {
        const locs = data.locations || data.data?.locations;
        if (locs && locs.length > 0) setLocations(locs);
        const typesList = data.property_types || data.types || data.data?.property_types;
        if (typesList && typesList.length > 0) setTypes(typesList);
      })
      .catch((err) => console.log("Using fallback options"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location || !formData.type) {
      alert(t.alertMsg);
      return;
    }

    setLoading(true);
    try {
      const cleanSize = Number(parseArabicNumber(formData.size)) || 150;
      const cleanBeds = Number(parseArabicNumber(formData.bedrooms)) || 3;
      const cleanBaths = Number(parseArabicNumber(formData.bathrooms)) || 2;

      const payload = {
        location: formData.location,
        type: formData.type,
        bedrooms: cleanBeds,
        bathrooms: cleanBaths,
        size: cleanSize
      };

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok && data.predicted_price) {
        setResult(Math.round(data.predicted_price));
      } else {
        alert(data.message || data.error || 'تعذر جلب التوقع، تأكد من البيانات المدخلة.');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ في الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep = (field, delta) => {
    setFormData((prev) => {
      const cleanNum = Number(parseArabicNumber(prev[field])) || 0;
      const newVal = Math.max(1, cleanNum + delta);
      return { ...prev, [field]: formatNumber(newVal, lang) };
    });
    setResult(null);
  };

  const handleInputChange = (field, rawValue) => {
    setFormData((prev) => ({ ...prev, [field]: rawValue }));
    setResult(null);
  };

  const handleSelection = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setResult(null);
  };

  const numericSize = Number(parseArabicNumber(formData.size)) || 1;
  const meterPrice = result ? Math.round(result / numericSize) : 0;

  return (
    <div className="app-container" dir={t.dir}>
      <button className="lang-toggle" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
        {t.langBtn}
      </button>

      <div className="web-glass-card">
        <div className="header">
          <div className="company-badge">{t.companyBadge}</div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            
            {/* نوع العقار */}
            <div className="input-group" ref={typeRef}>
              <label>🏢 {t.typeLabel}</label>
              <div className="custom-select-wrapper">
                <div
                  className={`custom-select-trigger ${typeOpen ? 'open' : ''}`}
                  onClick={() => { setTypeOpen(!typeOpen); setLocationOpen(false); }}
                >
                  <span>
                    {formData.type ? formatDualLabel(formData.type, lang) : (lang === 'ar' ? 'اختر نوع العقار...' : 'Select property type...')}
                  </span>
                  <span className="arrow">▼</span>
                </div>
                
                {typeOpen && (
                  <div className="custom-options">
                    {Array.isArray(types) && types.map((typ, idx) => (
                      <div
                        key={idx}
                        className={`custom-option ${formData.type === typ ? 'selected' : ''}`}
                        onClick={() => { handleSelection('type', typ); setTypeOpen(false); }}
                      >
                        {formatDualLabel(typ, lang)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* المدينة / المنطقة */}
            <div className="input-group" ref={locationRef}>
              <label>📍 {t.locationLabel}</label>
              <div className="custom-select-wrapper">
                <div
                  className={`custom-select-trigger ${locationOpen ? 'open' : ''}`}
                  onClick={() => { setLocationOpen(!locationOpen); setTypeOpen(false); }}
                >
                  <span>
                    {formData.location ? formatDualLabel(formData.location, lang) : (lang === 'ar' ? 'اختر المنطقة...' : 'Select location...')}
                  </span>
                  <span className="arrow">▼</span>
                </div>
                
                {locationOpen && (
                  <div className="custom-options">
                    {Array.isArray(locations) && locations.map((loc, idx) => (
                      <div
                        key={idx}
                        className={`custom-option ${formData.location === loc ? 'selected' : ''}`}
                        onClick={() => { handleSelection('location', loc); setLocationOpen(false); }}
                      >
                        {formatDualLabel(loc, lang)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* المساحة */}
            <div className="input-group">
              <label>📐 {t.sizeLabel}</label>
              <div className="stepper-input">
                <button type="button" onClick={() => handleStep('size', -5)}>−</button>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  required
                />
                <button type="button" onClick={() => handleStep('size', 5)}>+</button>
              </div>
            </div>

            {/* الغرف */}
            <div className="input-group">
              <label>🛏️ {t.bedsLabel}</label>
              <div className="stepper-input">
                <button type="button" onClick={() => handleStep('bedrooms', -1)}>−</button>
                <input
                  type="text"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  required
                />
                <button type="button" onClick={() => handleStep('bedrooms', 1)}>+</button>
              </div>
            </div>

            {/* الحمامات */}
            <div className="input-group">
              <label>🛁 {t.bathsLabel}</label>
              <div className="stepper-input">
                <button type="button" onClick={() => handleStep('bathrooms', -1)}>−</button>
                <input
                  type="text"
                  value={formData.bathrooms}
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
          <div className="price-box-web">
            <div className="price-main">
              <span>{t.totalPrice}</span>
              <h2>
                {formatNumber(result, lang)} <small>{t.currency}</small>
              </h2>
            </div>
            <div className="price-divider"></div>
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