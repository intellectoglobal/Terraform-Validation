import * as vscode from "vscode";
import { deployTerraformScript, validateTerraformScript } from "./validator";

export function activate(context: vscode.ExtensionContext) {
  const diagnostics = vscode.languages.createDiagnosticCollection("terraform");
  context.subscriptions.push(diagnostics);

  let disposable = vscode.commands.registerCommand(
    "toolbox.validateTerraform",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const document = editor.document;
        const issues = await validateTerraformScript(document);

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
      const issues = await validateTerraformScript(document);
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
