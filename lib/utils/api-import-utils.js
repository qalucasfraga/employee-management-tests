const { test, expect } = require('@playwright/test');
const { StatusCodes } = require('http-status-codes');
const commonAPI = require('../api/common/common-api-helper');
const authHelper = require('../api/auth/auth-api-helper');
const loginHelper = require('../api/login/login-api-helper');

const {
  loginSuccessResponseSchema,
  loginErrorResponseSchema,
} = require('../../tests/schema/login/login.schema');

const {
  MESSAGES,
} = require('../constants/messages');

module.exports = {
  pw: {
    test,
    expect,
  },

  http: StatusCodes,

  common: {
    validCredentials: commonAPI.validCredentials,
    getCredentials: commonAPI.getCredentials,
    postRequest: commonAPI.postRequest,
    getRequest: commonAPI.getRequest,
    loadJsonData: commonAPI.loadJsonData,
    modifyData: commonAPI.modifyData,
  },

  auth: {
    helpers: {
      getToken: authHelper.getToken,
      clearCache: authHelper.clearCache,
    },
  },

  login: {
    helpers: {
      loginApi: loginHelper.loginApi,
      getLoginBody: loginHelper.getLoginBody,
    },
    schemas: {
      successSchema: loginSuccessResponseSchema,
      errorSchema: loginErrorResponseSchema,
    },
    messages: MESSAGES.LOGIN,
  },

  messages: MESSAGES,
};
