#!/bin/bash

set -a
source .env
set +a

APP_NAME=weather-app
REGION=francecentral
IMAGE_SERVER_NAME=weatherapp710535registry
IMAGE_SERVER=$IMAGE_SERVER_NAME.azurecr.io
IMAGE_API_REPOSITORY=weather-api
IMAGE_QUEUE_LISTENER_REPOSITORY=queue-listener
IMAGE_TAG=latest

# az group create -n $APP_NAME -l $REGION

az acr login --name $IMAGE_SERVER_NAME

# API
docker build -t $IMAGE_API_REPOSITORY -f api/Dockerfile .
docker tag $IMAGE_API_REPOSITORY:$IMAGE_TAG $IMAGE_SERVER/$IMAGE_API_REPOSITORY:$IMAGE_TAG
docker push $IMAGE_SERVER/$IMAGE_API_REPOSITORY:$IMAGE_TAG

# Queue Worker
docker build -t $IMAGE_QUEUE_LISTENER_REPOSITORY -f queue-listener/Dockerfile .
docker tag $IMAGE_QUEUE_LISTENER_REPOSITORY:$IMAGE_TAG $IMAGE_SERVER/$IMAGE_QUEUE_LISTENER_REPOSITORY:$IMAGE_TAG
docker push $IMAGE_SERVER/$IMAGE_QUEUE_LISTENER_REPOSITORY:$IMAGE_TAG

az deployment group create \
  -g $APP_NAME \
  -f ./infra/basic.bicep \
  --parameters "generationQueueName=$GENERATION_QUEUE_NAME" \
  "imageQueueName=$IMAGE_QUEUE_NAME" \
  "postprocessImageQueueName=$POSTPROCESS_IMAGE_QUEUE_NAME" \
  "weatherTableName=$WEATHER_TABLE_NAME" \
  "imageContainerName=$IMAGE_CONTAINER_NAME" \
  "targetPort=$API_PORT"
