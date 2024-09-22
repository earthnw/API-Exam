const { defineConfig } = require("cypress");
const sqlServer = require("cypress-sql-server");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      config.db = {
        userName: "user",
        password: "pass",
        server: "xx.xx.xx",
        options: {
          database: "xxx",
          encrypt: true,
          rowCollectionOnRequestCompletion: true,
        },
      };
      const tasks = sqlServer.loadDBPlugin(config.db);
      on("task", tasks);
      return config;
    },
  },
});
