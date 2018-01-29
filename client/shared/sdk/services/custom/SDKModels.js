import { User } from '../../models/User';
import { UserIdentity } from '../../models/UserIdentity';
import { Package } from '../../models/Package';
import { PackageFile } from '../../models/PackageFile';
import { PackageVersion } from '../../models/PackageVersion';
import { Section } from '../../models/Section';
import { PackageDownload } from '../../models/PackageDownload';
import { PackageScreenshot } from '../../models/PackageScreenshot';
import { PackageScreenshotFile } from '../../models/PackageScreenshotFile';
import { PackageVersionRating } from '../../models/PackageVersionRating';
import { PackageVersionReview } from '../../models/PackageVersionReview';
export class SDKModels {
  models = {
    User: User,
    UserIdentity: UserIdentity,
    Package: Package,
    PackageFile: PackageFile,
    PackageVersion: PackageVersion,
    Section: Section,
    PackageDownload: PackageDownload,
    PackageScreenshot: PackageScreenshot,
    PackageScreenshotFile: PackageScreenshotFile,
    PackageVersionRating: PackageVersionRating,
    PackageVersionReview: PackageVersionReview,
    
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
