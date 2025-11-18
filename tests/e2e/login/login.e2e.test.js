const { pw, common, login, home } = require('../../../lib/utils/e2e-import-utils');
const { test, expect } = pw;

const setupTest = async ({ page }) => {
  const loginPage = new login.pages.LoginPage(page);
  const homePage = new home.pages.HomePage(page);

  return { loginPage, homePage };
};

test.describe.parallel('[E2E - LOGIN] :: Employee Management @regression', () => {
  let loginPage;
  let homePage;

  test.beforeEach(async ({ page }) => {
    ({ loginPage, homePage } = await setupTest({ page }));

    await loginPage.navigate('/login');
    await page.waitForLoadState('networkidle');
  });

  test('login successful @success', async ({ page }) => {
    await loginPage.login(common.helpers.validCredentials);
    expect(await homePage.isCheckAvatarProfile()).toBeTruthy();
  });

  test.describe('Invalid Credentials @negative', () => {
    test('login with random invalid credentials @negative', async ({ page }) => {
      await loginPage.login(common.helpers.invalidCredentials);

      await page.waitForURL((url) => url.toString().includes('doutorfinancas.pt/login'));
    });

    const specificCredentials = [
      { name: 'a wrong password', type: 'wrongPassword' },
      { name: 'a password injection', type: 'passwordInjection' },
      { name: 'a long password', type: 'longPassword' },
      { name: 'a special chars', type: 'specialChars' },
    ];

    for (const testCase of specificCredentials) {
      test(`login with ${testCase.name} @negative`, async ({ page }) => {
        const data = common.helpers.getInvalidCredentials(testCase.type);
        await loginPage.login(data);

        await page.waitForURL((url) => url.toString().includes('doutorfinancas.pt/login'));
      });
    }
  });

  test.describe('Input Validation Errors @negative', () => {
    const emailCredentials = [
      { name: 'an invalid email', type: 'invalidEmail' },
      { name: 'an unicode', type: 'unicode' },
      { name: 'an user with sql injection', type: 'sqlInjection' },
    ];

    for (const testCase of emailCredentials) {
      test(`login with ${testCase.name} @negative`, async ({ page }) => {
        const data = common.helpers.getInvalidCredentials(testCase.type);
        await loginPage.login(data);

        const inputError = await loginPage.getEmailErrorMessage();
        expect(await inputError).toContain(login.messages.ERROR.REQUIRED_FIELD);
      });
    }
  });

  test.describe('Password Validation Errors @negative', () => {
    test('login with missing password @negative', async ({ page }) => {
      const data = common.helpers.getInvalidCredentials('missingPassword');
      await loginPage.login(data);

      const inputError = await loginPage.getPasswordErrorMessage();
      expect(await inputError).toContain(login.messages.ERROR.REQUIRED_FIELD);
    });
  });

  test('login with SQL injection in password @negative', async ({ page }) => {
    const sqlInjectionCredentials = common.helpers.getInvalidCredentials('sqlInjection');
    sqlInjectionCredentials.password = '\' OR \'1\'=\'1';

    await loginPage.login(sqlInjectionCredentials);

    const inputError = await loginPage.getEmailErrorMessage();
    expect(await inputError).toContain(login.messages.ERROR.REQUIRED_FIELD);
  });
});
