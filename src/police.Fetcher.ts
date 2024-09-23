import { DefaultAzureCredential } from "@azure/identity";
import { PolicyClient, PolicyDefinition } from "@azure/arm-policy";
const AWS = require('aws-sdk'); // Use ES Module import for consistency

const iam = new AWS.IAM();

// Function to fetch Azure Policies
async function fetchAzurePolicies(subscriptionId: string) {
    try {
        const credential = new DefaultAzureCredential();
        const client = new PolicyClient(credential, subscriptionId);

        const policies: PolicyDefinition[] = [];
        
        // Iterate through the paginated results for Azure policies
        for await (const policy of client.policyDefinitions.list()) {
            policies.push(policy);
        }

        // Map through the array of Azure policies
        return policies.map(policy => ({
            name: policy.name,
            displayName: policy.displayName,
            policyType: policy.policyType,
        }));
    } catch (error) {
        console.error('Error fetching Azure policies:', error);
        return []; // Return an empty array in case of error
    }
}

// Function to fetch AWS IAM Policies
async function fetchAWSPolicies() {
    try {
        const data = await iam.listPolicies({ Scope: 'Local' }).promise();

        // Map through the array of AWS IAM policies
        return data.Policies.map((policy: { PolicyName: string; Arn: string; }) => ({
            name: policy.PolicyName,
            arn: policy.Arn,
        }));
    } catch (error) {
        console.error('Error fetching AWS policies:', error);
        return []; // Return an empty array in case of error
    }
}

// Example usage
async function main() {
    const subscriptionId = "your-subscription-id"; // Replace with actual Azure Subscription ID
    const azurePolicies = await fetchAzurePolicies(subscriptionId);
    const awsPolicies = await fetchAWSPolicies();

    console.log('Azure Policies:', azurePolicies);
    console.log('AWS Policies:', awsPolicies);
}

main();
