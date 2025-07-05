FROM node:24-alpine3.21 AS build-env

# Update package manager and install any needed dependencies
RUN apk update && apk upgrade

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for npm install)
COPY package*.json ./

# Install dependencies (will be skipped if node_modules is mounted)
RUN npm install

# Copy the rest of your service code
COPY . .


# Stage 2: Production
FROM node:24-alpine3.21

# Copy only the build artifacts and runtime dependencies
COPY --from=build-env /app/ ./
# COPY --from=build /usr/src/app/dist ./dist # Use this line if you have built files [TypeScript]

# Expose the port and define the command to run the application
EXPOSE 3000
CMD ["node", "orbitdb-service.js"]

