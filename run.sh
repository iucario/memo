# docker rm myapp
# docker rmi myimage
# docker build . -t myimage:latest
docker run --name myapp \
    -v $PWD/data:/data \
    -d -p 8000:8000 myimage:latest