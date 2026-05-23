FROM node:22-alpine AS build

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./

RUN npm ci

COPY frontend/ .

ARG VITE_BACKEND_URL
ARG VITE_GOOGLE_WEB_CLIENT_ID
ARG VITE_EDITORIAL_USERNAME
ARG FRONTEND_SERVER_NAME
ARG BACKEND_SERVER_NAME
ARG MINIO_ENDPOINT
ARG MINIO_API_ENDPOINT
ARG GRAFANA_SERVER_NAME
ARG PROMETHEUS_SERVER_NAME

ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_GOOGLE_WEB_CLIENT_ID=${VITE_GOOGLE_WEB_CLIENT_ID}
ENV VITE_EDITORIAL_USERNAME=${VITE_EDITORIAL_USERNAME}
ENV FRONTEND_SERVER_NAME=${FRONTEND_SERVER_NAME}
ENV BACKEND_SERVER_NAME=${BACKEND_SERVER_NAME}
ENV MINIO_ENDPOINT=${MINIO_ENDPOINT}
ENV MINIO_API_ENDPOINT=${MINIO_API_ENDPOINT}
ENV GRAFANA_SERVER_NAME=${GRAFANA_SERVER_NAME}
ENV PROMETHEUS_SERVER_NAME=${PROMETHEUS_SERVER_NAME}

COPY nginx/nginx.conf /etc/nginx/nginx.conf

RUN sed -i "s/FRONTEND_SERVER_NAME/${FRONTEND_SERVER_NAME}/g" /etc/nginx/nginx.conf
RUN sed -i "s/BACKEND_SERVER_NAME/${BACKEND_SERVER_NAME}/g" /etc/nginx/nginx.conf
RUN sed -i "s/MINIO_ENDPOINT/${MINIO_ENDPOINT}/g" /etc/nginx/nginx.conf
RUN sed -i "s/MINIO_API_ENDPOINT/${MINIO_API_ENDPOINT}/g" /etc/nginx/nginx.conf
RUN sed -i "s/GRAFANA_SERVER_NAME/${GRAFANA_SERVER_NAME}/g" /etc/nginx/nginx.conf
RUN sed -i "s/PROMETHEUS_SERVER_NAME/${PROMETHEUS_SERVER_NAME}/g" /etc/nginx/nginx.conf

RUN npm run build

FROM nginx:1.27-alpine

RUN rm -f /etc/nginx/conf.d/default.conf

COPY --from=build /etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/spa-locations.conf /etc/nginx/spa-locations.conf


RUN mkdir -p /etc/nginx/certs

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
