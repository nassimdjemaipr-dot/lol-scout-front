# Dockerfile multi-stage pour le front LoL Scout.
# Stage 1 : build de la SPA React avec Node.
# Stage 2 : serveur Nginx alpine servant les fichiers statiques du dist/.
#
# Pourquoi multi-stage :
#  - L'image finale ne contient que Nginx + les fichiers statiques (93.4 Mo mesures)
#  - Node et node_modules restent dans le stage builder et sont jetes
#  - Aucun code source, dependances de build ou credentials dans l'image de prod

# ============================================================================
# Stage 1 : builder
# ============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# ARG buildtime : URL de l'API back, injectee dans le bundle Vite
# Override via `docker compose build --build-arg VITE_API_URL=https://prod.example.com/api`
ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL

# Install des dependances (npm ci est plus strict que npm install en CI)
COPY package.json package-lock.json ./
RUN npm ci

# Copie du code source et build
COPY . .
RUN npm run build


# ============================================================================
# Stage 2 : runtime Nginx
# ============================================================================
FROM nginx:alpine AS runtime

# Config Nginx custom : gere le routing SPA + gzip + cache assets
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.conf /etc/nginx/security-headers.conf

# Copie du build statique depuis le stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Nginx en foreground (necessaire pour Docker)
CMD ["nginx", "-g", "daemon off;"]