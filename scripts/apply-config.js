/**
 * ══════════════════════════════════════════════════════════════════════════════
 * apply-config.js — Static Site Configuration Applier Script
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Responsibilities:
 *   1. Reads root `configuration.ts`
 *   2. Evaluates `siteConfig` static data
 *   3. Directly injects/replaces static text into source files:
 *      - src/components/Navbar.tsx
 *      - src/app/(public)/layout.tsx
 *      - src/app/(public)/page.tsx
 *      - src/app/admin/layout.tsx
 *      - src/components/admin/Sidebar.tsx
 *      - src/app/admin/login/page.tsx
 *   4. Zero runtime overhead — components remain 100% pure static code!
 * ══════════════════════════════════════════════════════════════════════════════
 */

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const configPath = path.join(rootDir, "configuration.ts");

function loadSiteConfig() {
  if (!fs.existsSync(configPath)) {
    console.error(`❌ Error: ${configPath} does not exist!`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(configPath, "utf-8");

  // Strip TS types/interfaces & module exports to evaluate plain JS object
  const cleanedContent = rawContent
    .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "") // remove comments
    .replace(/export\s+interface\s+[\s\S]*?(?=export\s+const|\$)/g, "")
    .replace(
      /export\s+const\s+siteConfig\s*:\s*SiteConfig\s*=\s*/,
      "const siteConfig = ",
    )
    .replace(/export\s+default\s+siteConfig;?/, "");

  try {
    const fn = new Function(`${cleanedContent}; return siteConfig;`);
    return fn();
  } catch (err) {
    console.error("❌ Failed to parse configuration.ts:", err.message);
    process.exit(1);
  }
}

function updateJsxMarker(content, markerName, newValue) {
  // Matches {/* CONFIG:MARKER_NAME */}...{/* /CONFIG:MARKER_NAME */}
  const pattern = new RegExp(
    `(\\{\\/\\*\\s*CONFIG:${markerName}\\s*\\*\\/})[\\s\\S]*?(\\{\\/\\*\\s*\\/CONFIG:${markerName}\\s*\\*\\/})`,
    "g",
  );
  return content.replace(pattern, `$1${newValue}$2`);
}

function updateJsStringMarker(content, markerName, newValue) {
  // Matches /* CONFIG:MARKER_NAME */ "..." /* /CONFIG:MARKER_NAME */
  const pattern = new RegExp(
    `(/\\*\\s*CONFIG:${markerName}\\s*\\*\\/\\s*)"[\\s\\S]*?"(\\s*/\\*\\s*/CONFIG:${markerName}\\s*\\*\\/)`,
    "g",
  );
  const formattedString = JSON.stringify(newValue);
  return content.replace(pattern, `$1${formattedString}$2`);
}

function applyConfig() {
  console.log(
    "⚙️  Applying static site configuration directly into source code...",
  );

  const config = loadSiteConfig();

  let totalReplacements = 0;

  function processFile(filePath, updater) {
    const fullPath = path.join(rootDir, filePath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ Warning: Target file ${filePath} not found.`);
      return;
    }
    let fileContent = fs.readFileSync(fullPath, "utf-8");
    const updatedContent = updater(fileContent, config);
    if (fileContent !== updatedContent) {
      fs.writeFileSync(fullPath, updatedContent, "utf-8");
      totalReplacements++;
      console.log(`  ✓ Updated ${filePath}`);
    } else {
      console.log(`  - Up to date: ${filePath}`);
    }
  }

  // 1. Update src/components/Navbar.tsx
  processFile("src/components/Navbar.tsx", (content, cfg) => {
    let result = updateJsxMarker(
      content,
      "NAVBAR_BRAND_PREFIX",
      cfg.navbar.brandPrefix || "",
    );
    result = updateJsxMarker(
      result,
      "NAVBAR_BRAND_NAME",
      cfg.navbar.brandName || "Editorial Studio",
    );

    // Replace links array block if needed
    if (cfg.navbar.links && Array.isArray(cfg.navbar.links)) {
      const linksCode = cfg.navbar.links
        .map((l) => {
          const iconVal = l.icon === "Search" ? "Search" : "null";
          return `  { name: ${JSON.stringify(l.name)}, href: ${JSON.stringify(l.href)}${l.icon ? `, icon: ${iconVal}` : ""} }`;
        })
        .join(",\n");

      const navBlock = `// CONFIG:NAVBAR_LINKS_START\nconst links = [\n${linksCode}\n];\n// CONFIG:NAVBAR_LINKS_END`;
      result = result.replace(
        /\/\/ CONFIG:NAVBAR_LINKS_START[\s\S]*?\/\/ CONFIG:NAVBAR_LINKS_END/g,
        navBlock,
      );
    }
    return result;
  });

  // 2. Update src/app/(public)/layout.tsx
  processFile("src/app/(public)/layout.tsx", (content, cfg) => {
    let result = updateJsStringMarker(
      content,
      "SITE_TITLE_DEFAULT",
      cfg.site.metaTitleDefault || "Blog",
    );
    result = updateJsStringMarker(
      result,
      "SITE_TITLE_TEMPLATE",
      cfg.site.metaTitleTemplate || "%s | Blog",
    );
    result = updateJsStringMarker(
      result,
      "SITE_META_DESC",
      cfg.site.metaDescription || "",
    );
    result = updateJsxMarker(
      result,
      "FOOTER_TEXT",
      cfg.site.footerText || "Blog. All rights reserved.",
    );
    return result;
  });

  // 3. Update src/app/(public)/page.tsx
  processFile("src/app/(public)/page.tsx", (content, cfg) => {
    let result = updateJsStringMarker(
      content,
      "HOMEPAGE_META_TITLE",
      cfg.homepage.metaTitle || "",
    );
    result = updateJsStringMarker(
      result,
      "HOMEPAGE_META_DESC",
      cfg.homepage.metaDescription || "",
    );
    result = updateJsxMarker(
      result,
      "HOMEPAGE_HERO_TITLE",
      cfg.homepage.heroTitle || "",
    );
    result = updateJsxMarker(
      result,
      "HOMEPAGE_HERO_DESC",
      cfg.homepage.heroDescription || "",
    );
    result = updateJsxMarker(
      result,
      "HOMEPAGE_BADGE",
      cfg.homepage.badgeText || "",
    );
    result = updateJsxMarker(
      result,
      "HOMEPAGE_EMPTY_TITLE",
      cfg.homepage.emptyStateTitle || "",
    );
    result = updateJsxMarker(
      result,
      "HOMEPAGE_EMPTY_DESC",
      cfg.homepage.emptyStateDescription || "",
    );
    result = updateJsxMarker(
      result,
      "HOMEPAGE_LATEST_STORIES",
      cfg.homepage.latestStoriesTitle || "Latest Stories",
    );
    return result;
  });

  // 4. Update src/app/admin/layout.tsx
  processFile("src/app/admin/layout.tsx", (content, cfg) => {
    let result = updateJsStringMarker(
      content,
      "ADMIN_TITLE",
      cfg.admin.title || "Admin",
    );
    result = updateJsStringMarker(
      result,
      "ADMIN_TITLE_TEMPLATE",
      `%s | ${cfg.admin.title || "Admin"}`,
    );
    result = updateJsStringMarker(
      result,
      "ADMIN_META_DESC",
      cfg.admin.metaDescription || "",
    );
    return result;
  });

  // 5. Update src/components/admin/Sidebar.tsx
  processFile("src/components/admin/Sidebar.tsx", (content, cfg) => {
    const brandName = cfg.admin.brandName || "Studio";
    const initial = brandName.charAt(0).toUpperCase();
    let result = updateJsxMarker(content, "ADMIN_BRAND_INITIAL", initial);
    result = updateJsStringMarker(result, "ADMIN_BRAND_INITIAL", initial);
    result = updateJsxMarker(result, "ADMIN_BRAND_NAME", brandName);
    return result;
  });

  // 6. Update src/app/admin/login/page.tsx
  processFile("src/app/admin/login/page.tsx", (content, cfg) => {
    let result = updateJsStringMarker(
      content,
      "ADMIN_LOGIN_META_DESC",
      cfg.admin.metaDescription || "",
    );
    result = updateJsxMarker(
      result,
      "ADMIN_LOGIN_TITLE",
      cfg.admin.loginTitle || "Welcome back",
    );
    result = updateJsxMarker(
      result,
      "ADMIN_LOGIN_DESC",
      cfg.admin.loginDescription || "",
    );
    return result;
  });

  // Sync src/configuration.ts as reference
  const targetConfigPath = path.join(rootDir, "src", "configuration.ts");
  fs.writeFileSync(
    targetConfigPath,
    fs.readFileSync(configPath, "utf-8"),
    "utf-8",
  );

  console.log(
    `✅ Static content successfully written into source files (${totalReplacements} files updated).`,
  );
}

applyConfig();
