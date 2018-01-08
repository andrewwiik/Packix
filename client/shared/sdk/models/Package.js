
import {
  PackageVersion,
  Section
} from '../index';


export class Package {
  "name";
  "identifier";
  "shortDescription";
  "minimum";
  "maximum";
  "author";
  "maintainer";
  "visible";
  "stage";
  "latest";
  "detailedDescription";
  "id";
  "sectionId";
  "packageId";
  "accountId";
  versions;
  section;
  downloads;
  purchases;
  constructor(data) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Package`.
   */
  static getModelName() {
    return "Package";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Package for dynamic purposes.
  **/
  static factory(data) {
    return new Package(data);
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
      name: 'Package',
      plural: 'Packages',
      path: 'Packages',
      properties: {
        "name": {
          name: 'name',
          type: 'string'
        },
        "identifier": {
          name: 'identifier',
          type: 'string'
        },
        "shortDescription": {
          name: 'shortDescription',
          type: 'string',
          default: 'An Awesome Mobile Substrate Tweak'
        },
        "minimum": {
          name: 'minimum',
          type: 'string'
        },
        "maximum": {
          name: 'maximum',
          type: 'string'
        },
        "author": {
          name: 'author',
          type: 'string'
        },
        "maintainer": {
          name: 'maintainer',
          type: 'string'
        },
        "visible": {
          name: 'visible',
          type: 'boolean',
          default: true
        },
        "stage": {
          name: 'stage',
          type: 'string',
          default: 'stable'
        },
        "latest": {
          name: 'latest',
          type: 'string'
        },
        "detailedDescription": {
          name: 'detailedDescription',
          type: 'any'
        },
        "id": {
          name: 'id',
          type: 'any'
        },
        "sectionId": {
          name: 'sectionId',
          type: 'any'
        },
        "packageId": {
          name: 'packageId',
          type: 'any'
        },
        "accountId": {
          name: 'accountId',
          type: 'any'
        },
      },
      relations: {
        versions: {
          name: 'versions',
          type: 'PackageVersion[]',
          model: 'PackageVersion'
        },
        section: {
          name: 'section',
          type: 'Section',
          model: 'Section'
        },
        downloads: {
          name: 'downloads',
          type: 'any[]',
          model: ''
        },
        purchases: {
          name: 'purchases',
          type: 'any[]',
          model: ''
        },
      }
    }
  }
}
