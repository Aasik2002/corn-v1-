from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = FastAPI()

# Allow cross-origin requests from React frontend and Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🧠 Loading AI Model...")
# Load the trained model
model = tf.keras.models.load_model("Pro_Corn_Model.h5")

# Exact classes used during training
CLASSES = ['Common_Rust', 'Gray_Leaf', 'Healthy', 'Not_Corn']

@app.get("/")
def read_root():
    return {"message": "Corn Disease Detection API is running successfully!"}

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    try:
        # 1. Read the uploaded image file
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # 2. Resize and preprocess the image (128x128)
        img = img.resize((128, 128), Image.Resampling.BILINEAR)
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # 3. Predict the disease using the AI model
        predictions = model.predict(img_array)
        class_index = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]))
        
        # 4. Return the result as a JSON response
        return {
            "disease": CLASSES[class_index],
            "confidence": round(confidence * 100, 2)
        }
        
    except Exception as e:
        return {"error": str(e)}