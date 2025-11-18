class LoginPage {
  constructor(page) {
    this.page = page;

    this.input = {
      emailInput: page.locator('#email'),
      passwordInput: page.locator('#password'),
      emailErrorInput: page.locator('#email-group .invalid-feedback'),
      passwordErrorInput: page.locator('#password-group .invalid-feedback'),
    };

    this.btn = {
      continue: page.getByRole('button', { name: 'Entrar', exact: true }),
    };
  }

  async navigate(path) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForURL(`**${path}**`, { timeout: 30000 });
    return this.page.url().includes(path);
  }

  async login(credentials) {
    await this.input.emailInput.fill(credentials.email || '');
    await this.input.passwordInput.fill(credentials.password || '');
    return await this.btn.continue.click();
  }

  async getEmailErrorMessage() {
    await this.input.emailErrorInput.waitFor({ state: 'visible' });
    return this.input.emailErrorInput.textContent();
  }

  async getPasswordErrorMessage() {
    await this.input.passwordErrorInput.waitFor({ state: 'visible' });
    return this.input.passwordErrorInput.textContent();
  }
}

module.exports = { LoginPage };
