# Use Python 3.9 slim image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install Node.js and npm for building React app
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy frontend package files
COPY frontend/package*.json ./frontend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci

# Copy all project files
WORKDIR /app
COPY . .

# Build React app
WORKDIR /app/frontend
RUN npm run build

# Go back to app root
WORKDIR /app

# Expose port 7860 (Hugging Face Spaces default)
EXPOSE 7860

# Set environment variables
ENV FLASK_APP=backend/app.py
ENV PORT=7860

# Run the Flask application
CMD ["python", "backend/app.py"]