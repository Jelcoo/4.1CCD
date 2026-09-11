param storageAccountName string
param generationQueueName string
param imageQueueName string
param postprocessImageQueueName string

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' existing = {
  name: storageAccountName
}

resource queueService 'Microsoft.Storage/storageAccounts/queueServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
}

resource generationQueue 'Microsoft.Storage/storageAccounts/queueServices/queues@2023-05-01' = {
  name: generationQueueName
  parent: queueService
  properties: {
    metadata: {
      key: 'value'
    }
  }
}

resource imageQueue 'Microsoft.Storage/storageAccounts/queueServices/queues@2023-05-01' = {
  name: imageQueueName
  parent: queueService
  properties: {
    metadata: {
      key: 'value'
    }
  }
}

resource postprocessImageQueue 'Microsoft.Storage/storageAccounts/queueServices/queues@2023-05-01' = {
  name: postprocessImageQueueName
  parent: queueService
  properties: {
    metadata: {
      key: 'value'
    }
  }
}
