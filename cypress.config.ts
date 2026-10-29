import { defineConfig } from "cypress";
import { plugin as cypressGrepPlugin } from "@cypress/grep/plugin";
import { addMatchImageSnapshotPlugin } from "@simonsmith/cypress-image-snapshot/plugin";

export default defineConfig({
    e2e: {
        baseUrl: "https://practicesoftwaretesting.com",
        viewportWidth: 1280,
        viewportHeight: 720,
        retries: {
            runMode: 2,     // cypress run (CI): до 2 повторов упавшего теста
            openMode: 0,    // cypress open (локально): без повторов, чтобы видеть падения сразу
        },
        expose: {
            lang: "en",     // язык сайта по умолчанию; другой: --expose lang=de
        },

        setupNodeEvents(on, config) {
            cypressGrepPlugin(config); // нужен для фильтрации файлов
            addMatchImageSnapshotPlugin(on); // сравнение картинок выполняется в Node
            return config;
        },
    },
});