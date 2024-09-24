import * as vscode from "vscode";
import { validateTerraformScript } from "./validator";
import { deployTerraformScript } from "./deployment";

export function activate(context: vscode.ExtensionContext) {
  const diagnostics = vscode.languages.createDiagnosticCollection("terraform");
  context.subscriptions.push(diagnostics);

  let disposable = vscode.commands.registerCommand(
    "toolbox.validateTerraform",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const document = editor.document;

        // Prompt user to optionally provide a JSON file path for validation
        const jsonFilePath = await vscode.window.showInputBox({
          prompt: "Enter path to JSON file for validation (optional)",
          placeHolder: "Leave empty if no JSON file",
          ignoreFocusOut: true,
        });

        // Pass the JSON file path to validateTerraformScript if provided
        const issues = await validateTerraformScript(document, jsonFilePath || undefined);

        if (issues.length > 0) {
          vscode.window.showErrorMessage(
            `Validation Failed:\n${issues.join("\n")}`
          );
        } else {
          vscode.window.showInformationMessage("Terraform script is valid!");
          await deployTerraformScript(document);
        }
      }
    }
  );

  context.subscriptions.push(disposable);

  vscode.workspace.onDidSaveTextDocument(async (document) => {
    if (document.languageId === "terraform") {
      // Prompt user to optionally provide a JSON file path for validation when saving
      const jsonFilePath = await vscode.window.showInputBox({
        prompt: "Enter path to JSON file for validation (optional)",
        placeHolder: "Leave empty if no JSON file",
        ignoreFocusOut: true,
      });

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
    }
  });
}

export function deactivate() {}
