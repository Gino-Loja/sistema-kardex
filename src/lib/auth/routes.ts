const PUBLIC_ROUTES = ["/login", "/reset-password", "/forbidden"];

const PUBLIC_PATH_PREFIXES = ["/api/auth", "/_next"];

const PUBLIC_FILES = [
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

const PUBLIC_FILE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".ico",
  ".css",
  ".js",
  ".map",
  ".txt",
];

export const isPublicRoute = (pathname: string): boolean =>
  PUBLIC_ROUTES.includes(pathname);

export const isPublicPathPrefix = (pathname: string): boolean =>
  PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export const isPublicAsset = (pathname: string): boolean => {
  if (PUBLIC_FILES.includes(pathname)) {
    return true;
  }

  return PUBLIC_FILE_EXTENSIONS.some((ext) => pathname.endsWith(ext));
};
