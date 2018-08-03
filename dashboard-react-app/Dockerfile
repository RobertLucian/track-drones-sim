FROM node:8.11.3-alpine

WORKDIR /opt/webapp
COPY src ./src
COPY public ./public
COPY package*.json ./
COPY webserver ./webserver

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN npm install npm@latest && \
    npm install && \
    if [ ${NODE_ENV} == production ];then \
    npm run build && rm -rf public src && mv build/* ./ && rmdir build && \
    mv webserver/dashboard.js ./ && rm -rf webserver && \
    rm -rf node_modules && \
    npm install express@`node -p -e "require('./package.json').dependencies.express"` --no-package-lock; \
    elif [ ${NODE_ENV} == development ];then \
    rm -rf webserver; \
    fi && \
    npm cache clean --force;

EXPOSE 3000

CMD if [ ${NODE_ENV} == production ]; \
    then \
    node dashboard.js; \
    elif [ ${NODE_ENV} == development ]; \
    then \
    npm run start; \
    fi