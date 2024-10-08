import * as vscode from 'vscode';
import * as fs from 'fs';
import hclToJson from 'hcl-to-json';
import path from 'path';

let policies: any = {
  "aws_s3_bucket": {
    "required": ["versioning", "logging"],
    "forbidden": ["public_access_block"],
    "conditions": {
      "versioning": {
        "state": "Enabled"
      },
      "encryption": {
        "allowed_values": ["AES256", "aws:kms"]
      }
    }
  },
  "aws_instance": {
    "required": ["instance_type", "ami"],
    "forbidden": ["user_data"],
    "conditions": {
      "instance_type": {
        "allowed_values": ["t2.micro", "t2.small", "t3.micro"]
      },
      "ami": {
        "allowed_values": ["ami-12345678", "ami-87654321"]
      }
    }
  },
  "aws_security_group": {
    "required": ["ingress", "egress"],
    "forbidden": ["cidr_blocks"],
    "conditions": {
      "ingress": {
        "protocol": {
          "allowed_values": ["tcp", "udp"]
        },
        "from_port": {
          "min_value": 1,
          "max_value": 65535
        }
      },
      "egress": {
        "protocol": {
          "allowed_values": ["tcp", "udp"]
        },
        "to_port": {
          "min_value": 1,
          "max_value": 65535
        }
      }
    }
  }
}
;

// Load JSON policy file
// function loadPolicies() {
//   const policyFile = path.join(vscode.workspace.rootPath || '', 'terraform-policy.json'); // Use path.join to construct the file path
//   if (fs.existsSync(policyFile)) {
//       const policyData = fs.readFileSync(policyFile, 'utf-8');
//       policies = JSON.parse(policyData);
//   } else {
//       console.error('Policy file not found at:', policyFile); // Log an error if the file does not exist
//   }
// }

// This function will be called when the extension activates
export function activate(context: vscode.ExtensionContext) {
    // Load policies on activation
    // loadPolicies();

    // Register a document change listener
    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
        if (document.languageId === 'terraform') {
            validateTerraform(document);
        }
    });

    // Register command to manually validate
    let disposable = vscode.commands.registerCommand('toolbox.validateTerraform', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            validateTerraform(editor.document);
        }
    });

    context.subscriptions.push(disposable);
}

// Validate the Terraform file based on JSON rules
function validateTerraform(document: vscode.TextDocument) {
    const diagnostics: vscode.Diagnostic[] = [];
    const terraformCode = document.getText();

    // Parse the .tf file using hcl-to-json
    const parsedTf = hclToJson(terraformCode);
    const resources = parsedTf.resource;

  
    // Traverse through parsed resources
    if (parsedTf && resources) {
        // Iterate through the resource types
        Object.keys(resources).forEach(resourceType => {
            console.log("resource name ::", resourceType)
            const resourceInstances = resources[resourceType];
            console.log("resource Attribute ::", resourceInstances)
            validateResource(resources, diagnostics, document);
            // Now, iterate over each resource instance
            // Object.keys(resourceInstances).forEach(resourceName => {
            //     const resource = resourceInstances[resourceName];
            //     // Call your validation function here
            //     // validateResource(resource, diagnostics, document);
            // });
        });
    }

    // Set diagnostics for the file
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('terraform');
    diagnosticCollection.set(document.uri, diagnostics);
}

// Validate a resource based on developer-defined JSON policies
function validateResource(resource: any, diagnostics: vscode.Diagnostic[], document: vscode.TextDocument) {
  const resourceType = Object.keys(resource)[0];
  const resourceAttributes = resource[resourceType];
  console.log("resource type ::", resource[resourceType])
  console.log("resource attributes ::", resourceAttributes)
  console.log("policies conditions ::", policies[resourceType])


  if (policies[resourceType]) {
      console.log("entered in the true statement block ::")
      const policy = policies[resourceType];

      // Check required attributes
      if (policy.required) {
          policy.required.forEach((req: string) => {
              if (!resourceAttributes[req]) {
                  const range = findRange(document, req, resourceType);
                  diagnostics.push(new vscode.Diagnostic(
                      range,
                      `${req} is required in ${resourceType}`,
                      vscode.DiagnosticSeverity.Error
                  ));
              }
          });
      }

      // Check forbidden attributes
      if (policy.forbidden) {
          policy.forbidden.forEach((forbid: string) => {
              if (resourceAttributes[forbid]) {
                  const range = findRange(document, forbid, resourceType);
                  diagnostics.push(new vscode.Diagnostic(
                      range,
                      `${forbid} is forbidden in ${resourceType}`,
                      vscode.DiagnosticSeverity.Error
                  ));
              }
          });
      }

      // Check conditions
      if (policy.conditions) {
          Object.keys(policy.conditions).forEach((condition: string) => {
              if (resourceAttributes[condition]) {
                  const conditionRules = policy.conditions[condition];
                  if (conditionRules.allowed_values &&
                      !conditionRules.allowed_values.includes(resourceAttributes[condition])) {
                      const range = findRange(document, condition, resourceType);
                      diagnostics.push(new vscode.Diagnostic(
                          range,
                          `${condition} must be one of ${conditionRules.allowed_values.join(', ')} in ${resourceType}`,
                          vscode.DiagnosticSeverity.Error
                      ));
                  }
              }
          });
      }
  }
}

// Find the range of the attribute in the document for diagnostics
function findRange(document: vscode.TextDocument, attribute: string, resourceType: string): vscode.Range {
  const text = document.getText();
  const resourceRegex = new RegExp(`${resourceType}\\s+{[\\s\\S]*?}`, 'g');
  const match = resourceRegex.exec(text);

  if (match) {
      const resourceBlock = match[0];
      const attributeIndex = resourceBlock.indexOf(attribute);
      if (attributeIndex !== -1) {
          const startPos = document.positionAt(match.index + attributeIndex);
          const endPos = document.positionAt(match.index + attributeIndex + attribute.length);
          return new vscode.Range(startPos, endPos);
      }
  }
  
  // Fallback to the start of the document if not found
  return new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));
}

