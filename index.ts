import tl = require('azure-pipelines-task-lib/task');
import path = require('path');
import fs = require('fs');
import { IExecSyncResult } from 'azure-pipelines-task-lib/toolrunner';

export class GetFunctionKeyTask {

    private static isLoggedIn: boolean;
    private static servicePrincipalId: string;
    private static tenantId: string;
    private static servicePrincipalKey: string;
    private static cliPasswordPath: string;

    constructor() {
    }

    public static async runAsync() {
        try {
            const tool = tl.tool(tl.which('pwsh', true))
                .arg('-NoLogo')
                .arg('-NoProfile')
                .arg('-NonInteractive')
                .arg('-ExecutionPolicy')
                .arg('Unrestricted')
                .arg('-Command')
                .arg(`. script.ps1`)

            var connectedService: string = tl.getInput("connectedServiceNameARM", true);

            await this.loginAzureRM(connectedService);

            var subscriptionId: string = tl.getEndpointDataParameter(connectedService, "SubscriptionID", true);
            var resourceGroup: string = tl.getInput('resourceGroup', true);
            var functionApp: string = tl.getInput('azureServerFarm', true);
            var functionName: string = tl.getInput('azureFunctionName', true);
            var keyType: string = tl.getInput('hostOrFunctionKey', true);
            var functionKeyName: string = tl.getInput('outputVariableName', true);

            tool.exec({
                failOnStdErr: true,
                outStream: null,
                errStream: null,
                env: {
                    ...process.env,
                    ...{
                        subscriptionId: subscriptionId,
                        resourceGroup: resourceGroup,
                        functionapp: functionApp,
                        functionName: functionName,
                        keyType: keyType,
                        functionKeyName: functionKeyName
                    }
                }
            });

            tl.setResult(tl.TaskResult.Succeeded, "Key fetched from Azure function")
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
        finally {
            //Logout of Azure if logged in
            if (this.isLoggedIn) {
                this.logoutAzure();
            }
        }
    }

    private static loginAzureRM(connectedService: string): void {
        var authScheme: string = tl.getEndpointAuthorizationScheme(connectedService, true);
        var subscriptionID: string = tl.getEndpointDataParameter(connectedService, "SubscriptionID", true);

        if (authScheme.toLowerCase() == "serviceprincipal") {
            let authType: string = tl.getEndpointAuthorizationParameter(connectedService, 'authenticationType', true);
            let cliPassword: string = null;
            var servicePrincipalId: string = tl.getEndpointAuthorizationParameter(connectedService, "serviceprincipalid", false);
            var tenantId: string = tl.getEndpointAuthorizationParameter(connectedService, "tenantid", false);

            this.servicePrincipalId = servicePrincipalId;
            this.tenantId = tenantId;

            if (authType == "spnCertificate") {
                tl.debug('certificate based endpoint');
                let certificateContent: string = tl.getEndpointAuthorizationParameter(connectedService, "servicePrincipalCertificate", false);
                cliPassword = path.join(tl.getVariable('Agent.TempDirectory') || tl.getVariable('system.DefaultWorkingDirectory'), 'spnCert.pem');
                fs.writeFileSync(cliPassword, certificateContent);
                this.cliPasswordPath = cliPassword;
            }
            else {
                tl.debug('key based endpoint');
                cliPassword = tl.getEndpointAuthorizationParameter(connectedService, "serviceprincipalkey", false);
                this.servicePrincipalKey = cliPassword;
            }

            //login using svn
            this.throwIfError(tl.execSync("az", "login --service-principal -u \"" + servicePrincipalId + "\" -p \"" + cliPassword + "\" --tenant \"" + tenantId + "\""), tl.loc("LoginFailed"));
        }
        else if (authScheme.toLowerCase() == "managedserviceidentity") {
            //login using msi
            this.throwIfError(tl.execSync("az", "login --identity"), tl.loc("MSILoginFailed"));
        }
        else {
            throw tl.loc('AuthSchemeNotSupported', authScheme);
        }

        this.isLoggedIn = true;
        //set the subscription imported to the current subscription
        this.throwIfError(tl.execSync("az", "account set --subscription \"" + subscriptionID + "\""), tl.loc("ErrorInSettingUpSubscription"));
    }

    private static logoutAzure() {
        try {
            tl.execSync("az", " account clear");
        }
        catch (err) {
            // task should not fail if logout doesn`t occur
            tl.warning(tl.loc("FailedToLogout"));
        }
    }

    public static throwIfError(resultOfToolExecution: IExecSyncResult, errormsg?: string): void {
        if (resultOfToolExecution.code != 0) {
            tl.error("Error Code: [" + resultOfToolExecution.code + "]");
            if (errormsg) {
                tl.error("Error: " + errormsg);
            }
            throw resultOfToolExecution;
        }
    }
}

GetFunctionKeyTask.runAsync();