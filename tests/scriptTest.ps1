$subscriptionId = 'xxxxx' # Id of the subscription containing the function app
$resourceGroup = 'xxxxx' # Name of the resource group
$functionApp = 'xxxxxx' # Name of the function app
$functionName = 'xxxxx' # Name of the function endpoint inside the function app
$keyType = "host" #function or host
$functionKeyName = "functionKey" # Name of the outputed variable inside Azure DevOps

Invoke-Expression "& ..\script.ps1"
