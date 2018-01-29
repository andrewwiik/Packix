/* tslint:disable */

declare var Object: any;
export interface PackageScreenshotFileInterface {
  "width": number;
  "height": number;
  "sizeKey": string;
  "fileId": string;
  "screenshotId": string;
  "id"?: any;
  "createdOn": Date;
  "updatedOn": Date;
}

export class PackageScreenshotFile implements PackageScreenshotFileInterface {
  "width": number;
  "height": number;
  "sizeKey": string;
  "fileId": string;
  "screenshotId": string;
  "id": any;
  "createdOn": Date;
  "updatedOn": Date;
  constructor(data?: PackageScreenshotFileInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `PackageScreenshotFile`.
   */
  public static getModelName() {
    return "PackageScreenshotFile";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of PackageScreenshotFile for dynamic purposes.
  **/
  public static factory(data: PackageScreenshotFileInterface): PackageScreenshotFile{
    return new PackageScreenshotFile(data);
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
      name: 'PackageScreenshotFile',
      plural: 'PackageScreenshotFiles',
      path: 'PackageScreenshotFiles',
      idName: 'id',
      properties: {
        "width": {
          name: 'width',
          type: 'number'
        },
        "height": {
          name: 'height',
          type: 'number'
        },
        "sizeKey": {
          name: 'sizeKey',
          type: 'string'
        },
        "fileId": {
          name: 'fileId',
          type: 'string'
        },
        "screenshotId": {
          name: 'screenshotId',
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
