# Use official Node image
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# Start the development server with polling for Docker compatibility
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
