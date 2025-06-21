FROM node:18-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install AWS CLI version 2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --production

# Copy source files and build
COPY . .
RUN npm run build

# Expose port for NestJS
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start:prod"]