class CommonPage {
  constructor(page) {
    this.page = page;

    this.el = {
      test: page.locator('example'),
    };
  }
}

module.exports = { CommonPage };
