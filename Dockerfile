FROM node:18.7.0-alpine3.16 AS frontend
WORKDIR /frontend-build

COPY my-app/ .

RUN npm install
RUN npm run build

FROM python:3.10.6-alpine3.16 AS backend
WORKDIR /app

COPY --from=frontend /frontend-build/build ./build
COPY server/ ./server

RUN apk add --update --no-cache --virtual .tmp gcc libc-dev linux-headers
RUN apk add --no-cache jpeg-dev zlib-dev
RUN apk add --no-cache gcc g++ linux-headers libffi-dev openssl-dev 
RUN apk del .tmp
RUN pip install -r server/requirements.txt

CMD ["uvicorn", "server.main:app", "--port", "8000", "--host", "0.0.0.0"]