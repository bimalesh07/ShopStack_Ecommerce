FROM python:3.13-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory to /app
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Create a virtual environment outside of /app to prevent volume overwrite issues
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies first (for caching)
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 1Copy the rest of the application code
COPY . .

#2. add Dummy variables for local development if needed 
ENV DATABASE_URL=sqlite:///db.sqlite3
ENV SECRET_KEY=dummy-key-for-build
ENV DEBUG=False
RUN python manage.py collectstatic --noinput

# 3 add this line for production deployment
# Static files collect for (Admin CSS/JS )

# collectstatic command 
RUN python manage.py collectstatic --noinput

# 4 entrypoint is executable (using absolute path for safety)
RUN chmod +x /app/entrypoint.sh

#5 Use absolute path for entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]