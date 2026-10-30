const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './extension-tests',
  workers: 1,
  timeout: 180000,
  expect: { timeout: 15000 },
  reporter: 'list',
});
