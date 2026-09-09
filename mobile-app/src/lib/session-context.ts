/**
 * Session Context Holder
 *
 * Decouples backend API request header generation from Zustand store definitions
 * to eliminate circular module dependencies (`auth.store` <-> `backend.ts` <-> `workspace.store`).
 */

type StringGetter = () => string | null | undefined;

let getSessionTokenFn: StringGetter = () => null;
let getActiveWorkspaceIdFn: StringGetter = () => null;

export const sessionContext = {
  setTokenGetter: (fn: StringGetter) => {
    getSessionTokenFn = fn;
  },
  setWorkspaceGetter: (fn: StringGetter) => {
    getActiveWorkspaceIdFn = fn;
  },
  getToken: (): string | null => {
    try {
      return getSessionTokenFn() ?? null;
    } catch {
      return null;
    }
  },
  getWorkspaceId: (): string | null => {
    try {
      return getActiveWorkspaceIdFn() ?? null;
    } catch {
      return null;
    }
  },
};
