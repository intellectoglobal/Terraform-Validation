import { commands, ExtensionContext, window } from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import { SidebarPanel } from "./panels/sideBarPanel";

export function activate(context: ExtensionContext) {
  // Create the show hello world command
  const showHelloWorldCommand = commands.registerCommand("hello-world.showHelloWorld", () => {
    HelloWorldPanel.render(context.extensionUri);
  });

  // Add command to the extension context
  context.subscriptions.push(showHelloWorldCommand);


  const sidebarProvider = new SidebarPanel(context.extensionUri);

  // Register the sidebar panel to display in the view container (e.g., explorer sidebar)
  context.subscriptions.push(
    window.registerWebviewViewProvider(SidebarPanel.viewType, sidebarProvider)
  );
}
