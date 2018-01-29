


export class PackageScreenshotFile {
  "width";
  "height";
  "sizeKey";
  "fileId";
  "screenshotId";
  "id";
  "createdOn";
  "updatedOn";
  constructor(data) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `PackageScreenshotFile`.
   */
  static getModelName() {
    return "PackageScreenshotFile";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of PackageScreenshotFile for dynamic purposes.
  **/
  static factory(data) {
    return new PackageScreenshotFile(data);
  }
  /**
  * @method getModelDefinition
  * @author Julien Ledun
  * @license MIT
  * This method returns an object that represents some of the model
  * definitions.
  **/
  static getModelDefinition() {
    return {
      name: 'PackageScreenshotFile',
      plural: 'PackageScreenshotFiles',
      path: 'PackageScreenshotFiles',
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
