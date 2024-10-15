import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import React, { useState } from "react";
import WebviewPanel from "./WebviewPanel"; // Import the WebviewPanel component

const Sidebar: React.FC = () => {
  const [isLogged, setIsLogged] = useState(false);
  const [username, setUsername] = useState(""); // State to store username
  const [password, setPassword] = useState(""); // State to store password
  const [errorMessage, setErrorMessage] = useState(""); // State to store error message

  const handleLogin = () => {
    // Here you could add any validation or authentication logic
    if (username && password) {
      setIsLogged(true); // Switch to the WebviewPanel component
      setErrorMessage(""); // Clear any existing error message
    } else {
      setErrorMessage("Please enter both username and password."); // Set error message
    }
  };

  const handleLogout = () => {
    setIsLogged(false);
    setUsername("");
    setPassword("");
    setErrorMessage(""); // Clear error message when logging out
  };

  // Function to render the login form
  const renderLoginForm = () => (
    <>
      <VSCodeTextField
        placeholder="User Name"
        value={username}
        onInput={(e: any) => setUsername(e.target.value)}
      />
      <VSCodeTextField
        placeholder="Password"
        type="password"
        value={password}
        onInput={(e: any) => setPassword(e.target.value)}
      />
      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
        <VSCodeButton onClick={handleLogin}>Login</VSCodeButton>
        <VSCodeButton onClick={handleLogout}>Cancel</VSCodeButton>
      </div>
      {errorMessage && (
        <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p> // Display error message
      )}
    </>
  );

  // Conditionally render the login form or WebviewPanel
  return (
    <main>
      <h2>Welcome!</h2>
      <h3>Validate your Terraform</h3>
      {isLogged ? (
        <WebviewPanel /> // Render the WebviewPanel component after a successful login
      ) : (
        renderLoginForm() // Render the login form
      )}
    </main>
  );
};

export default Sidebar;