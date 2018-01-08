/* tslint:disable */
import { Injectable } from '@angular/core';
import { Device } from '../../models/Device';
import { User } from '../../models/User';
import { AccessToken } from '../../models/AccessToken';
import { UserCredential } from '../../models/UserCredential';
import { UserIdentity } from '../../models/UserIdentity';
import { Package } from '../../models/Package';
import { PackageFile } from '../../models/PackageFile';
import { PackageVersion } from '../../models/PackageVersion';
import { Section } from '../../models/Section';
import { PackageDownload } from '../../models/PackageDownload';
import { PackagePurchase } from '../../models/PackagePurchase';

export interface Models { [name: string]: any }

@Injectable()
export class SDKModels {

  private models: Models = {
    Device: Device,
    User: User,
    AccessToken: AccessToken,
    UserCredential: UserCredential,
    UserIdentity: UserIdentity,
    Package: Package,
    PackageFile: PackageFile,
    PackageVersion: PackageVersion,
    Section: Section,
    PackageDownload: PackageDownload,
    PackagePurchase: PackagePurchase,
    
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
