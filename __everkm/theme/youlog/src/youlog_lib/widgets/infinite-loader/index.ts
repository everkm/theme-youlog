import InfiniteLoader from "./InfiniteLoader";
import {
  createStateChanger,
  createLoaderEmitter,
  LoadState,
  type StateChanger,
  type TLoaderFn,
} from "./InfiniteLoaderTypes";

export { InfiniteLoader, createStateChanger, createLoaderEmitter, LoadState };
export type { StateChanger, TLoaderFn };
export default InfiniteLoader;
