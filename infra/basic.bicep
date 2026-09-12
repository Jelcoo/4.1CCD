param environmentName string
param generationQueueName string
param imageQueueName string
param postprocessImageQueueName string
param weatherTableName string
param imageContainerName string
param targetPort int
@secure()
param apiAccessToken string

module storageAccount './storageAccount.bicep' = {
    name: 'storageAccountDeployment'
    params: {
        environmentName: environmentName
    }
}

module tableStorage './tableStorage.bicep' = {
    name: 'tableStorageDeployment'
    params: {
        storageAccountName: storageAccount.outputs.storageAccountName
        weatherTableName: weatherTableName
    }
}

module blobStorage './blobStorage.bicep' = {
    name: 'blobStorageDeployment'
    params: {
        storageAccountName: storageAccount.outputs.storageAccountName
        imageContainerName: imageContainerName
    }
}

module queueStorage './queueStorage.bicep' = {
    name: 'queueStorageDeployment'
    params: {
        storageAccountName: storageAccount.outputs.storageAccountName
        generationQueueName: generationQueueName
        imageQueueName: imageQueueName
        postprocessImageQueueName: postprocessImageQueueName
    }
}

module containerRegistry './containerRegistry.bicep' = {
    name: 'containerRegistryDeployment'
    params: {
        environmentName: environmentName
    }
}

module containerAppsEnvironment './containerAppsEnvironment.bicep' = {
    name: 'containerAppsEnvironmentDeployment'
    params: {
        environmentName: environmentName
    }
}

module apiContainer './apiContainer.bicep' = {
    name: 'apiContainerDeployment'
    params: {
        environmentName: environmentName
        environmentId: containerAppsEnvironment.outputs.id
        acrName: containerRegistry.outputs.name
        pullIdentityName: containerRegistry.outputs.pullIdentityName
        storageAccountName: storageAccount.outputs.storageAccountName
        targetPort: targetPort
        weatherTableName: weatherTableName
        imageContainerName: imageContainerName
        generationQueueName: generationQueueName
        imageQueueName: imageQueueName
        postprocessImageQueueName: postprocessImageQueueName
        apiAccessToken: apiAccessToken
    }
}

module queueListener './queueListener.bicep' = {
    name: 'queueListenerDeployment'
    params: {
        environmentName: environmentName
        environmentId: containerAppsEnvironment.outputs.id
        acrName: containerRegistry.outputs.name
        pullIdentityName: containerRegistry.outputs.pullIdentityName
        storageAccountName: storageAccount.outputs.storageAccountName
        weatherTableName: weatherTableName
        imageContainerName: imageContainerName
        generationQueueName: generationQueueName
        imageQueueName: imageQueueName
        postprocessImageQueueName: postprocessImageQueueName
    }
    dependsOn: [
        tableStorage
        blobStorage
        queueStorage
    ]
}

output apiContainerUrl string = apiContainer.outputs.containerAppUrl
