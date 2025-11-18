const { fakerPT_PT: faker } = require('@faker-js/faker');

const validCredentials = {
  email: process.env.TEST_USER_EMPLOYEE,
  password: process.env.TEST_PASSWORD,
};

const invalidCredentials = {
  email: faker.internet.email().toLowerCase(),
  password: faker.internet.password(),
};

const getInvalidCredentials = (type = 'random') => {
  switch (type) {
  case 'empty':
    return { email: '', password: '' };
  case 'blank':
    return { email: ' ', password: ' ' };
  case 'wrongPassword':
    return { ...validCredentials, password: faker.internet.password() };
  case 'invalidEmail':
    return { ...validCredentials, email: 'invalid-email' };
  case 'sqlInjection':
    return { ...validCredentials, email: 'admin@example.com\' OR \'1\'=\'1' };
  case 'passwordInjection':
    return { ...validCredentials, password: '\' OR \'1\'=\'1' };
  case 'longPassword':
    return { ...validCredentials, password: 'a'.repeat(1000) };
  case 'specialChars':
    return { ...validCredentials, email: 'test+special@example.com' };
  case 'missingEmail':
    return { password: validCredentials.password };
  case 'missingPassword':
    return { email: validCredentials.email };
  case 'empty_object':
    return {};
  case 'nullValues':
    return { email: null, password: null };
  case 'unicode':
    return { ...validCredentials, email: 'test🔑@example.com' };
  default:
    return invalidCredentials;
  }
};

async function performLogin(page, loginPage, homePage) {
  await loginPage.navigate('/login');
  await loginPage.login(validCredentials);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForURL(/.*\/agenda/, { timeout: 90000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  return homePage.isCheckAvatarProfile();
}

module.exports = {
  validCredentials,
  invalidCredentials,
  getInvalidCredentials,
  performLogin,
};
