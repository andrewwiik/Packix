/* tslint:disable */
import {
  User
} from '../index';

declare var Object: any;
export interface DeviceInterface {
  "udid": string;
  "deviceModel": string;
  "id"?: any;
  "accountId"?: any;
  account?: User;
}

export class Device implements DeviceInterface {
  "udid": string;
  "deviceModel": string;
  "id": any;
  "accountId": any;
  account: User;
  constructor(data?: DeviceInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Device`.
   */
  public static getModelName() {
    return "Device";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Device for dynamic purposes.
  **/
  public static factory(data: DeviceInterface): Device{
    return new Device(data);
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
      name: 'Device',
      plural: 'Devices',
      path: 'Devices',
      idName: 'id',
      properties: {
        "udid": {
          name: 'udid',
          type: 'string'
        },
        "deviceModel": {
          name: 'deviceModel',
          type: 'string'
        },
        "id": {
          name: 'id',
          type: 'any'
        },
        "accountId": {
          name: 'accountId',
          type: 'any'
        },
      },
      relations: {
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
