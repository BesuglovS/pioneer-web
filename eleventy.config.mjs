import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const PROJECT = path.dirname(__filename);
const SRC = path.join(PROJECT, "src");

export default function(eleventyConfig) {
    // Passthrough copy — статические файлы
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.addPassthroughCopy("favicon.ico");

    // Контент всех страниц — эталонный HTML (препроцессинг из прежнего конструктора).
    // markdown-it разрывал большие HTML-блоки на пустых строках: наружу вставлялись <p>
    // и терялись отступы внутри <pre><code> с примерами кода (codewrap).
    // Поэтому md-движок — сквозной: содержимое страницы после front matter
    // попадает в вывод как есть, без markdown-обработки.
    eleventyConfig.setLibrary("md", {
        render: (str) => str
    });

    // Filters
    eleventyConfig.addFilter("relUrl", function(path) {
        const outputPath = this?.page?.outputPath || '';
        const normalized = outputPath.replace(/\\/g, '/');
        const match = normalized.match(/_site\/(.*)/);
        if (!match) return path;
        const relativePath = match[1];
        const depth = (relativePath.match(/\//g) || []).length;
        const prefix = depth > 0 ? '../'.repeat(depth) : './';
        return prefix + path.replace(/^\//, '');
    });

    eleventyConfig.addFilter("pad2", function(n) {
        return String(n).padStart(2, '0');
    });

    eleventyConfig.addFilter("json", function(obj) {
        return JSON.stringify(obj);
    });

    // Collections
    eleventyConfig.addCollection("pages", function(collectionApi) {
        return collectionApi.getFilteredByGlob("src/*.md").sort((a, b) => {
            return a.data.pageNumber - b.data.pageNumber;
        });
    });

    // Sections collection for index page (grouped pages)
    eleventyConfig.addCollection("sections", function(collectionApi) {
        const pages = collectionApi.getFilteredByGlob("src/*.md").sort((a, b) => {
            return a.data.pageNumber - b.data.pageNumber;
        });
        const docsJson = JSON.parse(
            fs.readFileSync(path.join(PROJECT, "lessons.json"), "utf8")
        );
        return docsJson.sections.map((section) => ({
            id: section.id,
            title: section.title,
            icon: section.icon,
            description: section.description,
            lessons: docsJson.lessons
                .filter((l) => l.section === section.id)
                .sort((a, b) => a.number - b.number)
                .map((l) => {
                    const found = pages.find((item) => item.data.pageNumber === l.number);
                    return {
                        num: l.number,
                        title: l.title,
                        desc: l.description,
                        url: found ? found.url : "/" + l.slug + "/",
                        duration: l.duration,
                        complexity: l.complexity,
                    };
                }),
        }));
    });

    // Shortcodes
    eleventyConfig.addShortcode("year", function() {
        return new Date().getFullYear();
    });

    // Data
    eleventyConfig.addGlobalData("layout", "layout.njk");
    eleventyConfig.addGlobalData("currentYear", new Date().getFullYear());

    // Dev/serve: пересборка JS/CSS при изменении исходников
    eleventyConfig.addWatchTarget("src/js");
    eleventyConfig.addWatchTarget("src/css");
    eleventyConfig.addWatchTarget("src/_includes");

    eleventyConfig.on('eleventy.after', () => {
        try {
            execSync('node build-css.mjs && node build-js.mjs', {
                stdio: 'inherit',
                shell: true,
            });
        } catch (_e) {
            console.error('⚠ Не удалось пересобрать JS/CSS в режиме watch');
        }
    });

    return {
        dir: {
            input: "src",
            output: "_site",
            includes: "_includes",
            data: "_data",
            plugins: "_plugins"
        },
        templateFormats: ["md", "njk", "html"],
        htmlTemplateEngine: "njk",
        markdownTemplateEngine: "njk",
        dataTemplateEngine: "njk",
        passthroughFileCopy: true
    };
};
