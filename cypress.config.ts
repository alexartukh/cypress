import { defineConfig } from "cypress";
import { plugin as cypressGrepPlugin } from "@cypress/grep/plugin";

export default defineConfig({
  e2e: {
    baseUrl: "https://practicesoftwaretesting.com",
    viewportWidth: 1280,    // как Desktop Chrome в Playwright
    viewportHeight: 720,
    expose: {
      lang: "en",
    },

    setupNodeEvents(on, config) {
      cypressGrepPlugin(config); // нужен для фильтрации файлов
      return config;
    },
  },
});