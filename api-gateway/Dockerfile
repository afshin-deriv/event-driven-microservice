FROM node:16

WORKDIR /usr/src/app
# copy base config
COPY package.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
