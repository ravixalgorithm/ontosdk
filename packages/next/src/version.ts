/**
 * Single source of truth for the SDK version sent to the Control Plane on
 * every telemetry POST + manifest sync. Bump this alongside package.json
 * when releasing.
 *
 * Why a hardcoded constant (vs reading package.json at runtime): the
 * middleware ships to the Edge runtime, which can't read JSON files from
 * disk. Bundling package.json works for CJS/ESM but is fragile in Edge.
 * A const is unambiguous and tsup inlines it cleanly.
 */
export const SDK_VERSION = '1.6.7';
