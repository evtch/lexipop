/**
 * VERSION UTILITIES
 *
 * Generates version strings for display in the app
 */

/**
 * Generate version string in format: DDMMYYYY-githash
 * Example: 14102025-27d5861
 */
export function getVersionString(): string {
  const now = new Date();

  // Format date as DDMMYYYY
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString();
  const dateStr = `${day}${month}${year}`;

  // Use environment variable for git hash (set during build)
  const gitHash = process.env.NEXT_PUBLIC_GIT_HASH || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev';

  return `${dateStr}-${gitHash}`;
}

/**
 * Get package version from package.json
 */
export function getPackageVersion(): string {
  return process.env.npm_package_version || '0.1.0';
}

/**
 * Get combined version display
 */
export function getDisplayVersion(): string {
  const versionStr = getVersionString();
  const packageVer = getPackageVersion();
  return `v${packageVer} (${versionStr})`;
}