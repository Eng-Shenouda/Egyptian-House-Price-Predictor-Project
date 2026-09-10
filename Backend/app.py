from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
app.json.ensure_ascii = False  # <--- السطر السحري ده بيخلي العربي يرجع كحروف عربية واضحة
CORS(app)

model = joblib.load('model.pkl')
df = pd.read_csv('egypt_real_estate_listings.csv')

locations = sorted(df['location'].unique().tolist())
types = sorted(df['type'].unique().tolist())

# إضافة الـ Route المطلوب بواسطة React لجلب خيارات الـ Dropdown
@app.route('/options', methods=['GET'])
def get_options():
    return jsonify({
        'status': 'success',
        'locations': locations,
        'types': types,
        'property_types': types  # ضفنا دي عشان تتطابق مع أي كود في الفرونت إند
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True) or {}
        
        loc = data.get('location') or locations[0]
        prop_type = data.get('type') or types[0]
        bedrooms = int(data.get('bedrooms', 3))
        bathrooms = int(data.get('bathrooms', 2))
        size = int(data.get('size', 150))

        print(f"📥 Received: Location={loc}, Type={prop_type}, Beds={bedrooms}, Baths={bathrooms}, Size={size}")

        input_data = pd.DataFrame([{
            'location': loc,
            'type': prop_type,
            'bedrooms': bedrooms,
            'bathrooms': bathrooms,
            'size': size
        }])

        predicted = model.predict(input_data)[0]
        
        # حماية في حالة إخراج قيم غير منطقية
        if predicted <= 0:
            predicted = (size * 20000) + (bedrooms * 300000) + (bathrooms * 150000)

        price = round(float(predicted))

        return jsonify({
            'status': 'success',
            'predicted_price': price,
            'formatted_price': f"{price:,} EGP"
        })

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({'status': 'error', 'message': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)