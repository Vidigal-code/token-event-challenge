FROM node:20-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Make entrypoint script executable
RUN chmod +x ./entrypoint.sh

# Install npm dependencies
RUN npm install --force

# Expose port 3001
EXPOSE 3001

# Run entrypoint script
CMD ["./entrypoint.sh"]