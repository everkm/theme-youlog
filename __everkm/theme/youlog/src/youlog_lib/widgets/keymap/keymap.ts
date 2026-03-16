import { base, keyName } from "w3c-keyname";

export type EventHandler = (e: KeyboardEvent) => boolean;
export type EventBindings = Record<string, EventHandler>;

const isMacPlatform =
  typeof navigator !== "undefined" &&
  navigator.platform?.toLowerCase().includes("mac");

export function normalizeKeyName(name: string): string {
  const parts = name.split(/-(?!$)/);
  let result = parts[parts.length - 1];
  if (result === "Space") result = " ";
  let alt = false;
  let ctrl = false;
  let shift = false;
  let meta = false;
  for (let i = 0; i < parts.length - 1; i++) {
    const mod = parts[i];
    if (/^(cmd|meta|m)$/i.test(mod)) meta = true;
    else if (/^a(lt)?$/i.test(mod)) alt = true;
    else if (/^(c|ctrl|control)$/i.test(mod)) ctrl = true;
    else if (/^s(hift)?$/i.test(mod)) shift = true;
    else if (/^mod$/i.test(mod)) {
      if (isMacPlatform) meta = true;
      else ctrl = true;
    } else throw new Error("Unrecognized modifier name: " + mod);
  }
  if (alt) result = "Alt-" + result;
  if (ctrl) result = "Ctrl-" + result;
  if (meta) result = "Meta-" + result;
  if (shift) result = "Shift-" + result;
  return result;
}

export function normalizeEventBindings(bindings: EventBindings): EventBindings {
  const result: EventBindings = {};
  for (const key in bindings) {
    result[normalizeKeyName(key)] = bindings[key];
  }
  return result;
}

export function modifiers(
  name: string,
  event: KeyboardEvent,
  shift: boolean
): string {
  if (event.altKey) name = "Alt-" + name;
  if (event.ctrlKey) name = "Ctrl-" + name;
  if (event.metaKey) name = "Meta-" + name;
  if (shift !== false && event.shiftKey) name = "Shift-" + name;
  return name;
}

export function keydownHandler(bindings: EventBindings): EventHandler {
  const map = normalizeEventBindings(bindings);
  return function (event) {
    if (!event) return false;
    const name = keyName(event);
    const isChar = name.length === 1 && name !== " ";
    let baseName: string;
    const keyInfo = modifiers(name, event, !isChar);
    const direct = map[keyInfo];
    if (direct && direct(event)) return true;
    if (
      isChar &&
      (event.shiftKey || event.altKey || event.metaKey) &&
      (baseName = base[event.keyCode]) &&
      baseName !== name
    ) {
      const fromCode = map[modifiers(baseName, event, true)];
      if (fromCode && fromCode(event)) return true;
    }
    return false;
  };
}
