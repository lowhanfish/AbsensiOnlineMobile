FROM node:alpine

# RUN apk update && apk add ca-certificates && update-ca-certificates

# RUN mkdir /test-docker-dua

# ADD . /test-docker

RUN apk add --no-cache tzdata
ENV TZ=Asia/Makassar

# tentukan dulu direktory kerja kita
WORKDIR /absensi_microservices_4

# Kita copy dulu paket json nya termasuk lock
COPY package*.json ./

# Instal semua paketnya dengen perintah di bawah.. --silent hanya perintah saja supaya jgn ada kayak notifikasi dll
# RUN npm install
CMD npm install

# Copy semua.. copy (titik) maksudnya mengopy semua file kecuali file/folder yang ada di set dockerignore
COPY . ./

RUN npm update
CMD node index.js
# CMD nodemon server.js

# nah kita expose sudah port yang ingin kita pakai
# EXPOSE 7314





# Build dulu
# docker build -t absensi_microservices_4:0.0.3 .

# Running Docker
# docker run  --name absensi_microservices_4 -p 50284:50284 -d absensi_microservices_4:0.0.3

# docker run  --name absensi_microservices_4 -p 50284:50284 -d --restart unless-stopped lowhanfish/absensi_microservices_4:0.0.3


# Klo mau push, login dulu lalu bikin dulu tagnya seperti di bawah,, cantumkan juga usernamenya, misalkan lowhanfish

# 1. Login
# Docker login

# 2. Buat tagnya
# docker tag absensi_microservices_4:0.0.3 lowhanfish/absensi_microservices_4:0.0.3


# setelah semuanya selesai maka langsung push saja dengan perintah
# docker push lowhanfish/absensi_microservices_4:0.0.3 <= sesuaikan dengan nama tag yang telah di buat



# docker build -t test-docker:0.0.1 .

# docker run  --name testdocker -p 50284:50284 -d --restart unless-stopped test-docker:0.0.1