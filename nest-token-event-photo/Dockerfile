FROM node:18

WORKDIR /app

# Copy package files and install dependencies first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# The command will be run when the container starts.
# 'nest start --watch' is perfect for development.
CMD ["npm", "run", "start:dev"]