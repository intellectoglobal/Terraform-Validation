import * as vscode from 'vscode';
import axios from 'axios';
import * as fs from 'fs';
import logger from '../utils/logger';

// Function to load validation policies from a local JSON file
async function loadJsonPolicies(jsonPath: string, cloudProvider: string) {
    try {
        const data = fs.readFileSync(jsonPath, 'utf8');
        const formattedData = JSON.parse(data);
        return formattedData[cloudProvider];
    } catch (error) {
        return null;
    }
}

// Function to fetch policies from cloud providers
async function fetchCloudPolicies(cloudProvider: 'aws' | 'azure') {
    try {
        let response;
        if (cloudProvider === 'aws') {
            response = await axios.get('https://policy-server.aws.example.com/policies');
        } else if (cloudProvider === 'azure') {
            response = await axios.get('https://policy-server.azure.example.com/policies');
        }
        return response?.data || "";
    } catch (error) {
        return null;
    }
}

const defaultPolicies = {
    aws: {
        aws_s3_bucket: { min: 2, max: 2 },
        aws_instance: { min: 2, max: 3 },
    },
    azure: {
        azurerm_storage_account: { min: 1, max: 3 },
        azurerm_windows_virtual_machine: { min: 1, max: 5 },
    },
};

// Function to dynamically validate Terraform resources and capture error ranges
function validateResource(text: string, resourceType: string, policies: any, document: vscode.TextDocument, diagnostics: vscode.Diagnostic[]) {
    const resourceRegex = new RegExp(`resource\\s+"${resourceType}"`, 'g');
    let match;

    // Iterate through all matches for the resource type
    while ((match = resourceRegex.exec(text)) !== null) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(text.indexOf('}', match.index) + 1); // Find the closing brace of the resource block
        const range = new vscode.Range(startPos, endPos);
        
        const resourceCount = (text.match(new RegExp(`resource\\s+"${resourceType}"`, 'g')) || []).length;

        if (policies[resourceType]) {
            const { min, max } = policies[resourceType];
            if (resourceCount < min) {
                diagnostics.push({
                    severity: vscode.DiagnosticSeverity.Error,
                    range: range,
                    message: `At least ${min} ${resourceType} required, found ${resourceCount}.`,
                    source: 'Terraform Validator',
                });
            }
            if (resourceCount > max) {
                diagnostics.push({
                    severity: vscode.DiagnosticSeverity.Error,
                    range: range,
                    message: `At most ${max} ${resourceType} allowed, found ${resourceCount}.`,
                    source: 'Terraform Validator',
                });
            }
        } else {
            diagnostics.push({
                severity: vscode.DiagnosticSeverity.Warning,
                range: range,
                message: `No policies defined for resource type ${resourceType}.`,
                source: 'Terraform Validator',
            });
        }
    }
}

export async function validateTerraformScript(document: vscode.TextDocument, jsonFilePath?: string): Promise<vscode.Diagnostic[]> {
    const text = document.getText();
    const diagnostics: vscode.Diagnostic[] = [];

    // Determine the cloud provider based on the resource types present in the document
    let cloudProvider: 'aws' | 'azure' | null = null;
    if (text.includes('aws_')) {
        cloudProvider = 'aws';
    } else if (text.includes('azurerm_')) {
        cloudProvider = 'azure';
    } else {
        diagnostics.push({
            severity: vscode.DiagnosticSeverity.Warning,
            range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
            message: 'No supported cloud provider found in the Terraform script.',
            source: 'Terraform Validator',
        });
        return diagnostics;
    }

    // Load policies: from JSON file, cloud provider, or default
    let policies;
    if (jsonFilePath) {
        logger.info("json file path ::", jsonFilePath);
        policies = await loadJsonPolicies(jsonFilePath, cloudProvider);
    }
    if (!policies) {
        policies = await fetchCloudPolicies(cloudProvider) || defaultPolicies[cloudProvider];
    }

    // Dynamically validate all resource types in the policies
    for (const resourceType in policies) {
        validateResource(text, resourceType, policies, document, diagnostics);
    }

    return diagnostics;
}
