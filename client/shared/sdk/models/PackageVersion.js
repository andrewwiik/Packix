
import {
  Package,
  PackageFile
} from '../index';


export class PackageVersion {
  "version";
  "changes";
  "dependencies";
  "visible";
  "raw";
  "id";
  "packageId";
  package;
  file;
  downloads;
  constructor(data) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `PackageVersion`.
   */
  static getModelName() {
    return "PackageVersion";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of PackageVersion for dynamic purposes.
  **/
  static factory(data) {
    return new PackageVersion(data);
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
      name: 'PackageVersion',
      plural: 'PackageVersions',
      path: 'PackageVersions',
      properties: {
        "version": {
          name: 'version',
          type: 'string'
        },
        "changes": {
          name: 'changes',
          type: 'string'
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
        "id": {
          name: 'id',
          type: 'any'
        },
        "packageId": {
          name: 'packageId',
          type: 'any'
        },
      },
      relations: {
        package: {
          name: 'package',
          type: 'Package',
          model: 'Package'
        },
        file: {
          name: 'file',
          type: 'PackageFile',
          model: 'PackageFile'
        },
        downloads: {
          name: 'downloads',
          type: 'any[]',
          model: ''
        },
      }
    }
  }
}
