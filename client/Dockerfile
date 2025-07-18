# Multi-stage build pour le client React
# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY eslint.config.js ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Build de l'application
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build 
#|| (echo "Build failed - checking vite.config.ts..." && cat vite.config.ts && exit 1)

# Stage 2: Serveur de production avec nginx
FROM nginx:alpine

# Copier les fichiers buildés
COPY --from=build /app/dist /usr/share/nginx/html

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Exposer le port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
