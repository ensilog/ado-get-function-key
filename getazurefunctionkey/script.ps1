$resourceId = "/subscriptions/$env:subscriptionId/resourceGroups/$env:resourceGroup/providers/Microsoft.Web/sites/$env:functionApp"

$keyToOutput = ""
if ($env:keyType -eq 'function') {
    $functionKeys = az rest --method post -o json --uri "https://management.azure.com$resourceId/functions/$env:functionName/listKeys?api-version=2018-02-01" | ConvertFrom-Json
    $keyToOutput = $functionKeys.default
}
elseif ($env:keyType -eq 'host') {
    $functionKeys = az rest --method post -o json --uri "$resourceId/host/default/listKeys?api-version=2018-11-01" | ConvertFrom-Json
    $keyToOutput = $functionKeys.functionKeys.default
}
else {
    throw "Unknown key type to get $env:keyType"
}

Write-Host "##vso[task.setvariable variable=$env:functionKeyName;issecret=true]$keyToOutput"
