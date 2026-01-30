# Dockerfile pour le développement Vite/React

# 1️⃣ Image Node légère
FROM node:20-alpine

# 2️⃣ Définir le répertoire de travail
WORKDIR /app

# 3️⃣ Copier package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# 4️⃣ Installer les dépendances
RUN npm install

# 5️⃣ Copier le reste du projet
COPY . .

# 6️⃣ Exposer le port du serveur Vite
EXPOSE 5173

# 7️⃣ Lancer Vite en mode développement
CMD ["npm", "run", "dev"]
