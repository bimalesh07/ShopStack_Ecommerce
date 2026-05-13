FROM python:3.13-slim

# 1. Prevent Python from writing .pyc files and enable live logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 2. Set the folder where our code will live
WORKDIR /app

# 3. Install system tools needed for Database and GCC
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# 4. Create and use a Virtual Environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 5. Copy requirements first to speed up future builds
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 6. Copy all project files into the container
COPY . .

# 7. Set dummy variables so the build doesn't crash
ENV DATABASE_URL=sqlite:///db.sqlite3
ENV SECRET_KEY=dummy-key-for-build
ENV DEBUG=False

# 8. Create static folders and collect files (Only Once)
RUN mkdir -p /app/static /app/staticfiles
RUN python manage.py collectstatic --noinput --no-post-process

# 9. Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# 10. Start the application using the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]


