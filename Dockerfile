FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG BACKEND_API_URL=http://backend:3001/api/v1
ENV BACKEND_API_URL=$BACKEND_API_URL

RUN npm run build

FROM node:24-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV BACKEND_API_URL=http://backend:3001/api/v1

COPY --from=build /app /app

EXPOSE 3000

CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0"]
