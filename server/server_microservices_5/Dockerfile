FROM node:alpine

RUN apk update && apk add ca-certificates && update-ca-certificates

RUN mkdir /absensi_microservices_5

ADD . /absensi_microservices_5
WORKDIR /absensi_microservices_5


RUN npm update

CMD node index.js


# Build dulu
# docker build -t absensi_microservices_5:0.0.1 .

# Running Docker
# docker run  --name absensi_microservices_5 -p 50285:50285 -d absensi_microservices_5:0.0.1

# docker run  --name absensi_microservices_5 -p 50285:50285 -d --restart=always unless-stopped lowhanfish/absensi_microservices_5:0.0.1


# Klo mau push, login dulu lalu bikin dulu tagnya seperti di bawah,, cantumkan juga usernamenya, misalkan lowhanfish

# 1. Login
# Docker login

# 2. Buat tagnya
# docker tag absensi_microservices_5:0.0.1 lowhanfish/absensi_microservices_5:0.0.1


# setelah semuanya selesai maka langsung push saja dengan perintah
# docker push absensi_microservices_5:0.0.1 <= sesuaikan dengan nama tag yang telah di buat



# docker build -t test-docker:0.0.1 .

# docker run  --name testdocker -p 3001:3000 -d --restart unless-stopped test-docker:0.0.1