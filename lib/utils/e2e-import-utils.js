const { test, expect } = require('@playwright/test');
const commonE2E = require('../../tests/e2e/common/common-e2e');
const apiUtils = require('./api-import-utils');
const { CommonPage } = require('../../tests/e2e/pages/common/common.page');
const { LoginPage } = require('../../tests/e2e/pages/login/login.page');
const { HomePage } = require('../../tests/e2e/pages/home/home.page');
const { MESSAGES } = require('../constants/messages');

module.exports = {
  pw: { test, expect },
  api: apiUtils,
  common: {
    helpers: commonE2E,
    pages: { CommonPage },
  },
  login: {
    pages: { LoginPage },
    messages: MESSAGES.LOGIN,
  },
  home: {
    pages: { HomePage },
  },
};
