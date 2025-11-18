const { pw, http, auth, login, messages } = require('../../../lib/utils/api-import-utils');
const { test, expect } = pw;

const validateNegativeResponse = async (response) => {
  expect([http.OK, http.UNAUTHORIZED, http.BAD_REQUEST, http.INTERNAL_SERVER_ERROR].includes(response.status())).toBeTruthy();

  if (response.status() === http.OK) {
    const responseText = await response.text();
    if (responseText) {
      const error = JSON.parse(responseText);
      expect(error).toMatchSchema(login.schemas.errorSchema);
      expect(error.status).toBe(messages.COMMON.STATUS.ERROR);
      expect(error.message).toContain(login.messages.ERROR.AUTHENTICATION_FAILED);
    }
  }
};

test.describe.parallel('[API - LOGIN] :: Identity Service @regression', () => {
  test.describe('Authentication', () => {
    test('get global auth token successfully @success', async ({ request }) => {
      const token = await auth.helpers.getToken(request);
      expect(token).toBeTruthy();
    });

    test('login successfully @success', async ({ request }) => {
      const response = await login.helpers.loginApi(request);
      expect(response.status()).toBe(http.OK);

      const loginResponseBody = await response.json();
      expect(loginResponseBody).toMatchSchema(login.schemas.successSchema);
      expect(loginResponseBody.status).toBe(messages.COMMON.STATUS.SUCCESS);
      expect(loginResponseBody.token).toBeTruthy();
    });
  });

  test.describe('Input Validation - Missing Fields', () => {
    test('login with blank data @negative', async ({ request }) => {
      const response = await login.helpers.loginApi(request, 'blank');
      await validateNegativeResponse(response);
    });

    test('login with invalid email format @negative', async ({ request }) => {
      const response = await login.helpers.loginApi(request, 'invalidEmail');
      await validateNegativeResponse(response);
    });

    test('login without email field @negative', async ({ request }) => {
      const response = await login.helpers.loginApi(request, 'missingEmail');
      expect([http.UNAUTHORIZED, http.INTERNAL_SERVER_ERROR].includes(response.status())).toBeTruthy();
    });

    test('login with empty data @negative', async ({ request }) => {
      const response = await login.helpers.loginApi(request, 'empty');
      expect([http.UNAUTHORIZED, http.INTERNAL_SERVER_ERROR].includes(response.status())).toBeTruthy();

      if (response.status() === http.OK) {
        const error = await response.json();
        expect(error).toMatchSchema(login.schemas.errorSchema);
        expect(error.status).toBe(messages.COMMON.STATUS.ERROR);
        expect(error.message).toContain(login.messages.ERROR.AUTHENTICATION_FAILED);
      }
    });

    test('login without password field @negative', async ({ request }) => {
      const response = await login.helpers.loginApi(request, 'missingPassword');
      expect([http.UNAUTHORIZED, http.INTERNAL_SERVER_ERROR].includes(response.status())).toBeTruthy();

      if (response.status() === http.OK) {
        const error = await response.json();
        expect(error).toMatchSchema(login.schemas.errorSchema);
        expect(error.status).toBe(messages.COMMON.STATUS.ERROR);
        expect(error.message).toContain(login.messages.ERROR.AUTHENTICATION_FAILED);
      }
    });

    test('login with empty object @negative', async ({ request }) => {
      const response = await login.helpers.loginApi(request, 'empty_object');
      expect([http.UNAUTHORIZED, http.INTERNAL_SERVER_ERROR].includes(response.status())).toBeTruthy();

      if (response.status() === http.OK) {
        const error = await response.json();
        expect(error).toMatchSchema(login.schemas.errorSchema);
        expect(error.status).toBe(messages.COMMON.STATUS.ERROR);
        expect(error.message).toContain(login.messages.ERROR.AUTHENTICATION_FAILED);
      }
    });

    test('login with null values @negative', async ({ request }) => {
      const response = await login.helpers.loginApi(request, 'nullValues');
      expect([http.UNAUTHORIZED, http.INTERNAL_SERVER_ERROR].includes(response.status())).toBeTruthy();

      if (response.status() === http.OK) {
        const error = await response.json();
        expect(error).toMatchSchema(login.schemas.errorSchema);
        expect(error.status).toBe(messages.COMMON.STATUS.ERROR);
        expect(error.message).toContain(login.messages.ERROR.AUTHENTICATION_FAILED);
      }
    });
  });

  test.describe('Input Format Tests', () => {
    test('login with special characters in email @negative', async ({ request }) => {
      const response = await login.helpers.loginApi(request, 'specialChars');
      expect([http.UNAUTHORIZED, http.INTERNAL_SERVER_ERROR].includes(response.status())).toBeTruthy();

      if (response.status() === http.OK) {
        const error = await response.json();
        expect(error).toMatchSchema(login.schemas.errorSchema);
        expect(error.status).toBe(messages.COMMON.STATUS.ERROR);
        expect(error.message).toContain(login.messages.ERROR.AUTHENTICATION_FAILED);
      }
    });

    test('login with unicode characters in email @negative', async ({ request }) => {
      const response = await login.helpers.loginApi(request, 'unicode');
      expect([http.UNAUTHORIZED, http.INTERNAL_SERVER_ERROR].includes(response.status())).toBeTruthy();

      if (response.status() === http.OK) {
        const error = await response.json();
        expect(error).toMatchSchema(login.schemas.errorSchema);
        expect(error.status).toBe(messages.COMMON.STATUS.ERROR);
        expect(error.message).toContain(login.messages.ERROR.AUTHENTICATION_FAILED);
      }
    });

    test('login with too short email @negative', async ({ request }) => {
      const response = await login.helpers.loginApi(request, 'tooShort');
      expect([http.UNAUTHORIZED, http.INTERNAL_SERVER_ERROR].includes(response.status())).toBeTruthy();

      if (response.status() === http.OK) {
        const error = await response.json();
        expect(error).toMatchSchema(login.schemas.errorSchema);
        expect(error.status).toBe(messages.COMMON.STATUS.ERROR);
        expect(error.message).toContain(login.messages.ERROR.AUTHENTICATION_FAILED);
      }
    });

    test('login with too long email @negative', async ({ request }) => {
      const response = await login.helpers.loginApi(request, 'tooLong');
      expect([http.UNAUTHORIZED, http.INTERNAL_SERVER_ERROR].includes(response.status())).toBeTruthy();

      if (response.status() === http.OK) {
        const error = await response.json();
        expect(error).toMatchSchema(login.schemas.errorSchema);
        expect(error.status).toBe(messages.COMMON.STATUS.ERROR);
        expect(error.message).toContain(login.messages.ERROR.AUTHENTICATION_FAILED);
      }
    });

    test('login with unregistered email @negative', async ({ request }) => {
      const response = await login.helpers.loginApi(request, 'unregistered');
      expect([http.UNAUTHORIZED, http.INTERNAL_SERVER_ERROR].includes(response.status())).toBeTruthy();

      if (response.status() === http.OK) {
        const error = await response.json();
        expect(error).toMatchSchema(login.schemas.errorSchema);
        expect(error.status).toBe(messages.COMMON.STATUS.ERROR);
        expect(error.message).toContain(login.messages.ERROR.AUTHENTICATION_FAILED);
      }
    });
  });

  test.describe('Credential Validation', () => {
    test('login with invalid credentials @negative', async ({ request }) => {
      const response = await login.helpers.loginApi(request, 'random');
      expect([http.UNAUTHORIZED, http.INTERNAL_SERVER_ERROR].includes(response.status())).toBeTruthy();

      if (response.status() === http.OK) {
        const error = await response.json();
        expect(error).toMatchSchema(login.schemas.errorSchema);
        expect(error.status).toBe(messages.COMMON.STATUS.ERROR);
        expect(error.message).toContain(login.messages.ERROR.AUTHENTICATION_FAILED);
      }
    });

    test('login with correct email but wrong password @negative', async ({ request }) => {
      const response = await login.helpers.loginApi(request, 'wrongPassword');
      expect([http.UNAUTHORIZED, http.INTERNAL_SERVER_ERROR].includes(response.status())).toBeTruthy();

      if (response.status() === http.OK) {
        const error = await response.json();
        expect(error).toMatchSchema(login.schemas.errorSchema);
        expect(error.status).toBe(messages.COMMON.STATUS.ERROR);
        expect(error.message).toContain(login.messages.ERROR.AUTHENTICATION_FAILED);
      }
    });

    test('login with custom invalid data @negative', async ({ request }) => {
      const customCredentials = {
        username: 'custom@test.com',
        password: 'invalid_custom_password',
      };

      const response = await login.helpers.loginApi(request, customCredentials);
      expect([http.UNAUTHORIZED, http.INTERNAL_SERVER_ERROR].includes(response.status())).toBeTruthy();

      if (response.status() === http.OK) {
        const error = await response.json();
        expect(error).toMatchSchema(login.schemas.errorSchema);
        expect(error.status).toBe(messages.COMMON.STATUS.ERROR);
        expect(error.message).toContain(login.messages.ERROR.AUTHENTICATION_FAILED);
      }
    });
  });

  test.describe('Security Tests', () => {
    test('login with SQL injection in email @negative', async ({ request }) => {
      const response = await login.helpers.loginApi(request, 'sqlInjection');
      expect([http.UNAUTHORIZED, http.INTERNAL_SERVER_ERROR].includes(response.status())).toBeTruthy();

      if (response.status() === http.OK) {
        const error = await response.json();
        expect(error).toMatchSchema(login.schemas.errorSchema);
        expect(error.status).toBe(messages.COMMON.STATUS.ERROR);
        expect(error.message).toContain(login.messages.ERROR.AUTHENTICATION_FAILED);
      }
    });

    test('login with SQL injection in password @negative', async ({ request }) => {
      const response = await login.helpers.loginApi(request, 'passwordInjection');
      expect([http.UNAUTHORIZED, http.INTERNAL_SERVER_ERROR].includes(response.status())).toBeTruthy();

      if (response.status() === http.OK) {
        const error = await response.json();
        expect(error).toMatchSchema(login.schemas.errorSchema);
        expect(error.status).toBe(messages.COMMON.STATUS.ERROR);
        expect(error.message).toContain(login.messages.ERROR.AUTHENTICATION_FAILED);
      }
    });

    test('login with very long password @negative', async ({ request }) => {
      const response = await login.helpers.loginApi(request, 'longPassword');
      expect([http.UNAUTHORIZED, http.INTERNAL_SERVER_ERROR].includes(response.status())).toBeTruthy();

      if (response.status() === http.OK) {
        const error = await response.json();
        expect(error).toMatchSchema(login.schemas.errorSchema);
        expect(error.status).toBe(messages.COMMON.STATUS.ERROR);
        expect(error.message).toContain(login.messages.ERROR.AUTHENTICATION_FAILED);
      }
    });
  });
});
