FROM node:20-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Metro bundler port
EXPOSE 8081

# Run Expo start in LAN host mode to allow local network connections
CMD ["npx", "expo", "start", "--host", "lan"]
