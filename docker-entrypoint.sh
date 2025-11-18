#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const allureDir = path.join('/app', 'allure-results');
if (!fs.existsSync(allureDir)) {
  fs.mkdirSync(allureDir, { recursive: true });
}

const testType = process.argv[2];
const grepTag = process.argv[3] || '@regression';
const grepInvertTags = process.argv[4] || '@notImplemented|@bug|@error';

const baseCommand = (project) => 
  `yarn playwright test --project ${project} --grep "${grepTag}" --grep-invert "${grepInvertTags}" --reporter=allure-playwright`;

try {
  switch (testType) {
    case 'api':
      console.log(`Running API tests with filter: ${grepTag}, excluding: ${grepInvertTags}`);
      execSync(baseCommand('api'), { stdio: 'inherit' });
      break;
    case 'e2e':
      console.log(`Running E2E tests with filter: ${grepTag}, excluding: ${grepInvertTags}`);
      execSync(baseCommand('e2e'), { stdio: 'inherit' });
      break;
    case 'all':
      console.log(`Running all tests with filter: ${grepTag}, excluding: ${grepInvertTags}`);
      execSync(`${baseCommand('api')} && ${baseCommand('e2e')}`, { stdio: 'inherit' });
      break;
    default:
      console.error('Usage: node docker-entrypoint.js <api|e2e|all> [grepTag] [grepInvertTags]');
      process.exit(1);
  }
} catch (error) {
  console.error('Test execution failed:', error.message);
  process.exit(error.status || 1);
}