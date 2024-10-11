import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import React from 'react';

const Sidebar: React.FC = () => {
  const vscode = (window as any).acquireVsCodeApi();

  function handleHowdyClick() {
    vscode.postMessage({
      command: "hello",
      text: "your logged in! 🤠",
    });
  }

  return (
    <main>
      <h3>validate your terraform</h3>
      <VSCodeButton onClick={handleHowdyClick}>please login!</VSCodeButton>
    </main>
  );
};

export default Sidebar;
