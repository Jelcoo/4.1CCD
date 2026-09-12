param location string = resourceGroup().location
param environmentName string
param environmentId string
param acrName string
param pullIdentityName string
param storageAccountName string
param weatherTableName string
param imageContainerName string
param generationQueueName string
param imageQueueName string
param postprocessImageQueueName string

var appName = '${environmentName}worker'
var imageRepository = 'queue-listener'
var imageTag = 'latest'
var queueScaleThreshold = 5

resource registry 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: acrName
}

resource pullIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: pullIdentityName
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' existing = {
  name: storageAccountName
}

var storageAccountConnectionString = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net'

resource queueWorker 'Microsoft.App/containerApps@2024-03-01' = {
  name: appName
  location: location
  tags: resourceGroup().tags
  identity: {
    type: 'SystemAssigned,UserAssigned'
    userAssignedIdentities: {
      '${pullIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: environmentId
    configuration: {
      registries: [
        {
          server: registry.properties.loginServer
          identity: pullIdentity.id
        }
      ]
      secrets: [
        {
          name: 'storage-connection-string'
          value: storageAccountConnectionString
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'queue-listener'
          image: '${registry.properties.loginServer}/${imageRepository}:${imageTag}'
          env: [
            {
              name: 'FUNCTIONS_EXTENSION_VERSION'
              value: '~4'
            }
            {
              name: 'FUNCTIONS_WORKER_RUNTIME'
              value: 'node'
            }
            {
              name: 'AzureWebJobsStorage'
              secretRef: 'storage-connection-string'
            }
            {
              name: 'AZURE_STORAGE_CONNECTION_STRING'
              secretRef: 'storage-connection-string'
            }
            {
              name: 'WEATHER_TABLE_NAME'
              value: weatherTableName
            }
            {
              name: 'IMAGE_CONTAINER_NAME'
              value: imageContainerName
            }
            {
              name: 'GENERATION_QUEUE_NAME'
              value: generationQueueName
            }
            {
              name: 'IMAGE_QUEUE_NAME'
              value: imageQueueName
            }
            {
              name: 'POSTPROCESS_IMAGE_QUEUE_NAME'
              value: postprocessImageQueueName
            }
          ]
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 5
        rules: [
          {
            name: 'generation-queue-scale-rule'
            azureQueue: {
              queueName: generationQueueName
              queueLength: queueScaleThreshold
              auth: [
                {
                  secretRef: 'storage-connection-string'
                  triggerParameter: 'connection'
                }
              ]
            }
          }
          {
            name: 'image-queue-scale-rule'
            azureQueue: {
              queueName: imageQueueName
              queueLength: queueScaleThreshold
              auth: [
                {
                  secretRef: 'storage-connection-string'
                  triggerParameter: 'connection'
                }
              ]
            }
          }
          {
            name: 'postprocess-image-queue-scale-rule'
            azureQueue: {
              queueName: postprocessImageQueueName
              queueLength: queueScaleThreshold
              auth: [
                {
                  secretRef: 'storage-connection-string'
                  triggerParameter: 'connection'
                }
              ]
            }
          }
        ]
      }
    }
  }
}
