# Use Node v8 as the base image.
FROM node:alpine

WORKDIR /usr/app/server

COPY . /usr/app/server

RUN cd /usr/app/server && npm install --production

EXPOSE 8008
CMD ["npm", "start"]

# # --> Add everything in the current directory to our image, in the 'app' folder.
# ADD . /app

# # --> Install dependencies
# COPY package.json .
# COPY package-lock.json .
# RUN cd /app; \
# npm install --production; \
# npm install nodemon

# # --> Expose our server port.
# EXPOSE 8008
# VOLUME /app
# # --> Run our app.
# CMD ["npm", "start"]