# 🌽 AI-Powered Corn Leaf Disease Detection Web Platform

An enterprise-grade web application built using the MERN stack and a Deep Learning CNN model to perform real-time image classification and diagnostics for corn leaf diseases.

## 🚀 Project Overview
Corn crops are highly susceptible to destructive pathogens like **Common Rust** and **Gray Leaf Spot**, which can devastate seasonal yields. This project provides a seamless web interface for agricultural communities to upload an image of a corn leaf and receive an instant, AI-driven diagnostic report along with confidence metrics.

## 🛠️ Technology Stack
* **Frontend (Client UI):** React.js, Tailwind CSS (Vite)
* **Backend API:** Node.js, Express.js
* **Database Layer:** MongoDB (Atlas)
* **Machine Learning Microservice:** Python, TensorFlow, Keras, FastAPI
* **Version Control:** GitHub

## 📂 Repository Structure
The project follows a modern decoupled architecture:

```text
corn_disease_v1/
├── frontend/       # React.js interactive web application
├── backend/        # Node.js & Express.js REST API and Database Routing
└── ml_service/     # Python FastAPI service hosting the .h5 CNN model
