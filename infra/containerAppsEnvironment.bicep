param location string = resourceGroup().location
param environmentName string

resource managedEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: environmentName
  location: location
  tags: resourceGroup().tags
  properties: {}
}

output id string = managedEnvironment.id
output name string = managedEnvironment.name
