#################
## DEVELOPMENT ##
#################

FROM node:18-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g @nestjs/cli

################
## PRODUCTION ##
################

FROM node:18-alpine AS production

ARG NODE_ENV='production'
ENV NODE_ENV=${NODE_ENV}

WORKDIR /src/app

COPY --from=development /src/app/ .

EXPOSE 8081

CMD [ "node" , "dist/main" ]