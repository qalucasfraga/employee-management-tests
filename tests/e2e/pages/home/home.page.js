class HomePage {
	constructor(page) {
		this.page = page;

		this.el = {
			avatarImage: page.locator('img[title="Foto do usuário"]'),
		};
	}

	async isCheckAvatarProfile() {
		await this.el.avatarImage.waitFor({ state: 'attached', timeout: 60000 });
		await this.el.avatarImage.waitFor({ state: 'visible', timeout: 60000 });
		return await this.el.avatarImage.isVisible();
	}
}

module.exports = { HomePage };
