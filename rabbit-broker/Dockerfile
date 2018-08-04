FROM rabbitmq:3.7.7-management-alpine

ARG PHASE=production
ENV PHASE ${PHASE}

RUN [[ ${PHASE} == development ]] && apk --no-cache add curl