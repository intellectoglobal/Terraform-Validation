import * as vscode from 'vscode';

export class TerraformValidationWebView {
    private panel: vscode.WebviewPanel | undefined;

    constructor(private readonly context: vscode.ExtensionContext) {}

    public createOrShow(): void {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        if (this.panel) {
            this.panel.reveal(column);
            return;
            
        }

        this.panel = vscode.window.createWebviewPanel(
            'terraformValidation', // Internal ID
            'Terraform Validation', // Title of the panel
            vscode.ViewColumn.One, // Display in the first column
            {
                enableScripts: true, // Enable JS in the webview
                localResourceRoots: [
                    vscode.Uri.file(this.context.extensionPath) // Enable local resources
                ]
            }
        );

        // Set the HTML content
        this.panel.webview.html = this.getHtmlForWebView();

        // Handle panel disposal
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });

        // Handle messages from the WebView
        this.panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'validate':
                    this.handleValidationRequest(message.filePath);
                    break;
                case 'close':
                    vscode.window.showInformationMessage('Closing validation view.');
                    this.panel?.dispose();
                    break;
            }
        });
    }

    private getHtmlForWebView(): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Terraform Validation</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }
                    button {
                        background-color: #007acc;
                        color: white;
                        padding: 10px;
                        border: none;
                        cursor: pointer;
                        margin-top: 10px;
                    }
                    button:hover {
                        background-color: #005f99;
                    }
                    #results {
                        margin-top: 20px;
                    }
                    #results p {
                        font-size: 14px;
                        padding: 5px;
                    }
                </style>
            </head>
            <body>
                <h1>Terraform Validation</h1>
                <p>Select a Terraform file for validation:</p>
                <input type="text" id="filePath" placeholder="Enter file path" style="width: 300px;">
                <button onclick="validate()">Validate</button>
                
                <div id="results"></div>
                
                <script>
                    const vscode = acquireVsCodeApi();

                    function validate() {
                        const filePath = document.getElementById('filePath').value;
                        vscode.postMessage({ command: 'validate', filePath: filePath });
                    }

                    window.addEventListener('message', event => {
                        const message = event.data; // The JSON data
                        const resultsDiv = document.getElementById('results');
                        resultsDiv.innerHTML = '';

                        if (message.error) {
                            resultsDiv.innerHTML = '<p style="color: red;">Validation Error: ' + message.error + '</p>';
                        } else {
                            resultsDiv.innerHTML = '<p style="color: green;">Validation Passed: ' + message.success + '</p>';
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }

    private handleValidationRequest(filePath: string) {
        if (!filePath) {
            this.panel?.webview.postMessage({ error: 'No file path provided!' });
            return;
        }

        vscode.window.showInformationMessage(`Validating: ${filePath}`);
        // Simulate validation result
        const isValid = Math.random() > 0.5; // Random success/fail for demo

        if (isValid) {
            this.panel?.webview.postMessage({ success: 'Terraform file is valid!' });
        } else {
            this.panel?.webview.postMessage({ error: 'Terraform file validation failed.' });
        }
    }
}
