FROM node:20-slim

RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    git \
    bash \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws

WORKDIR /app

COPY . .

RUN chmod +x entrypoint.sh

RUN npm install --force

EXPOSE 3001

ENTRYPOINT ["./entrypoint.sh"]

