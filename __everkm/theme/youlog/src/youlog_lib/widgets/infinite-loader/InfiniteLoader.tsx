import { createEffect, createSignal, onCleanup, Switch, Match } from "solid-js";
import {
  StateChanger,
  TLoaderFn,
  createStateChanger,
  LoaderEvents,
} from "./InfiniteLoaderTypes";
import t from "./i18n";
import { observeVisibility } from "../../directives";
import { Emitter } from "mitt";
import { debounce } from "throttle-debounce";

true && observeVisibility;

export interface InfiniteLoaderProps {
  loader: TLoaderFn;
  offScreenLoad?: boolean;
  active?: boolean;
  emitter?: Emitter<LoaderEvents>;
}

function useLoader(stateChanger: StateChanger, loader: TLoaderFn) {
  const [loadingState, setLoadingState] = createSignal<"loading" | "error">(
    "loading"
  );
  const doLoad = async () => {
    try {
      setLoadingState("loading");
      await loader(stateChanger);
    } catch (error) {
      console.error("Loading error:", error);
      setLoadingState("error");
    }
  };
  return { loadingState, doLoad };
}

function LoadingState(props: {
  hasMore: boolean;
  loadingState: () => "loading" | "error";
  onRetry: () => void;
}) {
  return (
    <div>
      <Switch
        fallback={
          <div class="py-2 text-center text-gray-500">{t("loading")}</div>
        }
      >
        <Match when={!props.hasMore}>
          <div class="py-2 text-center text-text-tertiary">{t("no_more")}</div>
        </Match>
        <Match when={props.loadingState() === "error"}>
          <div class="py-2 text-center text-error">
            {t("loading_error")}
            <button
              class="ml-2 text-link underline hover:text-link-hover"
              onClick={props.onRetry}
            >
              {t("retry")}
            </button>
          </div>
        </Match>
      </Switch>
    </div>
  );
}

export default function InfiniteLoader(props: InfiniteLoaderProps) {
  const [stateChanger, changedId] = createStateChanger();
  const [inView, setInView] = createSignal(false);
  const { loadingState, doLoad } = useLoader(stateChanger, props.loader);
  const [active, setActive] = createSignal(props?.active ?? true);

  if (props.emitter) {
    const handler = (active?: boolean) => setActive(active ?? true);
    props.emitter.on("active", handler);
    onCleanup(() => props.emitter?.off("active", handler));
  }

  const debouncedLoad = debounce(500, () => {
    if (stateChanger.hasMore()) doLoad();
  });
  onCleanup(() => {
    // @ts-ignore
    debouncedLoad.cancel && debouncedLoad.cancel();
  });

  createEffect(() => {
    if (!active()) return;
    changedId();
    if (!inView()) return;
    debouncedLoad();
  });

  return (
    <div use:observeVisibility={(isVisible) => setInView(isVisible)}>
      <LoadingState
        hasMore={stateChanger.hasMore()}
        loadingState={loadingState}
        onRetry={doLoad}
      />
    </div>
  );
}
