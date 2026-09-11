param generationQueueName string
param imageQueueName string
param postprocessImageQueueName string
param weatherTableName string
param imageContainerName string
param targetPort int

var environmentName = 'weatherapp710535'

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
    }
}

module queueWorker './queueWorker.bicep' = {
    name: 'queueWorkerDeployment'
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
