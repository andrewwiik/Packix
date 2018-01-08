/* tslint:disable */
import {
  Package,
  PackageFile,
  PackageDownload
} from '../index';

declare var Object: any;
export interface PackageVersionInterface {
  "version": string;
  "changes"?: Array<any>;
  "dependencies"?: string;
  "visible"?: boolean;
  "raw"?: any;
  "downloadCount"?: number;
  "id"?: any;
  "packageId"?: any;
  "createdOn": Date;
  "updatedOn": Date;
  package?: Package;
  file?: PackageFile;
  downloads?: PackageDownload[];
}

export class PackageVersion implements PackageVersionInterface {
  "version": string;
  "changes": Array<any>;
  "dependencies": string;
  "visible": boolean;
  "raw": any;
  "downloadCount": number;
  "id": any;
  "packageId": any;
  "createdOn": Date;
  "updatedOn": Date;
  package: Package;
  file: PackageFile;
  downloads: PackageDownload[];
  constructor(data?: PackageVersionInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `PackageVersion`.
   */
  public static getModelName() {
    return "PackageVersion";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of PackageVersion for dynamic purposes.
  **/
  public static factory(data: PackageVersionInterface): PackageVersion{
    return new PackageVersion(data);
  }
  /**
  * @method getModelDefinition
  * @author Julien Ledun
  * @license MIT
  * This method returns an object that represents some of the model
  * definitions.
  **/
  public static getModelDefinition() {
    return {
      name: 'PackageVersion',
      plural: 'PackageVersions',
      path: 'PackageVersions',
      idName: 'id',
      properties: {
        "version": {
          name: 'version',
          type: 'string'
        },
        "changes": {
          name: 'changes',
          type: 'Array&lt;any&gt;'
        },
        "dependencies": {
          name: 'dependencies',
          type: 'string'
        },
        "visible": {
          name: 'visible',
          type: 'boolean',
          default: true
        },
        "raw": {
          name: 'raw',
          type: 'any'
        },
        "downloadCount": {
          name: 'downloadCount',
          type: 'number'
        },
        "id": {
          name: 'id',
          type: 'any'
        },
        "packageId": {
          name: 'packageId',
          type: 'any'
        },
        "createdOn": {
          name: 'createdOn',
          type: 'Date'
        },
        "updatedOn": {
          name: 'updatedOn',
          type: 'Date'
        },
      },
      relations: {
        package: {
          name: 'package',
          type: 'Package',
          model: 'Package',
          relationType: 'belongsTo',
                  keyFrom: 'packageId',
          keyTo: 'id'
        },
        file: {
          name: 'file',
          type: 'PackageFile',
          model: 'PackageFile',
          relationType: 'hasOne',
                  keyFrom: 'id',
          keyTo: 'packageVersionId'
        },
        downloads: {
          name: 'downloads',
          type: 'PackageDownload[]',
          model: 'PackageDownload',
          relationType: 'hasMany',
                  keyFrom: 'id',
          keyTo: 'versionId'
        },
      }
    }
  }
}
