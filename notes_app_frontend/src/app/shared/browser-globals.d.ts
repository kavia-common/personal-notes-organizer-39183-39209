/**
 * Minimal ambient declarations to keep lint happy in non-browser contexts.
 * Types are intentionally broad (any).
 */
declare const window: any;
declare const localStorage: any;
declare function prompt(message?: string, _default?: string): string | null;
declare function confirm(message?: string): boolean;
declare function setTimeout(handler: (...args: any[]) => void, timeout?: number, ...args: any[]): any;
declare function clearTimeout(handle?: any): void;
