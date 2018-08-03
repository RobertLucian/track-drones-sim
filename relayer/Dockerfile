FROM node:8.11.3-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG ADDRESS_BROKER=some-rabbit
ENV ADDRESS_BROKER=${ADDRESS_BROKER}

WORKDIR /opt/relayer
COPY package*.json ./
RUN npm install npm@latest && \
    npm install && \
    npm cache clean --force
COPY relayer.js ./

EXPOSE 8081

CMD if [ ${NODE_ENV} == production ]; \
    then \
    node relayer.js ${ADDRESS_BROKER}; \
    elif [ ${NODE_ENV} == development ]; \
    then \
    ${PWD}/node_modules/nodemon/bin/nodemon.js relayer.js ${ADDRESS_BROKER}; \
    fi