param location string = resourceGroup().location
param environmentName string
param environmentId string
param acrName string
param pullIdentityName string
param storageAccountName string
param targetPort int
param weatherTableName string
param imageContainerName string
param generationQueueName string
param imageQueueName string
param postprocessImageQueueName string
@secure()
param apiAccessToken string

var appName = '${environmentName}api'
var imageRepository = 'weather-api'
var imageTag = 'latest'

var blobDataReaderRoleId = subscriptionResourceId(
  'Microsoft.Authorization/roleDefinitions',
  '2a2b9908-6ea1-4ae2-8e65-a410df84e7d1'
) // Storage Blob Data Reader

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

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
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
      ingress: {
        external: true
        targetPort: targetPort
        allowInsecure: false
      }
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
        {
          name: 'api-access-token'
          value: apiAccessToken
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: '${registry.properties.loginServer}/${imageRepository}:${imageTag}'
          env: [
            {
              name: 'AZURE_STORAGE_CONNECTION_STRING'
              secretRef: 'storage-connection-string'
            }
            {
              name: 'ACCESS_TOKEN'
              secretRef: 'api-access-token'
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
            cpu: json('0.25')
            memory: '0.5Gi'
          }
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
      }
    }
  }
}

resource blobDataReader 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, containerApp.id, 'StorageBlobDataReader')
  scope: storageAccount
  properties: {
    roleDefinitionId: blobDataReaderRoleId
    principalId: containerApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

output containerAppUrl string = containerApp.properties.configuration.ingress.fqdn
