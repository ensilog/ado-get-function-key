$resourceId = "/subscriptions/$subscriptionId/resourceGroups/$resourceGroup/providers/Microsoft.Web/sites/$functionApp"

$keyToOutput = ""
if ($keyType -eq "function") {
    $functionKeys = az rest --method post -o json --uri "https://management.azure.com$resourceId/functions/$functionName/listKeys?api-version=2018-02-01" | ConvertFrom-Json
    $keyToOutput = $functionKeys.default
}
elseif ($keyType -eq "host") {
    $functionKeys = az rest --method post -o json --uri "$resourceId/host/default/listKeys?api-version=2018-11-01" | ConvertFrom-Json
    $keyToOutput = $functionKeys.functionKeys.default
}
else {
    throw "Unknown key type to get"
}

Write-Host "##vso[task.setvariable variable=$functionKeyName;]$keyToOutput"