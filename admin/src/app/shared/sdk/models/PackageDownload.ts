/* tslint:disable */

declare var Object: any;
export interface PackageDownloadInterface {
  "packageId": string;
  "versionId": any;
  "device-ip": string;
  "device-udid"?: string;
  "device-model"?: string;
  "device-firmware"?: string;
  "country-code"?: string;
  "id"?: any;
  "createdOn": Date;
  "updatedOn": Date;
}

export class PackageDownload implements PackageDownloadInterface {
  "packageId": string;
  "versionId": any;
  "device-ip": string;
  "device-udid": string;
  "device-model": string;
  "device-firmware": string;
  "country-code": string;
  "id": any;
  "createdOn": Date;
  "updatedOn": Date;
  constructor(data?: PackageDownloadInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `PackageDownload`.
   */
  public static getModelName() {
    return "PackageDownload";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of PackageDownload for dynamic purposes.
  **/
  public static factory(data: PackageDownloadInterface): PackageDownload{
    return new PackageDownload(data);
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
      name: 'PackageDownload',
      plural: 'PackageDownloads',
      path: 'PackageDownloads',
      idName: 'id',
      properties: {
        "packageId": {
          name: 'packageId',
          type: 'string'
        },
        "versionId": {
          name: 'versionId',
          type: 'any'
        },
        "device-ip": {
          name: 'device-ip',
          type: 'string',
          default: '127.0.0.1'
        },
        "device-udid": {
          name: 'device-udid',
          type: 'string'
        },
        "device-model": {
          name: 'device-model',
          type: 'string'
        },
        "device-firmware": {
          name: 'device-firmware',
          type: 'string'
        },
        "country-code": {
          name: 'country-code',
          type: 'string'
        },
        "id": {
          name: 'id',
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
      }
    }
  }
}
