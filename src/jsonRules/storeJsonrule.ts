import * as vscode from "vscode";
import * as fs from "fs";
import logger from "../utils/logger";

const JSON_FILE_KEY = "jsonFilePath";

export const storeJsonFilePathService = async (context: vscode.ExtensionContext) => {
  console.log("Entered into the JSON file path function");

  // Retrieve the JSON file path from the global state
  let jsonFilePath = context.globalState.get<string>("jsonFilePath");

  // Check if the stored path exists
  if (jsonFilePath && fs.existsSync(jsonFilePath)) {
    console.log(`Using stored JSON file path: ${jsonFilePath}`);
    return { stored: true, path: jsonFilePath };;
  }

  // If no valid path is found, prompt the user to input a new path
  jsonFilePath = await vscode.window.showInputBox({
    prompt: "Enter path to JSON file for validation (optional)",
    placeHolder: "Leave empty if no JSON file",
    ignoreFocusOut: true,
  });

  // Validate the user-provided path
  if (jsonFilePath && fs.existsSync(jsonFilePath)) {
    context.globalState.update("jsonFilePath", jsonFilePath);
    console.log(`Stored new JSON file path: ${jsonFilePath}`);
    return { stored: true, path: jsonFilePath };
  } else if (jsonFilePath) {
    vscode.window.showErrorMessage(
      "The provided JSON file path does not exist."
    );
  }

  return { stored: true };; // Return undefined if no valid path is provided
};


export const getJsonFilePathService = async (context: vscode.ExtensionContext) => {
  try {
    const jsonFilePath = context.globalState.get<string>(JSON_FILE_KEY);
    return jsonFilePath
  } catch (error) {
    logger.error("Error Occred while Geting the json file path from the session state")
    return ""
  }
}

export const updateJsonFilePathService = async (context: vscode.ExtensionContext) => {
  const jsonFilePath = await vscode.window.showInputBox({
    prompt: "Enter path to JSON file for validation (optional)",
    placeHolder: "Leave empty if no JSON file",
    ignoreFocusOut: true,
  });
  if (jsonFilePath) {
    context.globalState.update(JSON_FILE_KEY, jsonFilePath);
    return true
  }
};
