import * as vscode from 'vscode';
import axios from 'axios';
import * as fs from 'fs';
import logger from '../utils/logger';
const { exec } = require('child_process');

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
        return response?.data || null;
    } catch (error) {
        return null;
    }
}

const defaultPolicies = {
    aws: {
        aws_s3_bucket: { min: 2, max: 3 },
        aws_instance: { min: 1, max: 5 },
        // aws_lambda_function: { min: 1, max: 2 },
    },
    azure: {
        azurerm_storage_account: { min: 1, max: 3 },
        azurerm_virtual_machine: { min: 1, max: 5 },
        azurerm_function_app: { min: 1, max: 2 },
        azurerm_network_interface: { min: 1, max: 10 },
        azurerm_app_service_plan: { min: 1, max: 2 },
        azurerm_sql_server: { min: 1, max: 1 },
        azurerm_key_vault: { min: 1, max: 2 },
        azurerm_cosmosdb_account: { min: 1, max: 2 }
    },
};


// Generic function to dynamically validate resources based on policies
function validateResources(policies: any, text: string): string[] {
    const issues: string[] = [];
    console.log("Policies ::", policies);
    console.log("documentDetails ::", text);

    Object.keys(policies).forEach((resourceType) => {
        console.log("Resourece type ::", resourceType)
        const policy = policies[resourceType];
        console.log("policy ::", policy)
        const resourceRegex = new RegExp(`resource\\s+"${resourceType}"`, 'g');
        const resourceCount = (text.match(resourceRegex) || []).length;

        console.log("ResourceRegex ::", resourceRegex);
        console.log("resourceCount ::", resourceCount);

        if (resourceCount < policy.min) {
            issues.push(`At least ${policy.min} ${resourceType} required, found ${resourceCount}.`);
        }
        if (resourceCount > policy.max) {
            issues.push(`At most ${policy.max} ${resourceType} allowed, found ${resourceCount}.`);
        }
    });

    return issues;
}

export async function validateScript(document: vscode.TextDocument, jsonFilePath?: string): Promise<string[]> {
    const text = document.getText();
    const issues: string[] = [];

    // Determine the cloud provider based on resource types
    let cloudProvider: 'aws' | 'azure' | null = null;
    if (text.includes('aws_')) {
        cloudProvider = 'aws';
    } else if (text.includes('azurerm_')) {
        cloudProvider = 'azure';
    } else {
        issues.push('No supported cloud provider found in the Terraform script.');
        return issues;
    }

    // Load policies from JSON file, cloud provider, or fallback to defaults
    let policies = defaultPolicies[cloudProvider];
    if (jsonFilePath) {
        const loadedPolicies = await loadJsonPolicies(jsonFilePath, cloudProvider);
        if (loadedPolicies) policies = loadedPolicies;
    }

    if (!policies) {
        policies = await fetchCloudPolicies(cloudProvider);
        if (!policies) policies = defaultPolicies[cloudProvider];
    }

    // Validate the resources based on the dynamically loaded policies
    issues.push(...validateResources(policies, text));

    return issues;
}


