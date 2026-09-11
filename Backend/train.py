import pandas as pd
import numpy as np
import re
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor
import joblib

print("1. جاري قراءة ملف الـ CSV...")
df = pd.read_csv('egypt_real_estate_listings.csv')
print("✅ تم قراءة الملف بنجاح، عدد الصفوف:", len(df))

# دوال تنظيف آمنة لأي نص مختلط في الأرقام
def clean_numeric(val):
    if pd.isna(val):
        return np.nan
    val_str = str(val)
    numbers = re.findall(r'\d+\.?\d*', val_str)
    if numbers:
        return float(numbers[0])
    return 0.0

# تطبيق التنظيف على الأعمدة الرقمية لضمان عدم حدوث أي خطأ نصوص
df['clean_size'] = df['size'].apply(clean_numeric)
df['clean_price'] = df['price'].apply(clean_numeric)
df['clean_bathrooms'] = df['bathrooms'].apply(clean_numeric)

# تجهيز الأعمدة بعد التنظيف
X = df[['location', 'type', 'bedrooms', 'clean_bathrooms', 'clean_size']]
y = df['clean_price']

# التخلص من أي قيم فارغة ناتجة عن التنظيف
data_model = pd.concat([X, y], axis=1).dropna()
X = data_model[['location', 'type', 'bedrooms', 'clean_bathrooms', 'clean_size']]
y = data_model['clean_price']

categorical_features = ['location', 'type', 'bedrooms']
numerical_features = ['clean_bathrooms', 'clean_size']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])

model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(random_state=42))
])

print("2. جاري تدريب الموديل على البيانات النظيفة...")
model.fit(X, y)
print("✅ تم التدريب بنجاح!")

print("3. جاري حفظ الموديل...")
joblib.dump(model, 'model.pkl')
print("🎉 تم حفظ الموديل في model.pkl بنجاح تام!")