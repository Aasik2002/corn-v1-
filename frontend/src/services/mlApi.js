import axios from 'axios';

// Default Python FastAPI microservice URL
const ML_BASE_URL = import.meta.env.VITE_ML_URL || 'http://localhost:5000';

const mlApi = axios.create({
  baseURL: ML_BASE_URL,
});

export const mlService = {
  predictLeaf: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Calls FastAPI /predict
    const response = await mlApi.post('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default mlApi;
