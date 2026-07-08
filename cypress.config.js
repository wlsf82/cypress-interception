const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl: "https://wlsf82-hacker-stories.web.app",
    supportFile: false,
  },
});
