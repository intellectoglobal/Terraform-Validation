import * as vscode from "vscode";
import { exec } from "child_process";

export async function deployTerraformScript(document: vscode.TextDocument) {
  const text = document.getText();

  // Determine the cloud provider based on the resource types present in the document
  let cloudProvider: "aws" | "azure" | null = null;

  if (text.includes("aws_")) {
    cloudProvider = "aws";
  } else if (text.includes("azurerm_")) {
    cloudProvider = "azure";
  } else {
    vscode.window.showErrorMessage(
      "No supported cloud provider found in the Terraform script."
    );
    return; // Exit early if no cloud provider is detected
  }

  if (cloudProvider === "aws") {
    // Deploy AWS Terraform script
    vscode.window.showInformationMessage("Deploying AWS Terraform script...");
    try {
      // Use the AWS CLI to deploy
      console.log("enterd in the aws deployment ");
      exec("terraform init", (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.log("enterd in the aws deployment true statement ::", stderr);
          vscode.window.showErrorMessage(
            `Error deploying AWS resources: ${stderr}`
          );
          return;
        }
        console.log("enterd in the aws deployment false statement ");
        vscode.window.showInformationMessage(
          `AWS Deployment successful: ${stdout}`
        );
      });
    } catch (error) {
      vscode.window.showErrorMessage("Failed to deploy AWS resources.");
    }
  } else if (cloudProvider === "azure") {
    // Deploy Azure Terraform script
    console.log("enterd in the azure deployment ");
    vscode.window.showInformationMessage("Deploying Azure Terraform script...");
    try {
      // Use the Azure CLI to deploy
      const { exec } = require("child_process");
      exec("terraform init", (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.log("enterd in the aws deployment true statement ::", stderr);
          vscode.window.showErrorMessage(
            `Error deploying Azure resources: ${stderr}`
          );
          return;
        }
        vscode.window.showInformationMessage(
          `Azure Deployment successful: ${stdout}`
        );
        console.log("enterd in the aws deployment false statement ");
      });
    } catch (error) {
      vscode.window.showErrorMessage("Failed to deploy Azure resources.");
    }
  }
}
