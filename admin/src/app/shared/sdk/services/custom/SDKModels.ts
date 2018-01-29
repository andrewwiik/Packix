/* tslint:disable */
import { Injectable } from '@angular/core';
import { User } from '../../models/User';
import { UserIdentity } from '../../models/UserIdentity';
import { Package } from '../../models/Package';
import { PackageFile } from '../../models/PackageFile';
import { PackageVersion } from '../../models/PackageVersion';
import { Section } from '../../models/Section';
import { PackageDownload } from '../../models/PackageDownload';
import { PackageScreenshot } from '../../models/PackageScreenshot';
import { PackageScreenshotFile } from '../../models/PackageScreenshotFile';

export interface Models { [name: string]: any }

@Injectable()
export class SDKModels {

  private models: Models = {
    User: User,
    UserIdentity: UserIdentity,
    Package: Package,
    PackageFile: PackageFile,
    PackageVersion: PackageVersion,
    Section: Section,
    PackageDownload: PackageDownload,
    PackageScreenshot: PackageScreenshot,
    PackageScreenshotFile: PackageScreenshotFile,
    
  };

  public get(modelName: string): any {
    return this.models[modelName];
  }

  public getAll(): Models {
    return this.models;
  }

  public getModelNames(): string[] {
    return Object.keys(this.models);
  }
}
