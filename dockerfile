
# Node image 16
FROM node:16 AS build-env
ADD . /consumer-app
WORKDIR /consumer-app
RUN rm -rf node_modules
RUN rm -rf package-lock.json
RUN npm cache clean --force
RUN npm i --production

## Copy application with its dependencies into distroless image
# FROM gcr.io/distroless/nodejs
# COPY --from=build-env /consumer-app /consumer-app
# WORKDIR /consumer-app
CMD ["index.js"]
