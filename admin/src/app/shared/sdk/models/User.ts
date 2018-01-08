/* tslint:disable */
import {
  AccessToken,
  Device,
  Package,
  PackagePurchase,
  UserIdentity,
  UserCredential
} from '../index';

declare var Object: any;
export interface UserInterface {
  "realm"?: string;
  "username"?: string;
  "email": string;
  "emailVerified"?: boolean;
  "id"?: any;
  "password"?: string;
  accessTokens?: AccessToken[];
  devices?: Device[];
  packages?: Package[];
  purchases?: PackagePurchase[];
  profile?: UserIdentity;
  identities?: UserIdentity[];
  credentials?: UserCredential[];
}

export class User implements UserInterface {
  "realm": string;
  "username": string;
  "email": string;
  "emailVerified": boolean;
  "id": any;
  "password": string;
  accessTokens: AccessToken[];
  devices: Device[];
  packages: Package[];
  purchases: PackagePurchase[];
  profile: UserIdentity;
  identities: UserIdentity[];
  credentials: UserCredential[];
  constructor(data?: UserInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `User`.
   */
  public static getModelName() {
    return "User";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of User for dynamic purposes.
  **/
  public static factory(data: UserInterface): User{
    return new User(data);
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
      name: 'User',
      plural: 'Users',
      path: 'Users',
      idName: 'id',
      properties: {
        "realm": {
          name: 'realm',
          type: 'string'
        },
        "username": {
          name: 'username',
          type: 'string'
        },
        "email": {
          name: 'email',
          type: 'string'
        },
        "emailVerified": {
          name: 'emailVerified',
          type: 'boolean'
        },
        "id": {
          name: 'id',
          type: 'any'
        },
        "password": {
          name: 'password',
          type: 'string'
        },
      },
      relations: {
        accessTokens: {
          name: 'accessTokens',
          type: 'AccessToken[]',
          model: 'AccessToken',
          relationType: 'hasMany',
                  keyFrom: 'id',
          keyTo: 'userId'
        },
        devices: {
          name: 'devices',
          type: 'Device[]',
          model: 'Device',
          relationType: 'hasMany',
                  keyFrom: 'id',
          keyTo: 'accountId'
        },
        packages: {
          name: 'packages',
          type: 'Package[]',
          model: 'Package',
          relationType: 'hasMany',
                  keyFrom: 'id',
          keyTo: 'accountId'
        },
        purchases: {
          name: 'purchases',
          type: 'PackagePurchase[]',
          model: 'PackagePurchase',
          relationType: 'hasMany',
                  keyFrom: 'id',
          keyTo: 'accountId'
        },
        profile: {
          name: 'profile',
          type: 'UserIdentity',
          model: 'UserIdentity',
          relationType: 'hasOne',
                  keyFrom: 'id',
          keyTo: 'userId'
        },
        identities: {
          name: 'identities',
          type: 'UserIdentity[]',
          model: 'UserIdentity',
          relationType: 'hasMany',
                  keyFrom: 'id',
          keyTo: 'userId'
        },
        credentials: {
          name: 'credentials',
          type: 'UserCredential[]',
          model: 'UserCredential',
          relationType: 'hasMany',
                  keyFrom: 'id',
          keyTo: 'userId'
        },
      }
    }
  }
}
