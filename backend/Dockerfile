# Use a lightweight Python 3.11 image
FROM python:3.11-slim

# Set the working directory to the project root first
WORKDIR /app

# Install system dependencies required for ML packages and PostgreSQL
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*


# First, install the CPU-only version of PyTorch (required in the HF encoder packages in requirements.txt)
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Copy requirements and install them
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port Hugging Face expects
EXPOSE 7860


# "cd" into the specific directory where main.py expects to be run from
WORKDIR /app/workout_diet_planner

# Command to run the FastAPI application just like your successful Command 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]