const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,
  reporter: 'nyan',

  e2e: {
    baseUrl: "https://wlsf82-hacker-stories.web.app",
  },
});
