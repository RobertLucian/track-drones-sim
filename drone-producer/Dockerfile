FROM node:8.11.3-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG ADDRESS_BROKER=some-rabbit
ENV ADDRESS_BROKER=${ADDRESS_BROKER}

ENV SLOW_MOVER=""

WORKDIR /opt/producer
COPY package*.json ./
RUN npm install npm@^6.3.0 -g && \
    npm install && \
    npm cache clean --force
COPY drone-producer.js ./

CMD if [ ${NODE_ENV} == production ]; \
    then \
    node drone-producer.js ${ADDRESS_BROKER} ${SLOW_MOVER}; \
    elif [ ${NODE_ENV} == development ]; \
    then \
    ${PWD}/node_modules/nodemon/bin/nodemon.js -L drone-producer.js ${ADDRESS_BROKER} ${SLOW_MOVER} --exec "npm run test && node"; \
    fi