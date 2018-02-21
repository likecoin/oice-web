FROM node:6-alpine
RUN mkdir /app
WORKDIR /app
RUN npm uninstall npm -g && yarn global add npm@5
COPY package.json package-lock.json /app/
RUN cd /app && apk add --no-cache --virtual .build-deps \
    make \
    gcc \
    git \
    g++ \
    python \
    && npm install && apk del .build-deps
ENV OICE_DEV 1
COPY [ ".babelrc", ".eslintrc", "index.js", "package.json", "webpack.config.js", "/app/" ]
COPY dist/ /app/dist/
COPY src /app/src/
COPY src/common/constants/key.example.js /app/src/common/constants/key.js
ARG SRV_ENV=localhost
ENV SRV_ENV ${SRV_ENV}
ARG NODE_ENV=localhost
ENV NODE_ENV ${NODE_ENV}
RUN yarn run build
CMD yarn run server
