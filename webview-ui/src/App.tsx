import { vscode } from "./utilities/vscode";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidbar";
import WebviewPanel from "./components/WebviewPanel";
function App() {
  function handleHowdyClick() {
    vscode.postMessage({
      command: "hello",
      text: "Hey there partner! 🤠",
    });
  }

  return (
    <main>
      <Router>
        <Routes>
          <Route path="/sidebar" element={<Sidebar />} />
          <Route path="/main" element={<WebviewPanel />} />
        </Routes>
        <VSCodeButton onClick={handleHowdyClick}>Click Me</VSCodeButton>
      </Router>
    </main>
  );
}

export default App;
