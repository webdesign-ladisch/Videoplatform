FROM node:20-bullseye AS deps
WORKDIR /app
COPY package.json tsconfig.json vite.config.ts ./
RUN npm install
COPY index.html ./index.html
COPY public ./public
COPY src ./src
RUN npm run build

FROM node:20-bullseye
WORKDIR /app
RUN npm install -g serve
COPY --from=deps /app/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
