"use strict";
var _Sources = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/@paperback/types/lib/index.js
  var require_lib = __commonJS({
    "node_modules/@paperback/types/lib/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ContentRating = exports.SourceIntents = exports.HomeSectionType = void 0;
      var SourceIntents2;
      (function(SourceIntents3) {
        SourceIntents3[SourceIntents3["MANGA_CHAPTERS"] = 1] = "MANGA_CHAPTERS";
        SourceIntents3[SourceIntents3["MANGA_TRACKING"] = 2] = "MANGA_TRACKING";
        SourceIntents3[SourceIntents3["HOMEPAGE_SECTIONS"] = 4] = "HOMEPAGE_SECTIONS";
        SourceIntents3[SourceIntents3["COLLECTION_MANAGEMENT"] = 8] = "COLLECTION_MANAGEMENT";
        SourceIntents3[SourceIntents3["CLOUDFLARE_BYPASS_REQUIRED"] = 16] = "CLOUDFLARE_BYPASS_REQUIRED";
        SourceIntents3[SourceIntents3["SETTINGS_UI"] = 32] = "SETTINGS_UI";
      })(SourceIntents2 = exports.SourceIntents || (exports.SourceIntents = {}));
      var ContentRating2;
      (function(ContentRating3) {
        ContentRating3["EVERYONE"] = "EVERYONE";
        ContentRating3["MATURE"] = "MATURE";
        ContentRating3["ADULT"] = "ADULT";
      })(ContentRating2 = exports.ContentRating || (exports.ContentRating = {}));
      var HomeSectionType2;
      (function(HomeSectionType3) {
        HomeSectionType3["singleRowNormal"] = "singleRowNormal";
        HomeSectionType3["singleRowLarge"] = "singleRowLarge";
        HomeSectionType3["doubleRow"] = "doubleRow";
        HomeSectionType3["featured"] = "featured";
      })(HomeSectionType2 = exports.HomeSectionType || (exports.HomeSectionType = {}));
    }
  });

  // src/MangaBuddy/MangaBuddy.ts
  var MangaBuddy_exports = {};
  __export(MangaBuddy_exports, {
    MangaBuddy: () => MangaBuddy,
    MangaBuddyInfo: () => MangaBuddyInfo
  });
  var import_types = __toESM(require_lib());
  var DOMAIN = "https://mangabuddy1.co.uk";
  var MangaBuddyInfo = {
    version: "3.1.0",
    name: "MangaBuddy",
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: "Netsky",
    authorWebsite: "http://github.com/TheNetsky",
    icon: "icon.png",
    contentRating: import_types.ContentRating.MATURE,
    websiteBaseURL: DOMAIN,
    sourceTags: [],
    intents: import_types.SourceIntents.MANGA_CHAPTERS | import_types.SourceIntents.HOMEPAGE_SECTIONS | import_types.SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
  };
  var MangaBuddy = class {
    constructor(cheerio) {
      this.cheerio = cheerio;
      this.baseUrl = DOMAIN;
      this.requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15e3,
        interceptor: {
          interceptRequest: async (request) => {
            request.headers = {
              ...request.headers ?? {},
              "user-agent": await this.requestManager.getDefaultUserAgent(),
              "referer": `${this.baseUrl}/`
            };
            return request;
          },
          interceptResponse: async (response) => {
            return response;
          }
        }
      });
    }
    getMangaShareUrl(mangaId) {
      return `${this.baseUrl}/series/${mangaId}`;
    }
    CloudFlareError(status) {
      if (status == 503 || status == 403) {
        throw new Error(`CLOUDFLARE BYPASS ERROR:
Please go to the source settings and run Cloudflare Bypass, or open ${this.baseUrl} in the in-app browser.`);
      }
    }
    async getCloudflareBypassRequestAsync() {
      return App.createRequest({
        url: this.baseUrl,
        method: "GET",
        headers: {
          "referer": `${this.baseUrl}/`,
          "user-agent": await this.requestManager.getDefaultUserAgent()
        }
      });
    }
    decode(str) {
      return (str ?? "").trim().replace(/&#x([0-9a-fA-F]+);/g, (_m, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(parseInt(d, 10))).replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
    }
    getImageSrc($img) {
      let image = ($img?.attr("data-src") || $img?.attr("src") || $img?.attr("data-lazy-src") || "").trim();
      if (image.startsWith("//")) image = `https:${image}`;
      return image;
    }
    parseDate(dateStr) {
      const date = (dateStr || "").trim().toUpperCase();
      const now = Date.now();
      if (!date || date.includes("NEW") || date.includes("JUST") || date.includes("NOW")) {
        return new Date(now);
      }
      const numMatch = date.match(/\d+/);
      const n = numMatch ? Number(numMatch[0]) : 1;
      if (date.includes("SECOND")) return new Date(now - n * 1e3);
      if (date.includes("MINUTE")) return new Date(now - n * 6e4);
      if (date.includes("HOUR")) return new Date(now - n * 36e5);
      if (date.includes("WEEK")) return new Date(now - n * 6048e5);
      if (date.includes("MONTH")) return new Date(now - n * 2592e6);
      if (date.includes("YEAR")) return new Date(now - n * 31556952e3);
      if (date.includes("DAY")) return new Date(now - n * 864e5);
      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) ? new Date(now) : parsed;
    }
    async getMangaDetails(mangaId) {
      const request = App.createRequest({ url: `${this.baseUrl}/series/${mangaId}`, method: "GET" });
      const response = await this.requestManager.schedule(request, 1);
      this.CloudFlareError(response.status);
      const $ = this.cheerio.load(response.data);
      let title = this.decode($('h1[itemprop="name"]').first().text() || $("h1").first().text() || $('meta[property="og:title"]').attr("content") || "");
      title = title.replace(/\s*[-|]\s*MangaBuddy.*$/i, "").trim();
      if (!title) title = mangaId.split(".")[0].replace(/-/g, " ");
      let image = this.getImageSrc($('img[alt^="Cover of"]').first());
      if (!image) image = ($('meta[property="og:image"]').attr("content") || "").trim();
      const description = this.decode($('meta[property="og:description"]').attr("content") || "");
      const tags = [];
      for (const a of $('a[href*="/genres/"], a[href*="/genre/"]').toArray()) {
        const label = $(a).text().trim();
        const id = ($(a).attr("href") || "").split("/").filter((x) => x).pop() || label;
        if (label) tags.push(App.createTag({ id, label }));
      }
      const tagSections = tags.length ? [App.createTagSection({ id: "0", label: "genres", tags })] : [];
      const bodyText = $("body").text();
      const status = /completed/i.test(bodyText) && !/ongoing/i.test(bodyText) ? "Completed" : "Ongoing";
      return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
          titles: [title],
          image: image || "",
          status,
          author: "Unknown",
          artist: "Unknown",
          desc: description,
          tags: tagSections
        })
      });
    }
    async getChapters(mangaId) {
      const request = App.createRequest({ url: `${this.baseUrl}/series/${mangaId}`, method: "GET" });
      const response = await this.requestManager.schedule(request, 1);
      this.CloudFlareError(response.status);
      const $ = this.cheerio.load(response.data);
      const collected = [];
      const seen = /* @__PURE__ */ new Set();
      for (const a of $('a[href*="/chapter-"]').toArray()) {
        const rawHref = $(a).attr("href") || "";
        if (!rawHref.includes("/series/")) continue;
        const clean = rawHref.split("#")[0].split("?")[0].replace(/\/$/, "");
        const chapterId = clean.split("/").pop() || "";
        if (!chapterId.toLowerCase().startsWith("chapter") || seen.has(chapterId)) continue;
        const titleText = ($("span.font-medium", a).first().text() || $(a).text() || "").trim();
        const numMatch = titleText.match(/(\d+(?:\.\d+)?)/) || clean.match(/chapter-(\d+(?:[-.]\d+)?)/);
        let chapNum = numMatch ? Number(String(numMatch[1]).replace("-", ".")) : 0;
        if (isNaN(chapNum)) chapNum = 0;
        const dateText = $("time", a).first().text().trim();
        seen.add(chapterId);
        collected.push({ id: chapterId, name: titleText || `Chapter ${chapNum}`, chapNum, time: this.parseDate(dateText) });
      }
      if (collected.length == 0) {
        throw new Error(`Couldn't find any chapters for ${mangaId}. The site layout may have changed.`);
      }
      collected.sort((a, b) => a.chapNum - b.chapNum);
      return collected.map((c, i) => App.createChapter({
        id: c.id,
        name: c.name,
        chapNum: c.chapNum,
        time: c.time,
        volume: 0,
        sortingIndex: i,
        langCode: "\u{1F1EC}\u{1F1E7}",
        group: ""
      }));
    }
    async getChapterDetails(mangaId, chapterId) {
      const request = App.createRequest({ url: `${this.baseUrl}/series/${mangaId}/${chapterId}`, method: "GET" });
      const response = await this.requestManager.schedule(request, 1);
      this.CloudFlareError(response.status);
      const $ = this.cheerio.load(response.data);
      const pages = [];
      let nodes = $("img[data-number]").toArray();
      if (nodes.length == 0) nodes = $("img.fit-w").toArray();
      for (const img of nodes) {
        const url = this.getImageSrc($(img));
        if (!url.startsWith("http")) continue;
        const n = Number($(img).attr("data-number"));
        pages.push({ n: isNaN(n) ? pages.length : n, url });
      }
      pages.sort((a, b) => a.n - b.n);
      if (pages.length == 0) {
        throw new Error(`Couldn't find any pages for ${mangaId}/${chapterId}.`);
      }
      return App.createChapterDetails({
        id: chapterId,
        mangaId,
        pages: pages.map((p) => p.url)
      });
    }
    parseSeriesCards($) {
      const results = [];
      const seen = /* @__PURE__ */ new Set();
      for (const a of $('a[href*="/series/"]').toArray()) {
        const href = $(a).attr("href") || "";
        if (href.includes("/chapter-")) continue;
        const m = href.match(/\/series\/([^/?#]+)/);
        if (!m) continue;
        const mangaId = m[1];
        if (!mangaId.includes(".") || seen.has(mangaId)) continue;
        const $img = $("img", a).first();
        const image = this.getImageSrc($img);
        let title = ($img.attr("alt") || $(a).attr("title") || $("span", a).first().text() || "").trim();
        title = title.replace(/\s*[-|]\s*MangaBuddy.*$/i, "").trim();
        if (!title) title = mangaId.split(".")[0].replace(/-/g, " ");
        seen.add(mangaId);
        results.push(App.createPartialSourceManga({
          mangaId,
          image: image || "",
          title: this.decode(title)
        }));
      }
      return results;
    }
    async getSearchResults(query, metadata) {
      const page = metadata?.page ?? 1;
      const search = encodeURIComponent((query.title ?? "").trim());
      const request = App.createRequest({ url: `${this.baseUrl}/series?searchTerm=${search}&page=${page}`, method: "GET" });
      const response = await this.requestManager.schedule(request, 1);
      this.CloudFlareError(response.status);
      const $ = this.cheerio.load(response.data);
      const results = this.parseSeriesCards($);
      return App.createPagedResults({
        results,
        metadata: results.length > 0 ? { page: page + 1 } : void 0
      });
    }
    async getHomePageSections(sectionCallback) {
      const section = App.createHomeSection({ id: "latest_updates", title: "Latest Updates", type: import_types.HomeSectionType.singleRowNormal, containsMoreItems: true });
      try {
        const request = App.createRequest({ url: `${this.baseUrl}/latest-updates`, method: "GET" });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        section.items = this.parseSeriesCards($);
      } catch (e) {
        section.items = [];
      }
      sectionCallback(section);
    }
    async getViewMoreItems(homepageSectionId, metadata) {
      const page = metadata?.page ?? 1;
      const request = App.createRequest({ url: `${this.baseUrl}/latest-updates?page=${page}`, method: "GET" });
      const response = await this.requestManager.schedule(request, 1);
      const $ = this.cheerio.load(response.data);
      const results = this.parseSeriesCards($);
      return App.createPagedResults({
        results,
        metadata: results.length > 0 ? { page: page + 1 } : void 0
      });
    }
  };
  return __toCommonJS(MangaBuddy_exports);
})();
this.Sources = _Sources; if (typeof exports === 'object' && typeof module !== 'undefined') {module.exports.Sources = this.Sources;}
