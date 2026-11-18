import os
import io
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import keras
import numpy as np
from PIL import Image

app = FastAPI(title="Corn Leaf Disease Detection API")

# Allow cross-origin requests from React frontend and Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Robust Dense class to handle any legacy quantization configs
class FixedDense(keras.layers.Dense):
    def __init__(self, *args, **kwargs):
        kwargs.pop("quantization_config", None)
        super().__init__(*args, **kwargs)

# Locate model file relative to this script directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "Pro_Corn_Model.h5")

print(f"🧠 Loading AI Model from {MODEL_PATH}...")
try:
    model = tf.keras.models.load_model(MODEL_PATH)
except Exception as err:
    print(f"Standard load failed ({err}), falling back to FixedDense...")
    model = tf.keras.models.load_model(
        MODEL_PATH, 
        custom_objects={"Dense": FixedDense, "FixedDense": FixedDense}
    )

print("✅ AI Model loaded successfully!")

# Exact classes used during training
CLASSES = ['Common_Rust', 'Gray_Leaf', 'Healthy', 'Not_Corn']

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Corn Disease Detection API is running successfully!",
        "classes": CLASSES
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    try:
        # 1. Read the uploaded image file
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # 2. Resize and preprocess the image (128x128)
        img = img.resize((128, 128), Image.Resampling.BILINEAR)
        img_array = np.array(img, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # 3. Predict the disease using the AI model
        predictions = model.predict(img_array, verbose=0)
        class_index = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][class_index])
        
        # Breakdown of all class probabilities
        breakdown = {
            CLASSES[i]: round(float(predictions[0][i]) * 100, 2)
            for i in range(len(CLASSES))
        }
        
        # 4. Return the result as a JSON response
        return {
            "disease": CLASSES[class_index],
            "confidence": round(confidence * 100, 2),
            "predictions": breakdown
        }
        
    except Exception as e:
        return {"error": str(e)}
