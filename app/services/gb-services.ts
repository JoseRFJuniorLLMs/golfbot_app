/* tslint:disable */
import {Injectable, Inject, Optional} from '@angular/core';
import {Http, Headers, Request, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/share';

export interface LoopBackFilterInterface {
  fields?: any;
  include?: any;
  limit?: any;
  order?: any;
  skip?: any;
  offset?: any;
  where?: any;
}

class LoopBackAuth {
  protected accessTokenId: any;
  protected currentUserId: any;
  protected rememberMe: boolean;
  protected currentUserData: any;

  protected propsPrefix: string = '$LoopBack$';

  constructor() {
    this.accessTokenId = this.load("accessTokenId");
    this.currentUserId = this.load("currentUserId");
    this.rememberMe = this.load("rememberMe");
    this.currentUserData = null;
  }

  public setRememberMe(value: boolean): LoopBackAuth {
    this.rememberMe = value;
    return this;
  }

  public getCurrentUserId(): any {
    return this.currentUserId;
  }

  public setCurrentUserData(data: any): LoopBackAuth {
    this.currentUserData = data;
    return this;
  }

  public getCurrentUserData(): any {
    return this.currentUserData;
  }

  public getAccessTokenId(): any {
    return this.accessTokenId;
  }

  public save() {
    var storage = this.rememberMe ? localStorage : sessionStorage;
    this.saveThis(storage, "accessTokenId", this.accessTokenId);
    this.saveThis(storage, "currentUserId", this.currentUserId);
    this.saveThis(storage, "rememberMe", this.rememberMe);
  };

  public setUser(accessTokenId: any, userId: any, userData: any) {
    this.accessTokenId = accessTokenId;
    this.currentUserId = userId;
    this.currentUserData = userData;
  }

  public clearUser() {
    this.accessTokenId = null;
    this.currentUserId = null;
    this.currentUserData = null;
  }

  public clearStorage() {
    this.saveThis(sessionStorage, "accessTokenId", null);
    this.saveThis(localStorage, "accessTokenId", null);
    this.saveThis(sessionStorage, "currentUserId", null);
    this.saveThis(localStorage, "currentUserId", null);
    this.saveThis(sessionStorage, "rememberMe", null);
    this.saveThis(localStorage, "rememberMe", null);
  };

  // Note: LocalStorage converts the value to string
  // We are using empty string as a marker for null/undefined values.
  protected saveThis(storage: any, name: string, value: any) {
    try {
      var key = this.propsPrefix + name;
      if (value == null) {
        value = '';
      }
      storage[key] = value;
    }
    catch(err) {
      console.log('Cannot access local/session storage:', err);
    }
  }

  protected load(name: string): any {
    var key = this.propsPrefix + name;
    return localStorage[key] || sessionStorage[key] || null;
  }
}

let auth = new LoopBackAuth();


/**
 * Default error handler
 */
export class ErrorHandler {
  public handleError(error: Response) {
    return Observable.throw(error.json().error || 'Server error');
  }
}


@Injectable()
export abstract class BaseLoopBackApi {

  protected path: string;

  constructor(
    @Inject(Http) protected http: Http, 
    @Optional() @Inject(ErrorHandler) protected errorHandler: ErrorHandler
  ) {
    if (!errorHandler) {
      this.errorHandler = new ErrorHandler();
    }
    this.init();
  }

  /**
   * Get path for building part of URL for API
   * @return string
   */
  protected getPath(): string {
    return this.path;
  }

  protected init() {
    this.path = "http://my.golfbot.com/api";
  }

  /**
   * Process request
   * @param string  method    Request method (GET, POST, PUT)
   * @param string  url       Request url (my-host/my-url/:id)
   * @param any     urlParams Values of url parameters
   * @param any     params    Parameters for building url (filter and other)
   * @param any     data      Request body
   */
  public request(method: string, url: string, urlParams: any = {}, 
                 params: any = {}, data: any = null) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    if (auth.getAccessTokenId()) {
      headers.append('Authorization', auth.getAccessTokenId());
    }

    let requestUrl = url;
    let key: string;
    for (key in urlParams) {
      requestUrl = requestUrl.replace(new RegExp(":" + key + "(\/|$)", "g"), urlParams[key] + "$1");
    }

    let parameters: string[] = [];
    for (var param in params) {
      parameters.push(param + '=' + (typeof params[param] === 'object' ? JSON.stringify(params[param]) : params[param]));
    }
    requestUrl += (parameters ? '?' : '') + parameters.join('&');

    let request = new Request({
      headers: headers,
      method: method,
      url: requestUrl,
      body: data ? JSON.stringify(data) : undefined
    });

    return this.http.request(request)
      .map(res => (res.text() != "" ? res.json() : {}))
      .catch(this.errorHandler.handleError);
  }
}


/**
 * Api for the `User` model.
 */
@Injectable()
export class UserApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Find a related item by id for accessTokens.
   *
   * @param any id User id
   *
   * @param any fk Foreign key for accessTokens
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public __findById__accessTokens(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users/:id/accessTokens/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for accessTokens.
   *
   * @param any id User id
   *
   * @param any fk Foreign key for accessTokens
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__accessTokens(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/Users/:id/accessTokens/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for accessTokens.
   *
   * @param any id User id
   *
   * @param any fk Foreign key for accessTokens
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public __updateById__accessTokens(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/Users/:id/accessTokens/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries accessTokens of User.
   *
   * @param any id User id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public __get__accessTokens(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users/:id/accessTokens";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in accessTokens of this model.
   *
   * @param any id User id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public __create__accessTokens(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/Users/:id/accessTokens";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all accessTokens of this model.
   *
   * @param any id User id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__accessTokens(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/Users/:id/accessTokens";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts accessTokens of User.
   *
   * @param any id User id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__accessTokens(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users/:id/accessTokens/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/Users";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/Users";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/Users";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/Users/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/Users/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id User id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `User` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/Users/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/Users/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Login a user with username/email and password.
   *
   * @param string include Related objects to include in the response. See the description of return value for more details.
   *   Default value: `user`.
   *
   *  - `rememberMe` - `boolean` - Whether the authentication credentials
   *     should be remembered in localStorage across app/browser restarts.
   *     Default: `true`.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The response body contains properties of the AccessToken created on login.
   * Depending on the value of `include` parameter, the body may contain additional properties:
   * 
   *   - `user` - `{User}` - Data of the currently logged in user. (`include=user`)
   * 
   *
   */
  public login(credentials: any, include: any = "user") {
    let method: string = "POST";

    let url: string = this.getPath() + "/Users/login";
    let urlParams: any = {
    };

    let params: any = {};
    if (include !== undefined) {
      params.include = include;
    }

    let result = this.request(method, url, urlParams, params, credentials)
      .share();
      result.subscribe(
        response => {
          auth.setUser(response.id, response.userId, response.user);
          auth.setRememberMe(true);
          auth.save();
        },
        () => null
      );
    return result;
  }

  /**
   * Logout a user with access token.
   *
   * @param object data Request data.
   *
   *  - `access_token` – `{string}` - Do not supply this argument, it is automatically extracted from request headers.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public logout() {
    let method: string = "POST";

    let url: string = this.getPath() + "/Users/logout";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params)
      .share();
      result.subscribe(
        () => {
          auth.clearUser();
          auth.clearStorage();
        },
        () => null
      );
    return result;
  }

  /**
   * Confirm a user registration with email verification token.
   *
   * @param string uid 
   *
   * @param string token 
   *
   * @param string redirect 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public confirm(uid: string, token: string, redirect: string = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users/confirm";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Reset password for a user with email.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public resetPassword(options: any) {
    let method: string = "POST";

    let url: string = this.getPath() + "/Users/reset";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * @ngdoc method
   * @name lbServices.User#getCurrent
   * @methodOf lbServices.User
   *
   * @description
   *
   * Get data of the currently logged user. Fail with HTTP result 401
   * when there is no user logged in.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   */
  public getCurrent(): any {
    let method: string = "GET";

    let url: string = this.getPath() + "/Users" + "/:id";
    let id: any = auth.getCurrentUserId();
    if (id == null) {
      id = '__anonymous__';
    }
    let urlParams: any = {
      id: id
    };

    let result = this.request(method, url, urlParams)
      .share();
      result.subscribe(
        response => {
          auth.setCurrentUserData(response);
        },
        () => null
      );
    return result;
  }

  /**
   * Get data of the currently logged user that was returned by the last
   * call to {@link lbServices.User#login} or
   * {@link lbServices.User#getCurrent}. Return null when there
   * is no user logged in or the data of the current user were not fetched
   * yet.
   *
   * @returns object A User instance.
   */
  public getCachedCurrent() {
    return auth.getCurrentUserData();
  }

  /**
   * @name lbServices.User#isAuthenticated
   *
   * @returns {boolean} True if the current user is authenticated (logged in).
   */
  public isAuthenticated() {
    return this.getCurrentId() != null;
  }

  /**
   * @name lbServices.User#getCurrentId
   *
   * @returns object Id of the currently logged-in user or null.
   */
  public getCurrentId() {
    return auth.getCurrentUserId();
  }

  /**
   * The name of the model represented by this $resource,
   * i.e. `User`.
   */
  public getModelName() {
    return "User";
  }
}

/**
 * Api for the `Team` model.
 */
@Injectable()
export class TeamApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Find a related item by id for players.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for players
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Team` object.)
   * </em>
   */
  public __findById__players(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/teams/:id/players/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for players.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for players
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__players(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/teams/:id/players/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for players.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for players
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Team` object.)
   * </em>
   */
  public __updateById__players(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/teams/:id/players/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries players of team.
   *
   * @param any id PersistedModel id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Team` object.)
   * </em>
   */
  public __get__players(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/teams/:id/players";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in players of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Team` object.)
   * </em>
   */
  public __create__players(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/teams/:id/players";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all players of this model.
   *
   * @param any id PersistedModel id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__players(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/teams/:id/players";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts players of team.
   *
   * @param any id PersistedModel id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__players(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/teams/:id/players/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Team` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/teams";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Team` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/teams";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Team` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/teams";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/teams/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Team` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/teams/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Team` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/teams";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Team` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/teams/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/teams/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Team` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/teams/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/teams/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Team` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/teams/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/teams/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Fetches belongsTo relation team.
   *
   * @param any id User id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Team` object.)
   * </em>
   */
  public __get__player__team(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/players/:id/team";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `Team`.
   */
  public getModelName() {
    return "Team";
  }
}

/**
 * Api for the `Player` model.
 */
@Injectable()
export class PlayerApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Find a related item by id for accessTokens.
   *
   * @param any id User id
   *
   * @param any fk Foreign key for accessTokens
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public __findById__accessTokens(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/players/:id/accessTokens/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for accessTokens.
   *
   * @param any id User id
   *
   * @param any fk Foreign key for accessTokens
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__accessTokens(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/players/:id/accessTokens/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for accessTokens.
   *
   * @param any id User id
   *
   * @param any fk Foreign key for accessTokens
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public __updateById__accessTokens(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/players/:id/accessTokens/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Fetches belongsTo relation team.
   *
   * @param any id User id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public __get__team(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/players/:id/team";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for holes.
   *
   * @param any id User id
   *
   * @param any fk Foreign key for holes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public __findById__holes(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/players/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for holes.
   *
   * @param any id User id
   *
   * @param any fk Foreign key for holes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__holes(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/players/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for holes.
   *
   * @param any id User id
   *
   * @param any fk Foreign key for holes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public __updateById__holes(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/players/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries accessTokens of player.
   *
   * @param any id User id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public __get__accessTokens(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/players/:id/accessTokens";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in accessTokens of this model.
   *
   * @param any id User id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public __create__accessTokens(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/players/:id/accessTokens";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all accessTokens of this model.
   *
   * @param any id User id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__accessTokens(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/players/:id/accessTokens";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts accessTokens of player.
   *
   * @param any id User id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__accessTokens(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/players/:id/accessTokens/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries holes of player.
   *
   * @param any id User id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public __get__holes(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/players/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in holes of this model.
   *
   * @param any id User id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public __create__holes(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/players/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all holes of this model.
   *
   * @param any id User id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__holes(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/players/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts holes of player.
   *
   * @param any id User id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__holes(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/players/:id/holes/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/players";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/players";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/players";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/players/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/players/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/players";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/players/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/players/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/players/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/players/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id User id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/players/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/players/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Login a user with username/email and password.
   *
   * @param string include Related objects to include in the response. See the description of return value for more details.
   *   Default value: `user`.
   *
   *  - `rememberMe` - `boolean` - Whether the authentication credentials
   *     should be remembered in localStorage across app/browser restarts.
   *     Default: `true`.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The response body contains properties of the AccessToken created on login.
   * Depending on the value of `include` parameter, the body may contain additional properties:
   * 
   *   - `user` - `{User}` - Data of the currently logged in user. (`include=user`)
   * 
   *
   */
  public login(credentials: any, include: any = "user") {
    let method: string = "POST";

    let url: string = this.getPath() + "/players/login";
    let urlParams: any = {
    };

    let params: any = {};
    if (include !== undefined) {
      params.include = include;
    }

    let result = this.request(method, url, urlParams, params, credentials)
      .share();
      result.subscribe(
        response => {
          auth.setUser(response.id, response.userId, response.user);
          auth.setRememberMe(true);
          auth.save();
        },
        () => null
      );
    return result;
  }

  /**
   * Logout a user with access token.
   *
   * @param object data Request data.
   *
   *  - `access_token` – `{string}` - Do not supply this argument, it is automatically extracted from request headers.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public logout() {
    let method: string = "POST";

    let url: string = this.getPath() + "/players/logout";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params)
      .share();
      result.subscribe(
        () => {
          auth.clearUser();
          auth.clearStorage();
        },
        () => null
      );
    return result;
  }

  /**
   * Confirm a user registration with email verification token.
   *
   * @param string uid 
   *
   * @param string token 
   *
   * @param string redirect 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public confirm(uid: string, token: string, redirect: string = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/players/confirm";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Reset password for a user with email.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public resetPassword(options: any) {
    let method: string = "POST";

    let url: string = this.getPath() + "/players/reset";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Find a related item by id for players.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for players
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public __findById__team__players(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/teams/:id/players/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for players.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for players
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__team__players(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/teams/:id/players/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for players.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for players
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public __updateById__team__players(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/teams/:id/players/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries players of team.
   *
   * @param any id PersistedModel id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public __get__team__players(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/teams/:id/players";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in players of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public __create__team__players(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/teams/:id/players";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Creates a new instance in players of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public __createMany__team__players(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/teams/:id/players";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all players of this model.
   *
   * @param any id PersistedModel id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__team__players(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/teams/:id/players";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts players of team.
   *
   * @param any id PersistedModel id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__team__players(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/teams/:id/players/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Fetches belongsTo relation player.
   *
   * @param any id PersistedModel id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Player` object.)
   * </em>
   */
  public __get__hole__player(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/holes/:id/player";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * @ngdoc method
   * @name lbServices.Player#getCurrent
   * @methodOf lbServices.Player
   *
   * @description
   *
   * Get data of the currently logged user. Fail with HTTP result 401
   * when there is no user logged in.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   */
  public getCurrent(): any {
    let method: string = "GET";

    let url: string = this.getPath() + "/players" + "/:id";
    let id: any = auth.getCurrentUserId();
    if (id == null) {
      id = '__anonymous__';
    }
    let urlParams: any = {
      id: id
    };

    let result = this.request(method, url, urlParams)
      .share();
      result.subscribe(
        response => {
          auth.setCurrentUserData(response);
        },
        () => null
      );
    return result;
  }

  /**
   * Get data of the currently logged user that was returned by the last
   * call to {@link lbServices.Player#login} or
   * {@link lbServices.Player#getCurrent}. Return null when there
   * is no user logged in or the data of the current user were not fetched
   * yet.
   *
   * @returns object A Player instance.
   */
  public getCachedCurrent() {
    return auth.getCurrentUserData();
  }

  /**
   * @name lbServices.Player#isAuthenticated
   *
   * @returns {boolean} True if the current user is authenticated (logged in).
   */
  public isAuthenticated() {
    return this.getCurrentId() != null;
  }

  /**
   * @name lbServices.Player#getCurrentId
   *
   * @returns object Id of the currently logged-in user or null.
   */
  public getCurrentId() {
    return auth.getCurrentUserId();
  }

  /**
   * The name of the model represented by this $resource,
   * i.e. `Player`.
   */
  public getModelName() {
    return "Player";
  }
}

/**
 * Api for the `Course` model.
 */
@Injectable()
export class CourseApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Find a related item by id for courseHoles.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for courseHoles
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course` object.)
   * </em>
   */
  public __findById__courseHoles(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/courses/:id/courseHoles/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for courseHoles.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for courseHoles
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__courseHoles(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/courses/:id/courseHoles/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for courseHoles.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for courseHoles
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course` object.)
   * </em>
   */
  public __updateById__courseHoles(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/courses/:id/courseHoles/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries courseHoles of course.
   *
   * @param any id PersistedModel id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course` object.)
   * </em>
   */
  public __get__courseHoles(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/courses/:id/courseHoles";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in courseHoles of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course` object.)
   * </em>
   */
  public __create__courseHoles(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/courses/:id/courseHoles";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all courseHoles of this model.
   *
   * @param any id PersistedModel id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__courseHoles(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/courses/:id/courseHoles";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts courseHoles of course.
   *
   * @param any id PersistedModel id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__courseHoles(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/courses/:id/courseHoles/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/courses";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/courses";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/courses";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/courses/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/courses/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/courses";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/courses/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/courses/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/courses/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/courses/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/courses/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/courses/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Fetches belongsTo relation course.
   *
   * @param any id PersistedModel id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course` object.)
   * </em>
   */
  public __get__event__course(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/events/:id/course";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Fetches belongsTo relation course.
   *
   * @param any id PersistedModel id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course` object.)
   * </em>
   */
  public __get__course_hole__course(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/course_holes/:id/course";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `Course`.
   */
  public getModelName() {
    return "Course";
  }
}

/**
 * Api for the `Event` model.
 */
@Injectable()
export class EventApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Fetches belongsTo relation course.
   *
   * @param any id PersistedModel id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Event` object.)
   * </em>
   */
  public __get__course(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/events/:id/course";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for rounds.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for rounds
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Event` object.)
   * </em>
   */
  public __findById__rounds(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/events/:id/rounds/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for rounds.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for rounds
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__rounds(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/events/:id/rounds/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for rounds.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for rounds
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Event` object.)
   * </em>
   */
  public __updateById__rounds(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/events/:id/rounds/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries rounds of event.
   *
   * @param any id PersistedModel id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Event` object.)
   * </em>
   */
  public __get__rounds(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/events/:id/rounds";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in rounds of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Event` object.)
   * </em>
   */
  public __create__rounds(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/events/:id/rounds";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all rounds of this model.
   *
   * @param any id PersistedModel id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__rounds(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/events/:id/rounds";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts rounds of event.
   *
   * @param any id PersistedModel id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__rounds(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/events/:id/rounds/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Event` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/events";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Event` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/events";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Event` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/events";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/events/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Event` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/events/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Event` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/events";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Event` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/events/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/events/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Event` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/events/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/events/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Event` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/events/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/events/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Fetches belongsTo relation event.
   *
   * @param any id PersistedModel id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Event` object.)
   * </em>
   */
  public __get__round__event(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/rounds/:id/event";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `Event`.
   */
  public getModelName() {
    return "Event";
  }
}

/**
 * Api for the `Round` model.
 */
@Injectable()
export class RoundApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Fetches belongsTo relation event.
   *
   * @param any id PersistedModel id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public __get__event(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/rounds/:id/event";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for holes.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public __findById__holes(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/rounds/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for holes.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__holes(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/rounds/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for holes.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public __updateById__holes(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/rounds/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries holes of round.
   *
   * @param any id PersistedModel id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public __get__holes(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/rounds/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in holes of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public __create__holes(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/rounds/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all holes of this model.
   *
   * @param any id PersistedModel id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__holes(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/rounds/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts holes of round.
   *
   * @param any id PersistedModel id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__holes(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/rounds/:id/holes/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/rounds";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/rounds";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/rounds";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/rounds/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/rounds/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/rounds";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/rounds/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/rounds/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/rounds/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/rounds/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/rounds/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/rounds/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Find a related item by id for rounds.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for rounds
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public __findById__event__rounds(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/events/:id/rounds/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for rounds.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for rounds
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__event__rounds(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/events/:id/rounds/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for rounds.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for rounds
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public __updateById__event__rounds(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/events/:id/rounds/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries rounds of event.
   *
   * @param any id PersistedModel id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public __get__event__rounds(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/events/:id/rounds";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in rounds of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public __create__event__rounds(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/events/:id/rounds";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Creates a new instance in rounds of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public __createMany__event__rounds(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/events/:id/rounds";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all rounds of this model.
   *
   * @param any id PersistedModel id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__event__rounds(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/events/:id/rounds";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts rounds of event.
   *
   * @param any id PersistedModel id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__event__rounds(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/events/:id/rounds/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Fetches belongsTo relation round.
   *
   * @param any id PersistedModel id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Round` object.)
   * </em>
   */
  public __get__hole__round(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/holes/:id/round";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `Round`.
   */
  public getModelName() {
    return "Round";
  }
}

/**
 * Api for the `Course_hole` model.
 */
@Injectable()
export class Course_holeApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Fetches belongsTo relation course.
   *
   * @param any id PersistedModel id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course_hole` object.)
   * </em>
   */
  public __get__course(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/course_holes/:id/course";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course_hole` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/course_holes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course_hole` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/course_holes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course_hole` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/course_holes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/course_holes/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course_hole` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/course_holes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course_hole` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/course_holes";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course_hole` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/course_holes/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/course_holes/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course_hole` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/course_holes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/course_holes/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course_hole` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/course_holes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/course_holes/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Find a related item by id for courseHoles.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for courseHoles
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course_hole` object.)
   * </em>
   */
  public __findById__course__courseHoles(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/courses/:id/courseHoles/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for courseHoles.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for courseHoles
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__course__courseHoles(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/courses/:id/courseHoles/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for courseHoles.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for courseHoles
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course_hole` object.)
   * </em>
   */
  public __updateById__course__courseHoles(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/courses/:id/courseHoles/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries courseHoles of course.
   *
   * @param any id PersistedModel id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course_hole` object.)
   * </em>
   */
  public __get__course__courseHoles(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/courses/:id/courseHoles";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in courseHoles of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course_hole` object.)
   * </em>
   */
  public __create__course__courseHoles(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/courses/:id/courseHoles";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Creates a new instance in courseHoles of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course_hole` object.)
   * </em>
   */
  public __createMany__course__courseHoles(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/courses/:id/courseHoles";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all courseHoles of this model.
   *
   * @param any id PersistedModel id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__course__courseHoles(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/courses/:id/courseHoles";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts courseHoles of course.
   *
   * @param any id PersistedModel id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__course__courseHoles(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/courses/:id/courseHoles/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Fetches belongsTo relation course_hole.
   *
   * @param any id PersistedModel id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Course_hole` object.)
   * </em>
   */
  public __get__hole__course_hole(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/holes/:id/course_hole";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `Course_hole`.
   */
  public getModelName() {
    return "Course_hole";
  }
}

/**
 * Api for the `Penalty` model.
 */
@Injectable()
export class PenaltyApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Find a related item by id for holes.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public __findById__holes(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/penalties/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for holes.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__holes(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/penalties/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for holes.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public __updateById__holes(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/penalties/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for holes.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public __link__holes(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/penalties/:id/holes/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the holes relation to an item by id.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__holes(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/penalties/:id/holes/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of holes relation to an item by id.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public __exists__holes(id: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/penalties/:id/holes/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries holes of penalty.
   *
   * @param any id PersistedModel id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public __get__holes(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/penalties/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in holes of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public __create__holes(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/penalties/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all holes of this model.
   *
   * @param any id PersistedModel id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__holes(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/penalties/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts holes of penalty.
   *
   * @param any id PersistedModel id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__holes(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/penalties/:id/holes/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/penalties";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/penalties";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/penalties";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/penalties/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/penalties/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/penalties";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/penalties/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/penalties/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/penalties/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/penalties/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/penalties/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/penalties/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Find a related item by id for penalties.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for penalties
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public __findById__hole__penalties(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/holes/:id/penalties/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for penalties.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for penalties
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__hole__penalties(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/holes/:id/penalties/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for penalties.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for penalties
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public __updateById__hole__penalties(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/holes/:id/penalties/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for penalties.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for penalties
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public __link__hole__penalties(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/holes/:id/penalties/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the penalties relation to an item by id.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for penalties
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__hole__penalties(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/holes/:id/penalties/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of penalties relation to an item by id.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for penalties
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public __exists__hole__penalties(id: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/holes/:id/penalties/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries penalties of hole.
   *
   * @param any id PersistedModel id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public __get__hole__penalties(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/holes/:id/penalties";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in penalties of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public __create__hole__penalties(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/holes/:id/penalties";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Creates a new instance in penalties of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Penalty` object.)
   * </em>
   */
  public __createMany__hole__penalties(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/holes/:id/penalties";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all penalties of this model.
   *
   * @param any id PersistedModel id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__hole__penalties(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/holes/:id/penalties";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts penalties of hole.
   *
   * @param any id PersistedModel id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__hole__penalties(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/holes/:id/penalties/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `Penalty`.
   */
  public getModelName() {
    return "Penalty";
  }
}

/**
 * Api for the `Hole` model.
 */
@Injectable()
export class HoleApi extends BaseLoopBackApi {

  constructor(
    @Inject(Http) http: Http,
    @Optional() @Inject(ErrorHandler) errorHandler: ErrorHandler
  ) {
    super(http, errorHandler);
  }

  /**
   * Fetches belongsTo relation round.
   *
   * @param any id PersistedModel id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __get__round(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/holes/:id/round";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Fetches belongsTo relation course_hole.
   *
   * @param any id PersistedModel id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __get__course_hole(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/holes/:id/course_hole";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Fetches belongsTo relation player.
   *
   * @param any id PersistedModel id
   *
   * @param boolean refresh 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __get__player(id: any, refresh: boolean = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/holes/:id/player";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (refresh !== undefined) {
      params.refresh = refresh;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for penalties.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for penalties
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __findById__penalties(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/holes/:id/penalties/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for penalties.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for penalties
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__penalties(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/holes/:id/penalties/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for penalties.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for penalties
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __updateById__penalties(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/holes/:id/penalties/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for penalties.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for penalties
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __link__penalties(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/holes/:id/penalties/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the penalties relation to an item by id.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for penalties
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__penalties(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/holes/:id/penalties/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of penalties relation to an item by id.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for penalties
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __exists__penalties(id: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/holes/:id/penalties/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries penalties of hole.
   *
   * @param any id PersistedModel id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __get__penalties(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/holes/:id/penalties";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in penalties of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __create__penalties(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/holes/:id/penalties";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all penalties of this model.
   *
   * @param any id PersistedModel id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__penalties(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/holes/:id/penalties";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts penalties of hole.
   *
   * @param any id PersistedModel id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__penalties(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/holes/:id/penalties/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public create(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/holes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a new instance of the model and persist it into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public createMany(data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/holes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Update an existing model instance or insert a new one into the data source.
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public upsert(data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/holes";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Check whether a model instance exists in the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `exists` – `{boolean}` - 
   */
  public exists(id: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/holes/:id/exists";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @param object filter Filter defining fields and include
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public findById(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/holes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find all instances of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public find(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/holes";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find first instance of the model matched by filter from the data source.
   *
   * @param object filter Filter defining fields, where, include, order, offset, and limit
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public findOne(filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/holes/findOne";
    let urlParams: any = {
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * The number of instances updated
   */
  public updateAll(where: any = undefined, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/holes/update";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Delete a model instance by id from the data source.
   *
   * @param any id Model id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public deleteById(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/holes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Count instances of the model matched by where from the data source.
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public count(where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/holes/count";
    let urlParams: any = {
    };

    let params: any = {};
    if (where !== undefined) {
      params.where = where;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update attributes for a model instance and persist it into the data source.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public updateAttributes(id: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/holes/:id";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Create a change stream.
   *
   * @param object data Request data.
   *
   *  - `options` – `{object}` - 
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `changes` – `{ReadableStream}` - 
   */
  public createChangeStream(options: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/holes/change-stream";
    let urlParams: any = {
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, options);
    return result;
  }

  /**
   * Find a related item by id for holes.
   *
   * @param any id User id
   *
   * @param any fk Foreign key for holes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __findById__player__holes(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/players/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for holes.
   *
   * @param any id User id
   *
   * @param any fk Foreign key for holes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__player__holes(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/players/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for holes.
   *
   * @param any id User id
   *
   * @param any fk Foreign key for holes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __updateById__player__holes(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/players/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries holes of player.
   *
   * @param any id User id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __get__player__holes(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/players/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in holes of this model.
   *
   * @param any id User id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __create__player__holes(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/players/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Creates a new instance in holes of this model.
   *
   * @param any id User id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __createMany__player__holes(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/players/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all holes of this model.
   *
   * @param any id User id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__player__holes(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/players/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts holes of player.
   *
   * @param any id User id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__player__holes(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/players/:id/holes/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for holes.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __findById__round__holes(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/rounds/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for holes.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__round__holes(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/rounds/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for holes.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __updateById__round__holes(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/rounds/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Queries holes of round.
   *
   * @param any id PersistedModel id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __get__round__holes(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/rounds/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in holes of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __create__round__holes(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/rounds/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Creates a new instance in holes of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __createMany__round__holes(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/rounds/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all holes of this model.
   *
   * @param any id PersistedModel id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__round__holes(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/rounds/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts holes of round.
   *
   * @param any id PersistedModel id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__round__holes(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/rounds/:id/holes/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Find a related item by id for holes.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __findById__penalty__holes(id: any, fk: any) {
    let method: string = "GET";

    let url: string = this.getPath() + "/penalties/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Delete a related item by id for holes.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __destroyById__penalty__holes(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/penalties/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Update a related item by id for holes.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __updateById__penalty__holes(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/penalties/:id/holes/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Add a related item by id for holes.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __link__penalty__holes(id: any, fk: any, data: any = undefined) {
    let method: string = "PUT";

    let url: string = this.getPath() + "/penalties/:id/holes/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Remove the holes relation to an item by id.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __unlink__penalty__holes(id: any, fk: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/penalties/:id/holes/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Check the existence of holes relation to an item by id.
   *
   * @param any id PersistedModel id
   *
   * @param any fk Foreign key for holes
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __exists__penalty__holes(id: any, fk: any) {
    let method: string = "HEAD";

    let url: string = this.getPath() + "/penalties/:id/holes/rel/:fk";
    let urlParams: any = {
      id: id,
      fk: fk
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Queries holes of penalty.
   *
   * @param any id PersistedModel id
   *
   * @param object filter 
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __get__penalty__holes(id: any, filter: LoopBackFilterInterface = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/penalties/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};
    if (filter !== undefined) {
      params.filter = filter;
    }

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Creates a new instance in holes of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __create__penalty__holes(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/penalties/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Creates a new instance in holes of this model.
   *
   * @param any id PersistedModel id
   *
   * @param object data Request data.
   *
   * This method expects a subset of model properties as request parameters.
   *
   * @returns object[] An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * <em>
   * (The remote method definition does not provide any description.
   * This usually means the response is a `Hole` object.)
   * </em>
   */
  public __createMany__penalty__holes(id: any, data: any = undefined) {
    let method: string = "POST";

    let url: string = this.getPath() + "/penalties/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params, data);
    return result;
  }

  /**
   * Deletes all holes of this model.
   *
   * @param any id PersistedModel id
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * This method returns no data.
   */
  public __delete__penalty__holes(id: any) {
    let method: string = "DELETE";

    let url: string = this.getPath() + "/penalties/:id/holes";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }

  /**
   * Counts holes of penalty.
   *
   * @param any id PersistedModel id
   *
   * @param object where Criteria to match model instances
   *
   * @returns object An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   *
   * Data properties:
   *
   *  - `count` – `{number}` - 
   */
  public __count__penalty__holes(id: any, where: any = undefined) {
    let method: string = "GET";

    let url: string = this.getPath() + "/penalties/:id/holes/count";
    let urlParams: any = {
      id: id
    };

    let params: any = {};

    let result = this.request(method, url, urlParams, params);
    return result;
  }


  /**
   * The name of the model represented by this $resource,
   * i.e. `Hole`.
   */
  public getModelName() {
    return "Hole";
  }
}



