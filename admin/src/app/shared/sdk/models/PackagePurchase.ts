/* tslint:disable */
import {
  Package,
  User
} from '../index';

declare var Object: any;
export interface PackagePurchaseInterface {
  "paymentId"?: string;
  "saleId"?: string;
  "isComplete"?: boolean;
  "_json"?: any;
  "id"?: any;
  "accountId"?: any;
  "packageId"?: any;
  "createdOn": Date;
  "updatedOn": Date;
  package?: Package;
  account?: User;
}

export class PackagePurchase implements PackagePurchaseInterface {
  "paymentId": string;
  "saleId": string;
  "isComplete": boolean;
  "_json": any;
  "id": any;
  "accountId": any;
  "packageId": any;
  "createdOn": Date;
  "updatedOn": Date;
  package: Package;
  account: User;
  constructor(data?: PackagePurchaseInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `PackagePurchase`.
   */
  public static getModelName() {
    return "PackagePurchase";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of PackagePurchase for dynamic purposes.
  **/
  public static factory(data: PackagePurchaseInterface): PackagePurchase{
    return new PackagePurchase(data);
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
      name: 'PackagePurchase',
      plural: 'PackagePurchases',
      path: 'PackagePurchases',
      idName: 'id',
      properties: {
        "paymentId": {
          name: 'paymentId',
          type: 'string'
        },
        "saleId": {
          name: 'saleId',
          type: 'string'
        },
        "isComplete": {
          name: 'isComplete',
          type: 'boolean'
        },
        "_json": {
          name: '_json',
          type: 'any'
        },
        "id": {
          name: 'id',
          type: 'any'
        },
        "accountId": {
          name: 'accountId',
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
          relationType: 'hasOne',
                  keyFrom: 'id',
          keyTo: 'packageId'
        },
        account: {
          name: 'account',
          type: 'User',
          model: 'User',
          relationType: 'belongsTo',
                  keyFrom: 'accountId',
          keyTo: 'id'
        },
      }
    }
  }
}
