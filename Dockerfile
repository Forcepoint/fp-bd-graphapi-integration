FROM node:14.17.0-alpine3.13

WORKDIR /app

ARG _HOME_DIR_NAME=fp-graphapi-exporter
ENV _HOME_DIR_NAME=${_HOME_DIR_NAME}

COPY container-files container-files/

RUN apk update && apk add --no-cache bash \
    wget \
    && tar -zxvf container-files/${_HOME_DIR_NAME}-v*.tar.gz \
    && rm -f container-files/${_HOME_DIR_NAME}-v*.tar.gz \
    && chmod 755 container-files/entrypoint.sh \
    && cd ${_HOME_DIR_NAME} \
    && npm install 

ENTRYPOINT ["./container-files/entrypoint.sh"]
