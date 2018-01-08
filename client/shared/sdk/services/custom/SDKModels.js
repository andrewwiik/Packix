import { Package } from '../../models/Package';
import { PackageFile } from '../../models/PackageFile';
import { PackageVersion } from '../../models/PackageVersion';
import { Section } from '../../models/Section';
export class SDKModels {
  models = {
    Package: Package,
    PackageFile: PackageFile,
    PackageVersion: PackageVersion,
    Section: Section,
    
  };

  get(modelName) {
    return this.models[modelName];
  }

  getAll() {
    return this.models;
  }

  getModelNames() {
    return Object.keys(this.models);
  }
}
