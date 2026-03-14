/**
 * Centralized app config. Used for auto-populating version in issue form and elsewhere.
 * Only the year part (vYYYY) is auto-filled; user enters MM.DD for YANC Bug Tracker.
 */
export const PRODUCT_VERSION_YEAR = `v${new Date().getFullYear()}`;
