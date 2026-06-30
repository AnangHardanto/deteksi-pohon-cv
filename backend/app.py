from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from PIL import Image
import numpy as np
import io

app = Flask(__name__)
# Mengizinkan frontend (React) untuk mengakses API ini
CORS(app)

# Load model yang sudah di-training
# Pastikan nama file sesuai dengan yang kamu unduh
model = tf.keras.models.load_model('model_deteksi_pohon.keras')

# Daftar kelas. PENTING: Urutannya harus sama dengan output class_names di Colab!
# Biasanya diurutkan sesuai abjad oleh fungsi image_dataset_from_directory
class_names = ['Bamboo', 'Banana', 'Guava', 'Jack Fruit', 'Mango', 'Palm']

def preprocess_image(image, target_size):
    # Pastikan gambar memiliki format RGB
    if image.mode != "RGB":
        image = image.convert("RGB")
    # Ubah ukuran sesuai input model (224x224)
    image = image.resize(target_size)
    img_array = tf.keras.utils.img_to_array(image)
    # Tambahkan dimensi batch (menjadi 1, 224, 224, 3)
    img_array = tf.expand_dims(img_array, 0)
    return img_array

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'Tidak ada file gambar yang diunggah'}), 400
    
    try:
        file = request.files['file']
        image = Image.open(io.BytesIO(file.read()))
        processed_image = preprocess_image(image, target_size=(224, 224))
        
        # Lakukan prediksi
        predictions = model.predict(processed_image)
        # Karena di Colab kita sudah pakai Softmax di layer terakhir, nilai prediction sudah berupa probabilitas
        predicted_class = class_names[np.argmax(predictions[0])]
        confidence = 100 * np.max(predictions[0])
        
        return jsonify({
            'prediksi': predicted_class,
            'akurasi': round(float(confidence), 2)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)