// This helper is just a draft for now
// TODO: Do more generic functions, better suffid handling, test folder exists everywhere
// Also maybe some attribute to ask for just name, file name, full name for retrieve
// ex. for record type: MyRecordTypeForAccount, MyRecordTypeForAccount.recordType-meta.xml, Account.MyRecordTypeForAccount
import * as path from 'path';
import * as fs from 'fs';
import { SfProjectJson } from '@salesforce/core';
import { JsonArray, JsonMap } from '@salesforce/ts-types';
const defaultProjectFolder = 'force-app';
const defaultPackageFolder: string = path.join('force-app', 'main', 'default');

export function getMetadata(metadata: string): string[] {
  // TODO: ignore some files
  // like .eslintrc.json and jsconfig.json
  const metadataPath = path.join('force-app', 'main', 'default', metadata);

  // TODO: fix it correctly for all metadata types
  let metadatas: string[] = [];
  if (fs.existsSync(metadataPath)) {
    metadatas = fs.readdirSync(metadataPath, 'utf8').map((m) => m.replace('.profile-meta.xml', ''));
  }

  return metadatas;
}

export function getFieldsForObject(objectName: string): string[] {
  const fieldsPath = path.join('force-app', 'main', 'default', 'objects', objectName, 'fields');

  let fields: string[] = [];
  if (fs.existsSync(fieldsPath)) {
    fields = fs.readdirSync(fieldsPath, 'utf8').map((f) => f.substring(0, f.lastIndexOf('.field-meta.xml')));
  }

  return fields;
}

export function getRecordTypesForObject(objectName: string): string[] {
  const recordTypesPath = path.join('force-app', 'main', 'default', 'objects', objectName, 'recordTypes');

  let recordTypes: string[] = [];
  if (fs.existsSync(recordTypesPath)) {
    recordTypes = fs
      .readdirSync(recordTypesPath, 'utf8')
      .map((f) => `${objectName}.${f.substring(0, f.lastIndexOf('.recordType-meta.xml'))}`);
  }

  return recordTypes;
}

export function getCompactLayoutsForObject(objectName: string): string[] {
  const compactLayoutsPath = path.join('force-app', 'main', 'default', 'objects', objectName, 'compactLayouts');

  let compactLayouts: string[] = [];
  if (fs.existsSync(compactLayoutsPath)) {
    compactLayouts = fs
      .readdirSync(compactLayoutsPath, 'utf8')
      .map((f) => f.substring(0, f.lastIndexOf('.compactLayout-meta.xml')));
  }

  return compactLayouts;
}

export function getLayoutsForObject(objectName: string): string[] {
  const layoutsPath = path.join('force-app', 'main', 'default', 'layouts');

  let layouts: string[] = [];
  if (fs.existsSync(layoutsPath)) {
    layouts = fs
      .readdirSync(layoutsPath, 'utf8')
      .filter((l) => l.startsWith(objectName + '-'))
      .map((l) => l.substring(0, l.lastIndexOf('.layout-meta.xml')));
  }

  return layouts;
}

export async function getDefaultProjectPath(): Promise<string> {
  // Use the vanilla default DX folder if no default project directory is found
  let defaultProjectPath: string = defaultProjectFolder;

  const options = SfProjectJson.getDefaultOptions();
  const project = await SfProjectJson.create(options);

  const packageDirectories = (project.get('packageDirectories') as JsonArray) || [];
  for (let packageDirectory of packageDirectories) {
    packageDirectory = packageDirectory as JsonMap;
    if (packageDirectory.default) {
      defaultProjectPath = packageDirectory.path as string;
    }
  }

  return defaultProjectPath;
}

export async function getDefaultPackagePath(): Promise<string> {
  // Look for a default package directory
  const options = SfProjectJson.getDefaultOptions();
  const project = await SfProjectJson.create(options);
  const packageDirectories = (project.get('packageDirectories') as JsonArray) || [];

  // Use the vanilla default DX folder if no default package directory is found
  let foundPath: string = defaultPackageFolder;
  for (let packageDirectory of packageDirectories) {
    packageDirectory = packageDirectory as JsonMap;

    if (packageDirectory.path && packageDirectory.default) {
      foundPath = path.join(packageDirectory.path as string, 'main', 'default');
      break;
    }
  }

  return foundPath;
}
