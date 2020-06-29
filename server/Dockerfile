FROM mhart/alpine-node:12 as builder

# Create folder
RUN mkdir -p /srv/app/infini-server
WORKDIR /srv/app/infini-server

# Copy to working directory
COPY . /srv/app/infini-server/

# install dependencies
RUN yarn install && yarn build && yarn cache clean

# => Run container
FROM mhart/alpine-node:12

# Static build
RUN mkdir -p /srv/app/infini-server
COPY --from=builder /srv/app/infini-server/dist /srv/app/infini-server

# switch to build directory 
WORKDIR /srv/app/infini-server

CMD ["node", "server.js"]
