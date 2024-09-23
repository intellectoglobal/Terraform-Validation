import * as vscode from 'vscode';
import axios from 'axios';
const { exec } = require('child_process');


async function fetchPolicies() {
    try {
        const response = await axios.get('https://policy-server.example.com/policies');
        return response.data;
    } catch (error) {
        vscode.window.showErrorMessage('Failed to fetch policies.');
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

export async function validateTerraformScript(document: vscode.TextDocument): Promise<string[]> {
    const text = document.getText();
    console.log("Text from the Terraform script:", text);
    const issues: string[] = [];

    // Determine the cloud provider based on the resource types present in the document
    let cloudProvider: 'aws' | 'azure' | null = null;

    if (text.includes('aws_')) {
        cloudProvider = 'aws';
    } else if (text.includes('azurerm_')) {
        cloudProvider = 'azure';
    } else {
        issues.push('No supported cloud provider found in the Terraform script.');
        return issues; // Exit early if no cloud provider is detected
    }

    const policies = await fetchPolicies() || defaultPolicies[cloudProvider];

    console.log("policies ::",policies)

    if (cloudProvider === 'aws') {
        // AWS validation
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
            issues.push(`At most ${policies.aws.ec2_max} EC2 instances allowed, found ${ec2Resources}.`);
        }
    } else if (cloudProvider === 'azure') {
        // Azure validation
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

export async function deployTerraformScript(document: vscode.TextDocument) {
    const text = document.getText();

    // Determine the cloud provider based on the resource types present in the document
    let cloudProvider: 'aws' | 'azure' | null = null;

    if (text.includes('aws_')) {
        cloudProvider = 'aws';
    } else if (text.includes('azurerm_')) {
        cloudProvider = 'azure';
    } else {
        vscode.window.showErrorMessage('No supported cloud provider found in the Terraform script.');
        return; // Exit early if no cloud provider is detected
    }

    if (cloudProvider === 'aws') {
        // Deploy AWS Terraform script
        vscode.window.showInformationMessage('Deploying AWS Terraform script...');
        try {
            // Use the AWS CLI to deploy
            console.log("enterd in the aws deployment ")
            exec('terraform init', (error: any, stdout: any, stderr: any) => {
                if (error) {
                    console.log("enterd in the aws deployment true statement ::", stderr)
                    vscode.window.showErrorMessage(`Error deploying AWS resources: ${stderr}`);
                    return;
                }
                console.log("enterd in the aws deployment flse statement ")
                vscode.window.showInformationMessage(`AWS Deployment successful: ${stdout}`);
            });
        } catch (error) {
            vscode.window.showErrorMessage('Failed to deploy AWS resources.');
        }
    } else if (cloudProvider === 'azure') {
        // Deploy Azure Terraform script
        console.log("enterd in the azure deployment ")
        vscode.window.showInformationMessage('Deploying Azure Terraform script...');
        try {
            // Use the Azure CLI to deploy
            const { exec } = require('child_process');
            exec('terraform init', (error: any, stdout: any, stderr: any) => {
                if (error) {
                    console.log("enterd in the aws deployment true statement ::", stderr)
                    vscode.window.showErrorMessage(`Error deploying Azure resources: ${stderr}`);
                    return;
                }
                vscode.window.showInformationMessage(`Azure Deployment successful: ${stdout}`);
                console.log("enterd in the aws deployment flse statement ")
            });
        } catch (error) {
            vscode.window.showErrorMessage('Failed to deploy Azure resources.');
        }
    }
}

export function deactivate() { }
