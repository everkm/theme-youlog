import mitt, { Emitter } from "mitt";
import { createSignal, Accessor } from "solid-js";

export enum LoadState {
  Init,
  Loaded,
  Completed,
  Error,
}

export interface StateChanger {
  hasMore: () => boolean;
  loaded: () => void;
  complete: () => void;
  reset: () => void;
  error: (message: string) => void;
}

export type TLoaderFn = (state: StateChanger) => Promise<void>;

export function createStateChanger(): [StateChanger, Accessor<number>] {
  const [error, setError] = createSignal<string | null>(null);
  const [state, setState] = createSignal<LoadState>(LoadState.Init);
  const [changedId, setChangedId] = createSignal<number>(0);

  const stateChanger: StateChanger = {
    hasMore: () => state() !== LoadState.Completed,
    loaded: () => {
      setState(LoadState.Loaded);
      requestAnimationFrame(() => {
        setTimeout(() => setChangedId((prev) => prev + 1), 300);
      });
    },
    complete: () => setState(LoadState.Completed),
    reset: () => {
      setState(LoadState.Init);
      setChangedId((prev) => prev + 1);
    },
    error: (message: string) => setError(message),
  };

  return [stateChanger, changedId];
}

export type LoaderEvents = { active?: boolean };

export function createLoaderEmitter(): Emitter<LoaderEvents> {
  return mitt<LoaderEvents>();
}
