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

COPY . /app

RUN apk add --update --no-cache --virtual .tmp gcc libc-dev linux-headers
RUN apk add --no-cache jpeg-dev zlib-dev
RUN apk add --no-cache gcc g++ linux-headers libffi-dev openssl-dev 
RUN apk del .tmp
RUN apk add build-base
RUN pip install -r requirements.txt
RUN apk del build-base

RUN apk add tzdata
RUN ls /usr/share/zoneinfo
RUN cp /usr/share/zoneinfo/Japan /etc/localtime
RUN apk del tzdata

# USER $SERVICE_NAME

ENV PYTHONPATH=/app

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
EXPOSE 8000
