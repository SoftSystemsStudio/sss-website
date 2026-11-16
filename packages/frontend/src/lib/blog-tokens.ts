import {
  ADD_ONS_FROM,
  BUILD_ADD_ONS,
  BUILD_FROM,
  BUILD_PACKAGES,
  HOME_BASE,
  RETAINER_MAX,
  RETAINER_MIN,
  RETAINER_RANGE,
  SECURE_CARE_PLAN_RANGE,
  SERVICE_AREA_LABEL,
  getPackage,
} from './business';

export class UnknownTokenError extends Error {
  constructor(token: string) {
    super(`Unknown blog token: {{${token}}}`);
    this.name = 'UnknownTokenError';
  }
}

const NAMED: Record<string, string> = {
  BUILD_FROM,
  ADD_ONS_FROM,
  RETAINER_MIN,
  RETAINER_MAX,
  RETAINER_RANGE,
  SERVICE_AREA_LABEL,
  HOME_BASE,
};

const TOKEN_RE = /\{\{\s*([^{}]*?)\s*\}\}/g;

function resolveOne(token: string): string {
  if (Object.prototype.hasOwnProperty.call(NAMED, token)) {
    // eslint-disable-next-line security/detect-object-injection -- own-property check above
    return NAMED[token];
  }
  const m = /^(price|name):(.+)$/.exec(token);
  if (m) {
    const pkg = BUILD_PACKAGES.find((p) => p.id === m[2]);
    if (pkg) return m[1] === 'price' ? getPackage(pkg.id).price : pkg.name;
  }
  throw new UnknownTokenError(token);
}

export function resolveTokens(markdown: string): string {
  return markdown.replace(TOKEN_RE, (_all, token: string) => resolveOne(token));
}

export function listTokens(markdown: string): string[] {
  return Array.from(markdown.matchAll(TOKEN_RE), (m) => m[1]);
}

/** Every studio price/range string, derived from business.ts so it can't drift. */
export const STUDIO_LITERALS: string[] = Array.from(
  new Set([
    ...BUILD_PACKAGES.map((p) => p.price),
    ...BUILD_ADD_ONS.map((a) => a.price),
    ADD_ONS_FROM,
    RETAINER_MIN,
    RETAINER_MAX,
    RETAINER_RANGE,
    SECURE_CARE_PLAN_RANGE,
  ]),
);
