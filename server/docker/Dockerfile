FROM python:3.10.6-alpine3.16
WORKDIR /app

ENV SERVICE_NAME=fastapi
RUN addgroup --gid 1001 -S $SERVICE_NAME && \
    adduser -G $SERVICE_NAME --shell /bin/false \
    --disabled-password -H --uid 1001 $SERVICE_NAME && \
    mkdir -p /var/log/$SERVICE_NAME && \
    chown $SERVICE_NAME:$SERVICE_NAME /var/log/$SERVICE_NAME
RUN mkdir /data && \
    chown $SERVICE_NAME:$SERVICE_NAME /data

RUN apk add --update --no-cache --virtual .tmp gcc libc-dev linux-headers
RUN apk add --no-cache jpeg-dev zlib-dev
RUN apk add --no-cache gcc g++ linux-headers libffi-dev openssl-dev 
RUN apk del .tmp
RUN apk add build-base

COPY requirements.txt /app/
RUN pip install -r requirements.txt
RUN apk del build-base

# USER $SERVICE_NAME

ENV PYTHONPATH=/app
