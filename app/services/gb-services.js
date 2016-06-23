"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/* tslint:disable */
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
var Observable_1 = require('rxjs/Observable');
require('rxjs/add/observable/throw');
require('rxjs/add/operator/map');
require('rxjs/add/operator/catch');
require('rxjs/add/operator/share');
var LoopBackAuth = (function () {
    function LoopBackAuth() {
        this.propsPrefix = '$LoopBack$';
        this.accessTokenId = this.load("accessTokenId");
        this.currentUserId = this.load("currentUserId");
        this.rememberMe = this.load("rememberMe");
        this.currentUserData = null;
    }
    LoopBackAuth.prototype.setRememberMe = function (value) {
        this.rememberMe = value;
        return this;
    };
    LoopBackAuth.prototype.getCurrentUserId = function () {
        return this.currentUserId;
    };
    LoopBackAuth.prototype.setCurrentUserData = function (data) {
        this.currentUserData = data;
        return this;
    };
    LoopBackAuth.prototype.getCurrentUserData = function () {
        return this.currentUserData;
    };
    LoopBackAuth.prototype.getAccessTokenId = function () {
        return this.accessTokenId;
    };
    LoopBackAuth.prototype.save = function () {
        var storage = this.rememberMe ? localStorage : sessionStorage;
        this.saveThis(storage, "accessTokenId", this.accessTokenId);
        this.saveThis(storage, "currentUserId", this.currentUserId);
        this.saveThis(storage, "rememberMe", this.rememberMe);
    };
    ;
    LoopBackAuth.prototype.setUser = function (accessTokenId, userId, userData) {
        this.accessTokenId = accessTokenId;
        this.currentUserId = userId;
        this.currentUserData = userData;
    };
    LoopBackAuth.prototype.clearUser = function () {
        this.accessTokenId = null;
        this.currentUserId = null;
        this.currentUserData = null;
    };
    LoopBackAuth.prototype.clearStorage = function () {
        this.saveThis(sessionStorage, "accessTokenId", null);
        this.saveThis(localStorage, "accessTokenId", null);
        this.saveThis(sessionStorage, "currentUserId", null);
        this.saveThis(localStorage, "currentUserId", null);
        this.saveThis(sessionStorage, "rememberMe", null);
        this.saveThis(localStorage, "rememberMe", null);
    };
    ;
    // Note: LocalStorage converts the value to string
    // We are using empty string as a marker for null/undefined values.
    LoopBackAuth.prototype.saveThis = function (storage, name, value) {
        try {
            var key = this.propsPrefix + name;
            if (value == null) {
                value = '';
            }
            storage[key] = value;
        }
        catch (err) {
            console.log('Cannot access local/session storage:', err);
        }
    };
    LoopBackAuth.prototype.load = function (name) {
        var key = this.propsPrefix + name;
        return localStorage[key] || sessionStorage[key] || null;
    };
    return LoopBackAuth;
}());
var auth = new LoopBackAuth();
/**
 * Default error handler
 */
var ErrorHandler = (function () {
    function ErrorHandler() {
    }
    ErrorHandler.prototype.handleError = function (error) {
        return Observable_1.Observable.throw(error.json().error || 'Server error');
    };
    return ErrorHandler;
}());
exports.ErrorHandler = ErrorHandler;
var BaseLoopBackApi = (function () {
    function BaseLoopBackApi(http, errorHandler) {
        this.http = http;
        this.errorHandler = errorHandler;
        if (!errorHandler) {
            this.errorHandler = new ErrorHandler();
        }
        this.init();
    }
    /**
     * Get path for building part of URL for API
     * @return string
     */
    BaseLoopBackApi.prototype.getPath = function () {
        return this.path;
    };
    BaseLoopBackApi.prototype.init = function () {
        this.path = "http://my.golfbot.com/api";
    };
    /**
     * Process request
     * @param string  method    Request method (GET, POST, PUT)
     * @param string  url       Request url (my-host/my-url/:id)
     * @param any     urlParams Values of url parameters
     * @param any     params    Parameters for building url (filter and other)
     * @param any     data      Request body
     */
    BaseLoopBackApi.prototype.request = function (method, url, urlParams, params, data) {
        if (urlParams === void 0) { urlParams = {}; }
        if (params === void 0) { params = {}; }
        if (data === void 0) { data = null; }
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        if (auth.getAccessTokenId()) {
            headers.append('Authorization', auth.getAccessTokenId());
        }
        var requestUrl = url;
        var key;
        for (key in urlParams) {
            requestUrl = requestUrl.replace(new RegExp(":" + key + "(\/|$)", "g"), urlParams[key] + "$1");
        }
        var parameters = [];
        for (var param in params) {
            parameters.push(param + '=' + (typeof params[param] === 'object' ? JSON.stringify(params[param]) : params[param]));
        }
        requestUrl += (parameters ? '?' : '') + parameters.join('&');
        var request = new http_1.Request({
            headers: headers,
            method: method,
            url: requestUrl,
            body: data ? JSON.stringify(data) : undefined
        });
        return this.http.request(request)
            .map(function (res) { return (res.text() != "" ? res.json() : {}); })
            .catch(this.errorHandler.handleError);
    };
    BaseLoopBackApi = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(http_1.Http)),
        __param(1, core_1.Optional()),
        __param(1, core_1.Inject(ErrorHandler)), 
        __metadata('design:paramtypes', [http_1.Http, ErrorHandler])
    ], BaseLoopBackApi);
    return BaseLoopBackApi;
}());
exports.BaseLoopBackApi = BaseLoopBackApi;
/**
 * Api for the `User` model.
 */
var UserApi = (function (_super) {
    __extends(UserApi, _super);
    function UserApi(http, errorHandler) {
        _super.call(this, http, errorHandler);
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
    UserApi.prototype.__findById__accessTokens = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/Users/:id/accessTokens/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    UserApi.prototype.__destroyById__accessTokens = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/Users/:id/accessTokens/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    UserApi.prototype.__updateById__accessTokens = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/Users/:id/accessTokens/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    UserApi.prototype.__get__accessTokens = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/Users/:id/accessTokens";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    UserApi.prototype.__create__accessTokens = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/Users/:id/accessTokens";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    UserApi.prototype.__delete__accessTokens = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/Users/:id/accessTokens";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    UserApi.prototype.__count__accessTokens = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/Users/:id/accessTokens/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    UserApi.prototype.create = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/Users";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    UserApi.prototype.createMany = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/Users";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    UserApi.prototype.upsert = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/Users";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    UserApi.prototype.exists = function (id) {
        var method = "GET";
        var url = this.getPath() + "/Users/:id/exists";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    UserApi.prototype.findById = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/Users/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    UserApi.prototype.find = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/Users";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    UserApi.prototype.findOne = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/Users/findOne";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    UserApi.prototype.updateAll = function (where, data) {
        if (where === void 0) { where = undefined; }
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/Users/update";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    UserApi.prototype.deleteById = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/Users/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    UserApi.prototype.count = function (where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/Users/count";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    UserApi.prototype.updateAttributes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/Users/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    UserApi.prototype.createChangeStream = function (options) {
        if (options === void 0) { options = undefined; }
        var method = "POST";
        var url = this.getPath() + "/Users/change-stream";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
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
    UserApi.prototype.login = function (credentials, include) {
        if (include === void 0) { include = "user"; }
        var method = "POST";
        var url = this.getPath() + "/Users/login";
        var urlParams = {};
        var params = {};
        if (include !== undefined) {
            params.include = include;
        }
        var result = this.request(method, url, urlParams, params, credentials)
            .share();
        result.subscribe(function (response) {
            auth.setUser(response.id, response.userId, response.user);
            auth.setRememberMe(true);
            auth.save();
        }, function () { return null; });
        return result;
    };
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
    UserApi.prototype.logout = function () {
        var method = "POST";
        var url = this.getPath() + "/Users/logout";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params)
            .share();
        result.subscribe(function () {
            auth.clearUser();
            auth.clearStorage();
        }, function () { return null; });
        return result;
    };
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
    UserApi.prototype.confirm = function (uid, token, redirect) {
        if (redirect === void 0) { redirect = undefined; }
        var method = "GET";
        var url = this.getPath() + "/Users/confirm";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    UserApi.prototype.resetPassword = function (options) {
        var method = "POST";
        var url = this.getPath() + "/Users/reset";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
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
    UserApi.prototype.getCurrent = function () {
        var method = "GET";
        var url = this.getPath() + "/Users" + "/:id";
        var id = auth.getCurrentUserId();
        if (id == null) {
            id = '__anonymous__';
        }
        var urlParams = {
            id: id
        };
        var result = this.request(method, url, urlParams)
            .share();
        result.subscribe(function (response) {
            auth.setCurrentUserData(response);
        }, function () { return null; });
        return result;
    };
    /**
     * Get data of the currently logged user that was returned by the last
     * call to {@link lbServices.User#login} or
     * {@link lbServices.User#getCurrent}. Return null when there
     * is no user logged in or the data of the current user were not fetched
     * yet.
     *
     * @returns object A User instance.
     */
    UserApi.prototype.getCachedCurrent = function () {
        return auth.getCurrentUserData();
    };
    /**
     * @name lbServices.User#isAuthenticated
     *
     * @returns {boolean} True if the current user is authenticated (logged in).
     */
    UserApi.prototype.isAuthenticated = function () {
        return this.getCurrentId() != null;
    };
    /**
     * @name lbServices.User#getCurrentId
     *
     * @returns object Id of the currently logged-in user or null.
     */
    UserApi.prototype.getCurrentId = function () {
        return auth.getCurrentUserId();
    };
    /**
     * The name of the model represented by this $resource,
     * i.e. `User`.
     */
    UserApi.prototype.getModelName = function () {
        return "User";
    };
    UserApi = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(http_1.Http)),
        __param(1, core_1.Optional()),
        __param(1, core_1.Inject(ErrorHandler)), 
        __metadata('design:paramtypes', [http_1.Http, ErrorHandler])
    ], UserApi);
    return UserApi;
}(BaseLoopBackApi));
exports.UserApi = UserApi;
/**
 * Api for the `Team` model.
 */
var TeamApi = (function (_super) {
    __extends(TeamApi, _super);
    function TeamApi(http, errorHandler) {
        _super.call(this, http, errorHandler);
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
    TeamApi.prototype.__findById__players = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/teams/:id/players/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    TeamApi.prototype.__destroyById__players = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/teams/:id/players/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    TeamApi.prototype.__updateById__players = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/teams/:id/players/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    TeamApi.prototype.__get__players = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/teams/:id/players";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    TeamApi.prototype.__create__players = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/teams/:id/players";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    TeamApi.prototype.__delete__players = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/teams/:id/players";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    TeamApi.prototype.__count__players = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/teams/:id/players/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    TeamApi.prototype.create = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/teams";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    TeamApi.prototype.createMany = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/teams";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    TeamApi.prototype.upsert = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/teams";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    TeamApi.prototype.exists = function (id) {
        var method = "GET";
        var url = this.getPath() + "/teams/:id/exists";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    TeamApi.prototype.findById = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/teams/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    TeamApi.prototype.find = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/teams";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    TeamApi.prototype.findOne = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/teams/findOne";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    TeamApi.prototype.updateAll = function (where, data) {
        if (where === void 0) { where = undefined; }
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/teams/update";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    TeamApi.prototype.deleteById = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/teams/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    TeamApi.prototype.count = function (where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/teams/count";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    TeamApi.prototype.updateAttributes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/teams/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    TeamApi.prototype.createChangeStream = function (options) {
        if (options === void 0) { options = undefined; }
        var method = "POST";
        var url = this.getPath() + "/teams/change-stream";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
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
    TeamApi.prototype.__get__player__team = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/players/:id/team";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * The name of the model represented by this $resource,
     * i.e. `Team`.
     */
    TeamApi.prototype.getModelName = function () {
        return "Team";
    };
    TeamApi = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(http_1.Http)),
        __param(1, core_1.Optional()),
        __param(1, core_1.Inject(ErrorHandler)), 
        __metadata('design:paramtypes', [http_1.Http, ErrorHandler])
    ], TeamApi);
    return TeamApi;
}(BaseLoopBackApi));
exports.TeamApi = TeamApi;
/**
 * Api for the `Player` model.
 */
var PlayerApi = (function (_super) {
    __extends(PlayerApi, _super);
    function PlayerApi(http, errorHandler) {
        _super.call(this, http, errorHandler);
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
    PlayerApi.prototype.__findById__accessTokens = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/players/:id/accessTokens/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.__destroyById__accessTokens = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/players/:id/accessTokens/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.__updateById__accessTokens = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/players/:id/accessTokens/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PlayerApi.prototype.__get__team = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/players/:id/team";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.__findById__holes = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/players/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.__destroyById__holes = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/players/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.__updateById__holes = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/players/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PlayerApi.prototype.__get__accessTokens = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/players/:id/accessTokens";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.__create__accessTokens = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/players/:id/accessTokens";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PlayerApi.prototype.__delete__accessTokens = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/players/:id/accessTokens";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.__count__accessTokens = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/players/:id/accessTokens/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.__get__holes = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/players/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.__create__holes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/players/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PlayerApi.prototype.__delete__holes = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/players/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.__count__holes = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/players/:id/holes/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.create = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/players";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PlayerApi.prototype.createMany = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/players";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PlayerApi.prototype.upsert = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/players";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PlayerApi.prototype.exists = function (id) {
        var method = "GET";
        var url = this.getPath() + "/players/:id/exists";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.findById = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/players/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.find = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/players";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.findOne = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/players/findOne";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.updateAll = function (where, data) {
        if (where === void 0) { where = undefined; }
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/players/update";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PlayerApi.prototype.deleteById = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/players/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.count = function (where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/players/count";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.updateAttributes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/players/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PlayerApi.prototype.createChangeStream = function (options) {
        if (options === void 0) { options = undefined; }
        var method = "POST";
        var url = this.getPath() + "/players/change-stream";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
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
    PlayerApi.prototype.login = function (credentials, include) {
        if (include === void 0) { include = "user"; }
        var method = "POST";
        var url = this.getPath() + "/players/login";
        var urlParams = {};
        var params = {};
        if (include !== undefined) {
            params.include = include;
        }
        var result = this.request(method, url, urlParams, params, credentials)
            .share();
        result.subscribe(function (response) {
            auth.setUser(response.id, response.userId, response.user);
            auth.setRememberMe(true);
            auth.save();
        }, function () { return null; });
        return result;
    };
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
    PlayerApi.prototype.logout = function () {
        var method = "POST";
        var url = this.getPath() + "/players/logout";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params)
            .share();
        result.subscribe(function () {
            auth.clearUser();
            auth.clearStorage();
        }, function () { return null; });
        return result;
    };
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
    PlayerApi.prototype.confirm = function (uid, token, redirect) {
        if (redirect === void 0) { redirect = undefined; }
        var method = "GET";
        var url = this.getPath() + "/players/confirm";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.resetPassword = function (options) {
        var method = "POST";
        var url = this.getPath() + "/players/reset";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
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
    PlayerApi.prototype.__findById__team__players = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/teams/:id/players/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.__destroyById__team__players = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/teams/:id/players/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.__updateById__team__players = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/teams/:id/players/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PlayerApi.prototype.__get__team__players = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/teams/:id/players";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.__create__team__players = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/teams/:id/players";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PlayerApi.prototype.__createMany__team__players = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/teams/:id/players";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PlayerApi.prototype.__delete__team__players = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/teams/:id/players";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.__count__team__players = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/teams/:id/players/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.__get__hole__player = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/holes/:id/player";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PlayerApi.prototype.getCurrent = function () {
        var method = "GET";
        var url = this.getPath() + "/players" + "/:id";
        var id = auth.getCurrentUserId();
        if (id == null) {
            id = '__anonymous__';
        }
        var urlParams = {
            id: id
        };
        var result = this.request(method, url, urlParams)
            .share();
        result.subscribe(function (response) {
            auth.setCurrentUserData(response);
        }, function () { return null; });
        return result;
    };
    /**
     * Get data of the currently logged user that was returned by the last
     * call to {@link lbServices.Player#login} or
     * {@link lbServices.Player#getCurrent}. Return null when there
     * is no user logged in or the data of the current user were not fetched
     * yet.
     *
     * @returns object A Player instance.
     */
    PlayerApi.prototype.getCachedCurrent = function () {
        return auth.getCurrentUserData();
    };
    /**
     * @name lbServices.Player#isAuthenticated
     *
     * @returns {boolean} True if the current user is authenticated (logged in).
     */
    PlayerApi.prototype.isAuthenticated = function () {
        return this.getCurrentId() != null;
    };
    /**
     * @name lbServices.Player#getCurrentId
     *
     * @returns object Id of the currently logged-in user or null.
     */
    PlayerApi.prototype.getCurrentId = function () {
        return auth.getCurrentUserId();
    };
    /**
     * The name of the model represented by this $resource,
     * i.e. `Player`.
     */
    PlayerApi.prototype.getModelName = function () {
        return "Player";
    };
    PlayerApi = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(http_1.Http)),
        __param(1, core_1.Optional()),
        __param(1, core_1.Inject(ErrorHandler)), 
        __metadata('design:paramtypes', [http_1.Http, ErrorHandler])
    ], PlayerApi);
    return PlayerApi;
}(BaseLoopBackApi));
exports.PlayerApi = PlayerApi;
/**
 * Api for the `Course` model.
 */
var CourseApi = (function (_super) {
    __extends(CourseApi, _super);
    function CourseApi(http, errorHandler) {
        _super.call(this, http, errorHandler);
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
    CourseApi.prototype.__findById__courseHoles = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/courses/:id/courseHoles/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    CourseApi.prototype.__destroyById__courseHoles = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/courses/:id/courseHoles/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    CourseApi.prototype.__updateById__courseHoles = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/courses/:id/courseHoles/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    CourseApi.prototype.__get__courseHoles = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/courses/:id/courseHoles";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    CourseApi.prototype.__create__courseHoles = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/courses/:id/courseHoles";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    CourseApi.prototype.__delete__courseHoles = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/courses/:id/courseHoles";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    CourseApi.prototype.__count__courseHoles = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/courses/:id/courseHoles/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    CourseApi.prototype.create = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/courses";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    CourseApi.prototype.createMany = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/courses";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    CourseApi.prototype.upsert = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/courses";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    CourseApi.prototype.exists = function (id) {
        var method = "GET";
        var url = this.getPath() + "/courses/:id/exists";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    CourseApi.prototype.findById = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/courses/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    CourseApi.prototype.find = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/courses";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    CourseApi.prototype.findOne = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/courses/findOne";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    CourseApi.prototype.updateAll = function (where, data) {
        if (where === void 0) { where = undefined; }
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/courses/update";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    CourseApi.prototype.deleteById = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/courses/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    CourseApi.prototype.count = function (where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/courses/count";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    CourseApi.prototype.updateAttributes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/courses/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    CourseApi.prototype.createChangeStream = function (options) {
        if (options === void 0) { options = undefined; }
        var method = "POST";
        var url = this.getPath() + "/courses/change-stream";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
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
    CourseApi.prototype.__get__event__course = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/events/:id/course";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    CourseApi.prototype.__get__course_hole__course = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/course_holes/:id/course";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * The name of the model represented by this $resource,
     * i.e. `Course`.
     */
    CourseApi.prototype.getModelName = function () {
        return "Course";
    };
    CourseApi = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(http_1.Http)),
        __param(1, core_1.Optional()),
        __param(1, core_1.Inject(ErrorHandler)), 
        __metadata('design:paramtypes', [http_1.Http, ErrorHandler])
    ], CourseApi);
    return CourseApi;
}(BaseLoopBackApi));
exports.CourseApi = CourseApi;
/**
 * Api for the `Event` model.
 */
var EventApi = (function (_super) {
    __extends(EventApi, _super);
    function EventApi(http, errorHandler) {
        _super.call(this, http, errorHandler);
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
    EventApi.prototype.__get__course = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/events/:id/course";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    EventApi.prototype.__findById__rounds = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/events/:id/rounds/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    EventApi.prototype.__destroyById__rounds = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/events/:id/rounds/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    EventApi.prototype.__updateById__rounds = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/events/:id/rounds/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    EventApi.prototype.__get__rounds = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/events/:id/rounds";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    EventApi.prototype.__create__rounds = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/events/:id/rounds";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    EventApi.prototype.__delete__rounds = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/events/:id/rounds";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    EventApi.prototype.__count__rounds = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/events/:id/rounds/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    EventApi.prototype.create = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/events";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    EventApi.prototype.createMany = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/events";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    EventApi.prototype.upsert = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/events";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    EventApi.prototype.exists = function (id) {
        var method = "GET";
        var url = this.getPath() + "/events/:id/exists";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    EventApi.prototype.findById = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/events/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    EventApi.prototype.find = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/events";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    EventApi.prototype.findOne = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/events/findOne";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    EventApi.prototype.updateAll = function (where, data) {
        if (where === void 0) { where = undefined; }
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/events/update";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    EventApi.prototype.deleteById = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/events/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    EventApi.prototype.count = function (where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/events/count";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    EventApi.prototype.updateAttributes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/events/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    EventApi.prototype.createChangeStream = function (options) {
        if (options === void 0) { options = undefined; }
        var method = "POST";
        var url = this.getPath() + "/events/change-stream";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
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
    EventApi.prototype.__get__round__event = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/rounds/:id/event";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * The name of the model represented by this $resource,
     * i.e. `Event`.
     */
    EventApi.prototype.getModelName = function () {
        return "Event";
    };
    EventApi = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(http_1.Http)),
        __param(1, core_1.Optional()),
        __param(1, core_1.Inject(ErrorHandler)), 
        __metadata('design:paramtypes', [http_1.Http, ErrorHandler])
    ], EventApi);
    return EventApi;
}(BaseLoopBackApi));
exports.EventApi = EventApi;
/**
 * Api for the `Round` model.
 */
var RoundApi = (function (_super) {
    __extends(RoundApi, _super);
    function RoundApi(http, errorHandler) {
        _super.call(this, http, errorHandler);
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
    RoundApi.prototype.__get__event = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/rounds/:id/event";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    RoundApi.prototype.__findById__holes = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/rounds/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    RoundApi.prototype.__destroyById__holes = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/rounds/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    RoundApi.prototype.__updateById__holes = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/rounds/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    RoundApi.prototype.__get__holes = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/rounds/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    RoundApi.prototype.__create__holes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/rounds/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    RoundApi.prototype.__delete__holes = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/rounds/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    RoundApi.prototype.__count__holes = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/rounds/:id/holes/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    RoundApi.prototype.create = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/rounds";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    RoundApi.prototype.createMany = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/rounds";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    RoundApi.prototype.upsert = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/rounds";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    RoundApi.prototype.exists = function (id) {
        var method = "GET";
        var url = this.getPath() + "/rounds/:id/exists";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    RoundApi.prototype.findById = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/rounds/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    RoundApi.prototype.find = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/rounds";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    RoundApi.prototype.findOne = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/rounds/findOne";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    RoundApi.prototype.updateAll = function (where, data) {
        if (where === void 0) { where = undefined; }
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/rounds/update";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    RoundApi.prototype.deleteById = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/rounds/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    RoundApi.prototype.count = function (where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/rounds/count";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    RoundApi.prototype.updateAttributes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/rounds/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    RoundApi.prototype.createChangeStream = function (options) {
        if (options === void 0) { options = undefined; }
        var method = "POST";
        var url = this.getPath() + "/rounds/change-stream";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
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
    RoundApi.prototype.__findById__event__rounds = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/events/:id/rounds/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    RoundApi.prototype.__destroyById__event__rounds = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/events/:id/rounds/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    RoundApi.prototype.__updateById__event__rounds = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/events/:id/rounds/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    RoundApi.prototype.__get__event__rounds = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/events/:id/rounds";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    RoundApi.prototype.__create__event__rounds = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/events/:id/rounds";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    RoundApi.prototype.__createMany__event__rounds = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/events/:id/rounds";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    RoundApi.prototype.__delete__event__rounds = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/events/:id/rounds";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    RoundApi.prototype.__count__event__rounds = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/events/:id/rounds/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    RoundApi.prototype.__get__hole__round = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/holes/:id/round";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * The name of the model represented by this $resource,
     * i.e. `Round`.
     */
    RoundApi.prototype.getModelName = function () {
        return "Round";
    };
    RoundApi = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(http_1.Http)),
        __param(1, core_1.Optional()),
        __param(1, core_1.Inject(ErrorHandler)), 
        __metadata('design:paramtypes', [http_1.Http, ErrorHandler])
    ], RoundApi);
    return RoundApi;
}(BaseLoopBackApi));
exports.RoundApi = RoundApi;
/**
 * Api for the `Course_hole` model.
 */
var Course_holeApi = (function (_super) {
    __extends(Course_holeApi, _super);
    function Course_holeApi(http, errorHandler) {
        _super.call(this, http, errorHandler);
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
    Course_holeApi.prototype.__get__course = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/course_holes/:id/course";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    Course_holeApi.prototype.create = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/course_holes";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    Course_holeApi.prototype.createMany = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/course_holes";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    Course_holeApi.prototype.upsert = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/course_holes";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    Course_holeApi.prototype.exists = function (id) {
        var method = "GET";
        var url = this.getPath() + "/course_holes/:id/exists";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    Course_holeApi.prototype.findById = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/course_holes/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    Course_holeApi.prototype.find = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/course_holes";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    Course_holeApi.prototype.findOne = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/course_holes/findOne";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    Course_holeApi.prototype.updateAll = function (where, data) {
        if (where === void 0) { where = undefined; }
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/course_holes/update";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    Course_holeApi.prototype.deleteById = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/course_holes/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    Course_holeApi.prototype.count = function (where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/course_holes/count";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    Course_holeApi.prototype.updateAttributes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/course_holes/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    Course_holeApi.prototype.createChangeStream = function (options) {
        if (options === void 0) { options = undefined; }
        var method = "POST";
        var url = this.getPath() + "/course_holes/change-stream";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
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
    Course_holeApi.prototype.__findById__course__courseHoles = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/courses/:id/courseHoles/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    Course_holeApi.prototype.__destroyById__course__courseHoles = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/courses/:id/courseHoles/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    Course_holeApi.prototype.__updateById__course__courseHoles = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/courses/:id/courseHoles/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    Course_holeApi.prototype.__get__course__courseHoles = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/courses/:id/courseHoles";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    Course_holeApi.prototype.__create__course__courseHoles = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/courses/:id/courseHoles";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    Course_holeApi.prototype.__createMany__course__courseHoles = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/courses/:id/courseHoles";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    Course_holeApi.prototype.__delete__course__courseHoles = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/courses/:id/courseHoles";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    Course_holeApi.prototype.__count__course__courseHoles = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/courses/:id/courseHoles/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    Course_holeApi.prototype.__get__hole__course_hole = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/holes/:id/course_hole";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * The name of the model represented by this $resource,
     * i.e. `Course_hole`.
     */
    Course_holeApi.prototype.getModelName = function () {
        return "Course_hole";
    };
    Course_holeApi = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(http_1.Http)),
        __param(1, core_1.Optional()),
        __param(1, core_1.Inject(ErrorHandler)), 
        __metadata('design:paramtypes', [http_1.Http, ErrorHandler])
    ], Course_holeApi);
    return Course_holeApi;
}(BaseLoopBackApi));
exports.Course_holeApi = Course_holeApi;
/**
 * Api for the `Penalty` model.
 */
var PenaltyApi = (function (_super) {
    __extends(PenaltyApi, _super);
    function PenaltyApi(http, errorHandler) {
        _super.call(this, http, errorHandler);
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
    PenaltyApi.prototype.__findById__holes = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/penalties/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.__destroyById__holes = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/penalties/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.__updateById__holes = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/penalties/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PenaltyApi.prototype.__link__holes = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/penalties/:id/holes/rel/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PenaltyApi.prototype.__unlink__holes = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/penalties/:id/holes/rel/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.__exists__holes = function (id, fk) {
        var method = "HEAD";
        var url = this.getPath() + "/penalties/:id/holes/rel/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.__get__holes = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/penalties/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.__create__holes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/penalties/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PenaltyApi.prototype.__delete__holes = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/penalties/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.__count__holes = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/penalties/:id/holes/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.create = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/penalties";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PenaltyApi.prototype.createMany = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/penalties";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PenaltyApi.prototype.upsert = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/penalties";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PenaltyApi.prototype.exists = function (id) {
        var method = "GET";
        var url = this.getPath() + "/penalties/:id/exists";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.findById = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/penalties/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.find = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/penalties";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.findOne = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/penalties/findOne";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.updateAll = function (where, data) {
        if (where === void 0) { where = undefined; }
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/penalties/update";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PenaltyApi.prototype.deleteById = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/penalties/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.count = function (where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/penalties/count";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.updateAttributes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/penalties/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PenaltyApi.prototype.createChangeStream = function (options) {
        if (options === void 0) { options = undefined; }
        var method = "POST";
        var url = this.getPath() + "/penalties/change-stream";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
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
    PenaltyApi.prototype.__findById__hole__penalties = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/holes/:id/penalties/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.__destroyById__hole__penalties = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/holes/:id/penalties/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.__updateById__hole__penalties = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/holes/:id/penalties/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PenaltyApi.prototype.__link__hole__penalties = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/holes/:id/penalties/rel/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PenaltyApi.prototype.__unlink__hole__penalties = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/holes/:id/penalties/rel/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.__exists__hole__penalties = function (id, fk) {
        var method = "HEAD";
        var url = this.getPath() + "/holes/:id/penalties/rel/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.__get__hole__penalties = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/holes/:id/penalties";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.__create__hole__penalties = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/holes/:id/penalties";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PenaltyApi.prototype.__createMany__hole__penalties = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/holes/:id/penalties";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    PenaltyApi.prototype.__delete__hole__penalties = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/holes/:id/penalties";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    PenaltyApi.prototype.__count__hole__penalties = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/holes/:id/penalties/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * The name of the model represented by this $resource,
     * i.e. `Penalty`.
     */
    PenaltyApi.prototype.getModelName = function () {
        return "Penalty";
    };
    PenaltyApi = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(http_1.Http)),
        __param(1, core_1.Optional()),
        __param(1, core_1.Inject(ErrorHandler)), 
        __metadata('design:paramtypes', [http_1.Http, ErrorHandler])
    ], PenaltyApi);
    return PenaltyApi;
}(BaseLoopBackApi));
exports.PenaltyApi = PenaltyApi;
/**
 * Api for the `Hole` model.
 */
var HoleApi = (function (_super) {
    __extends(HoleApi, _super);
    function HoleApi(http, errorHandler) {
        _super.call(this, http, errorHandler);
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
    HoleApi.prototype.__get__round = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/holes/:id/round";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__get__course_hole = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/holes/:id/course_hole";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__get__player = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/holes/:id/player";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__findById__penalties = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/holes/:id/penalties/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__destroyById__penalties = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/holes/:id/penalties/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__updateById__penalties = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/holes/:id/penalties/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.__link__penalties = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/holes/:id/penalties/rel/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.__unlink__penalties = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/holes/:id/penalties/rel/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__exists__penalties = function (id, fk) {
        var method = "HEAD";
        var url = this.getPath() + "/holes/:id/penalties/rel/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__get__penalties = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/holes/:id/penalties";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__create__penalties = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/holes/:id/penalties";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.__delete__penalties = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/holes/:id/penalties";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__count__penalties = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/holes/:id/penalties/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.create = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/holes";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.createMany = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/holes";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.upsert = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/holes";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.exists = function (id) {
        var method = "GET";
        var url = this.getPath() + "/holes/:id/exists";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.findById = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/holes/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.find = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/holes";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.findOne = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/holes/findOne";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.updateAll = function (where, data) {
        if (where === void 0) { where = undefined; }
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/holes/update";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.deleteById = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/holes/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.count = function (where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/holes/count";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.updateAttributes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/holes/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.createChangeStream = function (options) {
        if (options === void 0) { options = undefined; }
        var method = "POST";
        var url = this.getPath() + "/holes/change-stream";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
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
    HoleApi.prototype.__findById__player__holes = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/players/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__destroyById__player__holes = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/players/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__updateById__player__holes = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/players/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.__get__player__holes = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/players/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__create__player__holes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/players/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.__createMany__player__holes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/players/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.__delete__player__holes = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/players/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__count__player__holes = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/players/:id/holes/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__findById__round__holes = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/rounds/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__destroyById__round__holes = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/rounds/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__updateById__round__holes = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/rounds/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.__get__round__holes = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/rounds/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__create__round__holes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/rounds/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.__createMany__round__holes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/rounds/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.__delete__round__holes = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/rounds/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__count__round__holes = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/rounds/:id/holes/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__findById__penalty__holes = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/penalties/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__destroyById__penalty__holes = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/penalties/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__updateById__penalty__holes = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/penalties/:id/holes/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.__link__penalty__holes = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/penalties/:id/holes/rel/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.__unlink__penalty__holes = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/penalties/:id/holes/rel/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__exists__penalty__holes = function (id, fk) {
        var method = "HEAD";
        var url = this.getPath() + "/penalties/:id/holes/rel/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__get__penalty__holes = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/penalties/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__create__penalty__holes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/penalties/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.__createMany__penalty__holes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/penalties/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
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
    HoleApi.prototype.__delete__penalty__holes = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/penalties/:id/holes";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
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
    HoleApi.prototype.__count__penalty__holes = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/penalties/:id/holes/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * The name of the model represented by this $resource,
     * i.e. `Hole`.
     */
    HoleApi.prototype.getModelName = function () {
        return "Hole";
    };
    HoleApi = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(http_1.Http)),
        __param(1, core_1.Optional()),
        __param(1, core_1.Inject(ErrorHandler)), 
        __metadata('design:paramtypes', [http_1.Http, ErrorHandler])
    ], HoleApi);
    return HoleApi;
}(BaseLoopBackApi));
exports.HoleApi = HoleApi;
