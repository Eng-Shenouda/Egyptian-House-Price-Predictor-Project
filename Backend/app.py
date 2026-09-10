from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
app.json.ensure_ascii = False  # السطر المسؤول عن إظهار الحروف العربية بوضوح
CORS(app)

# 1. تحميل موديلك الجديد حصرياً (تأكد من وضع اسم ملف الموديل الجديد هنا بدقة)
MODEL_FILE = 'my_best_model.pkl'  # استبدل هذا بالاسم الفعلي للملف لديك

try:
  model = joblib.load(MODEL_FILE)
  print(f'✅ تم تحميل موديلك الجديد ({MODEL_FILE}) بنجاح!')
except Exception as e:
  print(f'❌ خطأ في تحميل الموديل: {e}')
  model = None

# 2. القوائم المتاحة للمناطق وأنواع العقارات (نفس الموجودة في الـ Frontend لتجنب الاعتماد على CSV)
locations = [
    'New Cairo',
    'Sheikh Zayed',
    '6th of October',
    'Nasr City',
    'Maadi',
    'Heliopolis',
    'Alexandria',
    'North Coast',
    'Shorouk',
    'Madinaty',
    'Rehab',
    'Zamalek',
    'Dokki',
    'Mohandessin',
    '10th of Ramadan',
]

types = [
    'Apartment',
    'Villa',
    'Duplex',
    'Townhouse',
    'Twin House',
    'Penthouse',
    'Studio',
    'Chalet',
    'Clinic',
    'Administrative Office',
]


# مسار جلب خيارات القوائم المنسدلة للـ React
@app.route('/options', methods=['GET'])
def get_options():
  return jsonify({
      'status': 'success',
      'locations': locations,
      'types': types,
      'property_types': types,
  })


# مسار التنبؤ بالأسعار
@app.route('/predict', methods=['POST'])
def predict():
  if model is None:
    return (
        jsonify({
            'status': 'error',
            'message': 'الموديل غير محمل على الخادم حالياً',
        }),
        500,
    )

  try:
    data = request.get_json(force=True) or {}

    loc = data.get('location') or locations[0]
    prop_type = data.get('type') or types[0]
    bedrooms = int(data.get('bedrooms', 3))
    bathrooms = int(data.get('bathrooms', 2))
    size = int(data.get('size', 150))

    print(
        f'📥 Received: Location={loc}, Type={prop_type}, Beds={bedrooms},'
        ' Baths={bathrooms}, Size={size}'
    )

    # تجهيز المدخلات بنفس أسماء الأعمدة المتوقعة من الموديل
    input_data = pd.DataFrame([{
        'location': loc,
        'type': prop_type,
        'bedrooms': bedrooms,
        'bathrooms': bathrooms,
        'size': size,
    }])

    # التنبؤ باستخدام موديلك الجديد حصرياً
    predicted = model.predict(input_data)[0]

    # حماية ضد القيم السالبة أو غير المنطقية
    if predicted <= 0:
      predicted = (size * 25000) + (bedrooms * 350000) + (bathrooms * 150000)

    price = round(float(predicted))

    return jsonify({
        'status': 'success',
        'predicted_price': price,
        'formatted_price': f'{price:,} EGP',
    })

  except Exception as e:
    print('❌ Error:', e)
    return jsonify({'status': 'error', 'message': str(e)}), 400


if __name__ == '__main__':
  app.run(port=5000, debug=True)