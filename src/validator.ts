import * as vscode from 'vscode';
import axios from 'axios';
import * as fs from 'fs';
const { exec } = require('child_process');

// Function to load validation policies from a local JSON file
async function loadJsonPolicies(jsonPath: string, cloudProvider: string) {
    try {
        const data = fs.readFileSync(jsonPath, 'utf8');
        const formatedData = JSON.parse(data);
        return formatedData[cloudProvider]
    } catch (error) {
        vscode.window.showErrorMessage('Failed to load JSON policies.');
        return null;
    }
}

// Function to fetch policies from cloud providers
async function fetchCloudPolicies(cloudProvider: 'aws' | 'azure') {
    try {
        let response;
        if (cloudProvider === 'aws') {
            // Fetch AWS-specific policies (this is just an example URL)
            response = await axios.get('https://policy-server.aws.example.com/policies');
        } else if (cloudProvider === 'azure') {
            // Fetch Azure-specific policies (this is just an example URL)
            response = await axios.get('https://policy-server.azure.example.com/policies');
        }
        return response?.data?response.data : "";
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to fetch ${cloudProvider.toUpperCase()} policies.`);
        return null;
    }
}

const defaultPolicies = {
    aws: {
        s3_min: 2,
        s3_max: 2,
        ec2_min: 2,
        ec2_max: 3,
    },
    azure: {
        storage_min: 1,
        storage_max: 3,
        vm_min: 1,
        vm_max: 5,
    },
};

export async function validateTerraformScript(document: vscode.TextDocument, jsonFilePath?: string): Promise<string[]> {
    const text = document.getText();
    const issues: string[] = [];
    
    // Determine the cloud provider based on the resource types present in the document
    let cloudProvider: 'aws' | 'azure' | null = null;
    if (text.includes('aws_')) {
        cloudProvider = 'aws';
    } else if (text.includes('azurerm_')) {
        cloudProvider = 'azure';
    } else {
        issues.push('No supported cloud provider found in the Terraform script.');
        return issues;
    }

    // Load policies: from JSON file, cloud provider, or default
    let policies;
    if (jsonFilePath) {
        // Try loading policies from the provided JSON file
        console.log("json file path ::", jsonFilePath)
        policies = await loadJsonPolicies(jsonFilePath, cloudProvider);
        if (!policies) {
            vscode.window.showErrorMessage('Using default policies due to JSON loading failure.');
        }
    }

    if (!policies) {
        // Try fetching policies from the cloud provider if JSON is not provided or failed
        policies = await fetchCloudPolicies(cloudProvider);
    }

    if (!policies) {
        // Fallback to default policies
        policies = defaultPolicies[cloudProvider];
    }

    console.log("police to validate ::", policies)

    // Validation logic based on cloud provider and policies
    if (cloudProvider === 'aws') {
        const s3Resources = (text.match(/resource\s+"aws_s3_bucket"/g) || []).length;
        if (s3Resources < policies.s3_min) {
            issues.push(`At least ${policies.s3_min} S3 buckets required, found ${s3Resources}.`);
        }
        if (s3Resources > policies.s3_max) {
            issues.push(`At most ${policies.s3_max} S3 buckets allowed, found ${s3Resources}.`);
        }

        const ec2Resources = (text.match(/resource\s+"aws_instance"/g) || []).length;
        if (ec2Resources < policies.ec2_min) {
            issues.push(`At least ${policies.ec2_min} EC2 instances required, found ${ec2Resources}.`);
        }
        if (ec2Resources > policies.ec2_max) {
            issues.push(`At most ${policies.ec2_max} EC2 instances allowed, found ${ec2Resources}.`);
        }
    } else if (cloudProvider === 'azure') {
        const storageResources = (text.match(/resource\s+"azurerm_storage_account"/g) || []).length;
        if (storageResources < policies.storage_min) {
            issues.push(`At least ${policies.storage_min} Azure storage accounts required, found ${storageResources}.`);
        }
        if (storageResources > policies.storage_max) {
            issues.push(`At most ${policies.storage_max} Azure storage accounts allowed, found ${storageResources}.`);
        }

        const vmResources = (text.match(/resource\s+"azurerm_windows_virtual_machine"/g) || []).length;
        if (vmResources < policies.vm_min) {
            issues.push(`At least ${policies.vm_min} Azure VMs required, found ${vmResources}.`);
        }
        if (vmResources > policies.vm_max) {
            issues.push(`At most ${policies.vm_max} Azure VMs allowed, found ${vmResources}.`);
        }
    }

    return issues;
}
