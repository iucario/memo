FROM memo-base:latest

COPY . /app

CMD ["uvicorn", "src.main:app", \
    "--host=0.0.0.0", "--port=8000", \
    "--proxy-headers", "--forwarded-allow-ips='*'"]
EXPOSE 8000
