FROM mcr.microsoft.com/playwright:v1.56.0-noble

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs && \
    npm install -g yarn && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_VERSION=22 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    CI=true

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile && \
    yarn cache clean && \
    npx playwright install chromium

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

COPY . .

RUN mkdir -p /app/allure-results && \
    chown -R pwuser:pwuser /app /docker-entrypoint.sh /app/allure-results && \
    chmod 755 /app/allure-results

USER pwuser

ENTRYPOINT ["/docker-entrypoint.sh"]