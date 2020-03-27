# Use Node v8 as the base image.
FROM node:alpine

# --> Add everything in the current directory to our image, in the 'app' folder.
ADD . /app

# --> Install dependencies
RUN cd /app; \
npm install --production

# --> Expose our server port.
EXPOSE 8008
VOLUME /app
# --> Run our app.
CMD ["npm", "start"]