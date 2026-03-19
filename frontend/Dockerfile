FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json package-lock.json ./

RUN npm ci

COPY . .
ARG VITE_BACKEND_URL
ARG WEB_CLIENT_ID_GOOGLE

ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV WEB_CLIENT_ID_GOOGLE=${WEB_CLIENT_ID_GOOGLE}

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
