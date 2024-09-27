import * as vscode from "vscode";
import { validateTerraformScript } from "./services/validator";
import { deployTerraformScript } from "./services/deployment";
import { TerraformValidationWebView } from "./UI/webview";
import { getJsonFilePathService, storeJsonFilePathService, updateJsonFilePathService } from "./jsonRules/storeJsonrule";

const JSON_FILE_KEY = 'jsonFilePath'; // Key to store JSON file path

export function activate(context: vscode.ExtensionContext) {
  const diagnostics = vscode.languages.createDiagnosticCollection("terraform");
  context.subscriptions.push(diagnostics);

  // Function to validate the Terraform document
  const validateDocument = async (document: vscode.TextDocument) => {
    const jsonFilePath = await getJsonFilePathService(context);
    const issues = await validateTerraformScript(document, jsonFilePath);

    const diagnosticsArray: vscode.Diagnostic[] = [];
    issues.forEach((issue) => {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, document.lineCount, 0), // Adjust range based on actual issue location
        issue,
        vscode.DiagnosticSeverity.Error
      );
      diagnosticsArray.push(diagnostic);
    });

    diagnostics.set(document.uri, diagnosticsArray);

    return issues; // Return the issues for further processing
  };

  // Function to deploy the Terraform document
  const deployDocument = async (document: vscode.TextDocument) => {
    try {
      await deployTerraformScript(document);
      vscode.window.showInformationMessage("Terraform script deployed successfully!");
    } catch (error: any) {
      vscode.window.showErrorMessage(`Deployment failed: ${error.message}`);
    }
  };

  // Auto-validation and deployment on save
  vscode.workspace.onDidSaveTextDocument(async (document) => {
    if (document.languageId === "terraform") {
      const issues = await validateDocument(document);
      if (issues.length === 0) {
        await deployDocument(document); // Only deploy if there are no validation issues
      }
    }
  });

  // Auto-validation on open
  vscode.workspace.onDidOpenTextDocument(async (document) => {
    if (document.languageId === "terraform") {
      await validateDocument(document);
    }
  });

  // Command to validate and deploy Terraform with the stored or new JSON file path
  let disposable = vscode.commands.registerCommand(
    "toolbox.validateTerraform",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        const issues = await validateDocument(document);
        if (issues.length === 0) {
          await deployDocument(document);
        }
      }
    }
  );

  context.subscriptions.push(disposable);

  // Command to allow the user to update the JSON file path
  let updateJsonFileDisposable = vscode.commands.registerCommand(
    "toolbox.updateJsonFilePath",
    async () => {
      const newJsonFilePath = await updateJsonFilePathService(context);
      if (newJsonFilePath) {
        vscode.window.showInformationMessage(`JSON file path updated!`);
      }
    }
  );

  context.subscriptions.push(updateJsonFileDisposable);
}

export function deactivate() {}
