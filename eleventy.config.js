import { HtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.addPairedShortcode("callout", function (content, label) {
    return `<aside class="callout"><p class="callout-label">${label}</p>\n\n${content}\n</aside>`;
  });

  eleventyConfig.addShortcode("video", function (src, caption) {
    const cap = caption ? `<figcaption>${caption}</figcaption>` : "";
    return `<figure class="video"><video controls muted loop playsinline preload="metadata" src="/assets/video/${src}"></video>${cap}</figure>`;
  });

  eleventyConfig.addCollection("notes", (api) =>
    api.getFilteredByGlob("src/notes/*.md").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("pages", (api) =>
    api
      .getFilteredByGlob("src/*.md")
      .filter((p) => p.data.order !== undefined)
      .sort((a, b) => a.data.order - b.data.order)
  );

  return {
    dir: { input: "src", includes: "_includes", layouts: "_layouts", output: "_site" },
    pathPrefix: "/phd/",
    markdownTemplateEngine: "njk",
  };
}
