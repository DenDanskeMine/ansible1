import {
  TextDocument,
  Position,
  CancellationToken,
  ProviderResult,
  Definition,
  Uri,
  ImplementationProvider,
  LocationLink,
  Location,
  Range,
} from "vscode";
import fetch from "node-fetch";
import * as fs from "fs";
import path = require("path");
import os = require("os");

const tempdir = path.join(os.tmpdir(), "InterlisLanguageSupport");

export class ModelImplementationProvider implements ImplementationProvider {
  readonly ModelReferenceRegex = new RegExp("(?:MODEL|IMPORTS|TRANSLATION OF)\\s+(\\w*)", "gi");

  provideImplementation(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): ProviderResult<Definition | LocationLink[]> {
    return this.provideImplementationAsync(document, position, token);
  }

  async provideImplementationAsync(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Promise<Definition | undefined> {
    const modelNamesOnLine = this.parseReferencedModels(document, position);

    const wordRange = document.getWordRangeAtPosition(position);
    const modelName = document.getText(wordRange);

    if (!modelNamesOnLine.includes(modelName)) {
      return undefined;
    }

    const availableModels = await this.getModelsFromApi(modelName);

    if (!availableModels) {
      return undefined;
    }

    const locationPromises = availableModels.filter((m) => m.name === modelName).map(this.getImplementationFile);
    return await Promise.all(locationPromises);
  }

  async getImplementationFile(model: Model): Promise<Location> {
    const filePath = path.join(tempdir, model.uri.authority, model.file);

    if (!fs.existsSync(path.parse(filePath).dir)) {
      fs.mkdirSync(path.parse(filePath).dir, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
      const buffer = await fetch(model.uri.toString()).then((response) => response.buffer());

      fs.writeFileSync(filePath, buffer, { flag: "w" });
    }

    return new Location(Uri.file(filePath), new Range(0, 0, 0, 0));
  }

  parseReferencedModels(document: TextDocument, position: Position) {
    const line = document.lineAt(position.line);
    const matches = [...line.text.matchAll(this.ModelReferenceRegex)];
    return matches.map((m) => m[1]);
  }

  async getModelsFromApi(modelName: string) {
    try {
      const repository = await fetch("https://ilimodels.ch/search?query=" + modelName).then(async (response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(
          "Could not retrieve implementations from API. HTTP status: " +
            response.status +
            " Body: " +
            (await response.text())
        );
      });
      return this.getModelsFromRepository(repository);
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  getModelsFromRepository(rootRepository: any): Array<Model> {
    const models = Array<Model>();

    const rootUri = Uri.parse(rootRepository.uri);
    rootRepository.models.forEach((model: any) => {
      models.push({
        repository: rootUri,
        name: model.name,
        file: model.file,
        uri: Uri.joinPath(rootUri, model.file),
      });
    });

    rootRepository.subsidiarySites.forEach((subRepo: any) => {
      const subModels = this.getModelsFromRepository(subRepo);
      models.push(...subModels);
    });

    return models;
  }
}

interface Model {
  repository: Uri;
  name: string;
  file: string;
  uri: Uri;
}
