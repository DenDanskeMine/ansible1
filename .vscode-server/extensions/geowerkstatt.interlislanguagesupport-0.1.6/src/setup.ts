import * as vscode from "vscode";
import { ModelImplementationProvider } from "./ModelImplementationProvider";
import * as fs from "fs";
import path = require("path");
import os = require("os");

const tempdir = path.join(os.tmpdir(), "InterlisLanguageSupport");

export function activate(context: vscode.ExtensionContext) {
  if (fs.existsSync(tempdir)) {
    fs.rmdirSync(tempdir, { recursive: true });
  }
  const disposable = vscode.languages.registerImplementationProvider("INTERLIS2", new ModelImplementationProvider());
  context.subscriptions.push(disposable);
}

export function deactivate() {
  console.log("INTERLIS Plugin deactivated.");
}
