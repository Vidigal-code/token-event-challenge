FROM node:20-slim
# Install required tools
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
# Set workdir
WORKDIR /app
# Copy project files
COPY . .
# Copy and make entrypoint script executable
RUN chmod +x ./entrypoint.sh
# Install Node.js dependencies
RUN npm install --force
EXPOSE 3001
# Start via entrypoint
CMD ["./entrypoint.sh"]