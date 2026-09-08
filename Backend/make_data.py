import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression

np.random.seed(42)
num_samples = 300000

# 50 منطقة في مصر مع أسعار المتر التقديرية (2026)
location_data = {
    # القاهرة الكبرى والشرق
    'New Cairo - Fifth Settlement (التجمع الخامس)': 45000,
    'New Cairo - First Settlement (التجمع الأول)': 38000,
    'New Cairo - Narges & Choueifat (النرجس والشويفات)': 42000,
    'New Cairo - Lotus & Beit El Watan (اللوتس وبيت الوطن)': 32000,
    'Administrative Capital - R7 & R8 (العاصمة الإدارية R7/R8)': 35000,
    'Administrative Capital - CBD (حي المال والأعمال)': 50000,
    'Madinaty (مدينتي)': 36000,
    'Rehab City (الرحاب)': 38000,
    'Mostakbal City (مدينة المستقبل)': 32000,
    'Shorouk City (الشروق)': 24000,
    'Badr City (بدر)': 15000,
    'Obour City (العبور)': 22000,
    '10th of Ramadan (10 رمضان)': 16000,
    'Nasr City - Abbas El Akkad (مدينة نصر - عباس العقاد)': 28000,
    'Nasr City - Zahraa El Maadi / Zahraa Nasr (الزهراء)': 22000,
    'Heliopolis - Korba (مصر الجديدة - الكوربة)': 45000,
    'Heliopolis - Hijaz & Almaza (الحجاز وألماظة)': 32000,
    'Maadi - Degla & Sarayat (المعادي - دجلة والسرايات)': 42000,
    'Maadi - Corniche (كورنيش المعادي)': 35000,
    'Mokattam - Uptown (المقطم - أبتون)': 30000,
    'Zamalek (الزمالك)': 70000,
    'Garden City (جاردن سيتي)': 60000,

    # الجيزة والغرب
    'Sheikh Zayed - Central (الشيخ زايد Central)': 50000,
    'Sheikh Zayed - Dahshur Link (وصلة دهشور)': 42000,
    'New Zayed (زايد الجديدة)': 38000,
    '6th of October - Northern Expansions (التوسع الشمالي)': 26000,
    '6th of October - Southern Investments (الأحياء والمستثمرين)': 28000,
    'Dokki (الدقي)': 40000,
    'Mohandessin (المهندسين)': 42000,
    'Haram & Faisal (الهرم وفيلس):': 18000,
    'Hadayek El Ahram (حدائق الأهرام)': 20000,
    'Hadayek October (حدائق أكتوبر)': 19000,

    # الساحل والمدن الساحلية
    'North Coast - Ras El Hekma (راس الحكمة)': 85000,
    'North Coast - Sidi Abd El Rahman (سيدي عبد الرحمن)': 75000,
    'North Coast - New Alamein (العلمين الجديدة)': 65000,
    'North Coast - Marina (مارينا)': 45000,
    'Ain Sokhna (العين السخنة)': 40000,
    'El Gouna (الجونة)': 80000,
    'Hurghada - Sahl Hasheesh (سهل حشيش)': 45000,
    'Hurghada - Makadi Bay (مكادي باي)': 32000,
    'Sharm El Sheikh - Naama Bay (خليج نعمة)': 38000,
    'Dahab (دهب)': 30000,

    # الإسكندرية والمدن الإقليمية
    'Alexandria - Smouha (سموحة)': 30000,
    'Alexandria - Gleem & Kafr Abdo (جليم وكفر عبده)': 40000,
    'Alexandria - Miami & Mandara (ميامي والمندرة)': 22000,
    'Mansoura - Toriel & Nile (جامعة توريل والكورنيش)': 28000,
    'Tanta (طنطا)': 24000,
    'Ismailia (الإسماعيلية)': 18000,
    'Port Said (بورسعيد)': 26000,
    'Asyut (أسيوط)': 22000
}

# 15 نوع عقار مختلف
type_multipliers = {
    'Apartment (شقة سكنية)': 1.0,
    'Studio (ستوديو)': 0.95,
    'Duplex (دوبلكس)': 1.30,
    'Penthouse (بنتهاوس)': 1.40,
    'Townhouse (تاون هاوس)': 1.55,
    'Twin House (توين هاوس)': 1.75,
    'Standalone Villa (فيلا مستقلة)': 2.20,
    'Chalet (شاليه ساحلي)': 1.30,
    'Administrative Office (مكتب إداري)': 1.45,
    'Commercial Shop (محل تجاري)': 2.50,
    'Medical Clinic (عيادة طبية)': 1.60,
    'Serviced Apartment (شقة فندقية)': 1.50,
    'Roof Unit (رووف ملحق)': 0.85,
    'I-Villa (آي فيلا)': 1.35,
    'Palace / Mansion (قصر / فيلا فاخرة)': 3.00
}

locations = list(location_data.keys())
types = list(type_multipliers.keys())

chosen_locs = np.random.choice(locations, size=num_samples)
chosen_types = np.random.choice(types, size=num_samples)

beds = np.random.randint(1, 8, size=num_samples)
baths = np.random.randint(1, 6, size=num_samples)
sizes = np.random.randint(30, 800, size=num_samples)

prices = []
for l, t, b, ba, s in zip(chosen_locs, chosen_types, beds, baths, sizes):
    base_meter_price = location_data[l]
    multiplier = type_multipliers[t]
    
    total = (s * base_meter_price * multiplier) + (b * 450000 * multiplier) + (ba * 250000 * multiplier)
    noise = np.random.normal(1.0, 0.04)
    final_price = int(round(total * noise, -4))
    prices.append(max(final_price, 250000))

df = pd.DataFrame({
    'location': chosen_locs,
    'type': chosen_types,
    'bedrooms': beds,
    'bathrooms': baths,
    'size': sizes,
    'price': prices
})

df.to_csv('egypt_real_estate_listings.csv', index=False)

X = df[['location', 'type', 'bedrooms', 'bathrooms', 'size']]
y = df['price']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), ['bedrooms', 'bathrooms', 'size']),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), ['location', 'type'])
    ]
)

model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', LinearRegression())
])

model.fit(X, y)
joblib.dump(model, 'model.pkl')

print(f"🚀 SUCCESS: Model trained on {num_samples:,} records with {len(locations)} locations and {len(types)} property types!")