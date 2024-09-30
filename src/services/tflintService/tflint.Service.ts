import logger from "../../utils/logger";
import { exec } from "child_process";
import * as vscode from "vscode";

export const validateSyntaxUsingTflintService = async (document: vscode.TextDocument): Promise<void> => {
    try {
        // Get the directory of the active document
        const directory = vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath;

        if (!directory) {
            vscode.window.showErrorMessage("No workspace folder found.");
            return;
        }

        logger.info("Using directory for tflint:", directory);

        exec("tflint", { cwd: directory }, (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
                vscode.window.showErrorMessage(`Error running tflint: ${stderr}`);
                logger.error("tflint execution error:", error);
                return;
            }

            logger.info("tflint output:", stdout);
            // Parse tflint output for diagnostics
            const diagnostics: vscode.Diagnostic[] = [];
            const outputLines = stdout.split("\n");
            for (const line of outputLines) {
                const match = line.match(/^(.*?):(\d+):\s+(.*)/);
                if (match) {
                    const filePath = match[1];
                    const lineNumber = parseInt(match[2], 10);
                    const message = match[3];

                    const range = new vscode.Range(
                        new vscode.Position(lineNumber - 1, 0),
                        new vscode.Position(lineNumber - 1, 0)
                    );

                    const diagnostic = new vscode.Diagnostic(
                        range,
                        message,
                        vscode.DiagnosticSeverity.Error
                    );

                    diagnostics.push(diagnostic);
                }
            }

            const uri = document.uri;
            const diagnosticCollection = vscode.languages.createDiagnosticCollection("terraform");
            diagnosticCollection.set(uri, diagnostics);

            if (diagnostics.length > 0) {
                logger.info("tflint output diagnostics added:", diagnostics);
            } else {
                vscode.window.showInformationMessage("No issues found by tflint.");
            }
        });
    } catch (err) {
        logger.error("Error occurred in the validateSyntaxUsingTflintService:", err);
        vscode.window.showErrorMessage(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
    }
};
