import React from 'react';
import { VSCodeButton, VSCodeCheckbox, VSCodeTextField } from '@vscode/webview-ui-toolkit/react';

const WebviewPanel: React.FC = () => {
  // const vscode = (window as any).acquireVsCodeApi();

  const handleClick = () => {
    // vscode.postMessage({
    //   command: 'webviewAction',
    //   text: 'Action from Webview Panel!',
    // });
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center", // This centers all content horizontally
      justifyContent: "center",
      height: "100vh",
    }}>
      <h1>Extension Setings </h1>
      <VSCodeTextField style={{ width: "45%", marginBottom: "10px" }} placeholder="Auto Download Binary" />
      <VSCodeTextField style={{ width: "45%", marginBottom: "10px" }} placeholder="Policy Code" />
      <VSCodeTextField style={{ width: "45%", marginBottom: "10px" }} placeholder="Global Parameters" />
      <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",  // Align items to the left
        width: "45%",  // Ensures the checkbox is contained within the same width as the text fields
        paddingLeft: "0px", // Remove any unnecessary padding if needed
      }}>
        <VSCodeCheckbox />
        <p style={{marginLeft: "5px"}}>Save on Scan</p>
      </div>
      <VSCodeButton onClick={handleClick} style={{ marginBottom: "10px" }}>
        Click Me
      </VSCodeButton>

      {/* Add a container to align checkbox to the left */}
    </div>
  );
};

export default WebviewPanel;
