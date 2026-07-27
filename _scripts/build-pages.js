const {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} = require("node:fs");
const { basename, dirname, extname, join, relative, resolve, sep } = require("node:path");

const ROOT = resolve(__dirname, "..");
const OUTPUT = resolve(ROOT, "dist");

const ROOT_FILES = [
  "_headers",
  "404.html",
  "aplikacje-webowe-wroclaw.html",
  "index.html",
  "index.md",
  "integracje-api-wroclaw.html",
  "landing-page-wroclaw.html",
  "llms.txt",
  "maintenance.html",
  "optymalizacja-i-ratunek-wroclaw.html",
  "robots.txt",
  "sitemap.xml",
  "sklepy-woocommerce-wroclaw.html",
  "strony-wordpress-wroclaw.html",
  "style-404.css",
  "style.min.css",
];

const CSS_FILES = [
  "css/brief.min.css",
  "css/critical.min.css",
  "css/landing-page.min.css",
  "css/maintenance.css",
];

const FONT_FILES = [
  "assets/fonts/fa-brands-400.woff2",
  "assets/fonts/fa-solid-900.woff2",
  "assets/fonts/fonts.css",
  "assets/fonts/outfit-400.woff2",
  "assets/fonts/outfit-latin-ext.woff2",
  "assets/fonts/space-grotesk.woff2",
  "assets/fonts/space-grotesk-latin-ext.woff2",
];

const IMAGE_FILES = [
  "assets/images/icons/apple-touch-icon.png",
  "assets/images/icons/favicon-16x16.png",
  "assets/images/icons/favicon-32x32.png",
  "assets/images/icons/favicon.ico",
  "assets/images/logos/logo-domindev-white-transparentbg-1916x1916.png",
  "assets/images/social/og-image-social.jpg",
  "assets/images/social/og-image-social.webp",
];

const OTHER_FILES = [
  "brief/index.html",
  "data/chatbot-db.json",
];

const IMAGE_EXTENSIONS = new Set([".avif", ".jpg", ".jpeg", ".png", ".webp"]);

function assertOutputIsSafe() {
  if (dirname(OUTPUT) !== ROOT || basename(OUTPUT) !== "dist") {
    throw new Error(`Refusing to clean unexpected output path: ${OUTPUT}`);
  }
}

function resolveInside(base, path) {
  const resolved = resolve(base, path);
  if (resolved !== base && !resolved.startsWith(`${base}${sep}`)) {
    throw new Error(`Path escapes ${base}: ${path}`);
  }
  return resolved;
}

function copyFile(relativePath) {
  const source = resolveInside(ROOT, relativePath);
  const destination = resolveInside(OUTPUT, relativePath);

  if (!existsSync(source) || !statSync(source).isFile()) {
    throw new Error(`Required public file is missing: ${relativePath}`);
  }

  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
}

function copyTree(relativeDirectory, shouldCopy) {
  const sourceRoot = resolveInside(ROOT, relativeDirectory);

  for (const entry of readdirSync(sourceRoot, { withFileTypes: true })) {
    const relativePath = join(relativeDirectory, entry.name);

    if (entry.isDirectory()) {
      copyTree(relativePath, shouldCopy);
    } else if (entry.isFile() && shouldCopy(relativePath)) {
      copyFile(relativePath);
    }
  }
}

function collectFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(absolutePath));
    if (entry.isFile()) files.push(absolutePath);
  }

  return files;
}

function assertArtifactBoundary() {
  const forbidden = [
    "AGENTS.md",
    "LICENSE",
    "README.md",
    "package-lock.json",
    "package.json",
    "wrangler.toml",
    "functions",
    "tests",
    "_scripts",
  ];

  for (const path of forbidden) {
    if (existsSync(resolveInside(OUTPUT, path))) {
      throw new Error(`Support path leaked into production artifact: ${path}`);
    }
  }
}

function main() {
  assertOutputIsSafe();
  rmSync(OUTPUT, { recursive: true, force: true });
  mkdirSync(OUTPUT, { recursive: true });

  for (const path of [...ROOT_FILES, ...CSS_FILES, ...FONT_FILES, ...IMAGE_FILES, ...OTHER_FILES]) {
    copyFile(path);
  }

  copyTree("assets/images/about", (path) => IMAGE_EXTENSIONS.has(extname(path).toLowerCase()));
  copyTree("assets/images/portfolio", (path) => IMAGE_EXTENSIONS.has(extname(path).toLowerCase()));
  copyTree("js", (path) => path.endsWith(".js") && !path.endsWith(".min.js"));

  assertArtifactBoundary();

  const files = collectFiles(OUTPUT);
  const totalBytes = files.reduce((sum, path) => sum + statSync(path).size, 0);
  console.log(
    `Pages artifact ready: ${files.length} files, ${(totalBytes / 1024 / 1024).toFixed(2)} MB (${relative(ROOT, OUTPUT)})`,
  );
}

main();
