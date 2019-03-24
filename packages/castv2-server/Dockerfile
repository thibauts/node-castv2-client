FROM node:alpine
WORKDIR /usr/src/app
RUN apk add --update git && \
  rm -rf /tmp/* /var/cache/apk/*
COPY . /usr/src/app
RUN npm install
EXPOSE 3000
ENTRYPOINT ["node", "castWebApi.js"]
