# Introduction
This extension will help you get azure function key inside you Azure Devops Build or Release pipeline. The azure function must already exist inside your Azure subscription and resource group. This extension allows you to get either the function key or the more global host key.

This extension contains only one task for build / release pipelines. After installing this extension, search for "Get azure function authorization key" when adding a new task.

# Inputs 
Inputs allows you to target a specific function inside an existing Azure subscription / resource group. Here is the list of inputs :
- Azure subscription (mandatory) : service connection to to azure susbcription that will be used to connect to you azure function. The service connection avec the read rights onto the targeted Azure function.
- Resource group to use (mandatory) : the name of the resource group containing the targeted Azure function
- Key level to get (mandatory) : Indicates what kind of key you want to get. Function : key only applicable to the targeted function or Host : key applicable to all functions in the targeted Function App.
- Azure function (mandatory) : The targeted Function App inside the Resource Group
- Name of the function (mandatory) : The name of the function targeted inside the Function App.
- Variable name (default : functionKey) : The name of the environment variables setted by this task with the found key.

# Outputs
Only one variable is outputted from this task and is stored inside an environment variable defined by the Input "Variable Name".
Use the environment variable notation afterwards inside your pipeline to get the found key.
Example with the default value of "Variable name" : $(functionKey)

# Remarks and suggestions
I created this plugin for one of my own need on my free time. This is delivered without any guarentee. To be used at you own risks.
If anyone wants to help or improve this plugin, the source code is hosted inside github at this address : https://github.com/ensilog/ado-get-function-key, do not hesitate, I will happily take your suggestions into account :)

You can also find me on github through @Chinouchi.