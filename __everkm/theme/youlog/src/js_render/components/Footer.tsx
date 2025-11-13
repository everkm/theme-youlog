import { Component, For, Show } from "solid-js";
import { LightningIcon } from "../icons";

interface NavItem {
  title: string;
  url?: string;
  new_window?: boolean;
}

interface FooterProps {
  requestId: string;
  pageContext: PageContext;
  configValue: (path: string, defaultValue?: any) => any;
  youlogPlatform?: string;
  youlogVersion?: string;
  versionsUrl?: string;
}

interface BottomNavProps {
  configValue: (path: string, defaultValue?: any) => any;
}

const BottomNav: Component<BottomNavProps> = (props) => {
  return (
    <div class="flex items-center flex-wrap justify-center gap-2 text-sm text-text-secondary dark:text-text-secondary">
      <For each={props.configValue("bottom_nav", []) as NavItem[]}>
        {(item, index) => (
          <>
            <a
              href={item.url}
              target={item.new_window !== false ? "_blank" : undefined}
              class="hover:text-text-secondary hover:underline dark:hover:text-text-secondary transition-colors"
            >
              {item.title}
            </a>
            {index() < props.configValue("bottom_nav", []).length - 1 && (
              <span class="text-text-quaternary dark:text-text-quaternary">
                |
              </span>
            )}
          </>
        )}
      </For>
    </div>
  );
};

interface YoulogPlatformProps {
  youlogPlatform?: string;
  youlogVersion?: string;
  versionsUrl?: string;
}

const YoulogPlatform: Component<YoulogPlatformProps> = (props) => {
  return (
    <div class="text-text-tertiary dark:text-text-tertiary text-sm text-center flex flex-wrap justify-center items-center">
      <Show when={props.youlogPlatform}>
        <span>
          <a
            href={props.youlogPlatform}
            target="_blank"
            class="hover:text-text-secondary dark:hover:text-text-secondary transition-colors"
          >
            Youlog
          </a>
          <span class="mx-2 text-text-quaternary dark:text-text-quaternary">
            |
          </span>
        </span>
      </Show>

      <Show when={props.youlogVersion}>
        <span>
          <youlog-version
            class="hover:text-text-secondary dark:hover:text-text-secondary transition-colors cursor-pointer"
            version-list-url={props.versionsUrl || ""}
            version={props.youlogVersion || ""}
          ></youlog-version>
        </span>
      </Show>
    </div>
  );
};

interface CopyrightAndBeianProps {
  pageContext: PageContext;
  configValue: (path: string, defaultValue?: any) => any;
}

const CopyrightAndBeian: Component<CopyrightAndBeianProps> = (props) => {
  return (
    <div class="text-text-tertiary dark:text-text-tertiary text-sm text-center flex flex-wrap justify-center items-center gap-4">
      <Show when={props.configValue("copyright")}>
        <span>
          {props.configValue("copyright.from_year")
            ? `©${props.configValue("copyright.from_year")}-${new Date().getFullYear()}`
            : `©${new Date().getFullYear()}`}{" "}
          <Show when={props.configValue("copyright.text")}>
            <Show
              when={props.configValue("copyright.link")}
              fallback={props.configValue("copyright.text")}
            >
              <a
                href={props.configValue("copyright.link")}
                target="_blank"
                class="hover:text-text-secondary dark:hover:text-text-secondary transition-colors"
              >
                {props.configValue("copyright.text")}
              </a>
            </Show>
          </Show>
        </span>
      </Show>

      <Show
        when={
          props.configValue("beian") && props.configValue("beian").length > 0
        }
      >
        <span>
          <For each={props.configValue("beian", []) as any[]}>
            {(beian: any, index) => (
              <>
                <a
                  href={beian.link}
                  target="_blank"
                  class="hover:text-text-secondary dark:hover:text-text-secondary transition-colors"
                >
                  {beian.text}
                </a>
                {index() < props.configValue("beian", []).length - 1 && (
                  <span class="mx-2 text-text-quaternary dark:text-text-quaternary">
                    |
                  </span>
                )}
              </>
            )}
          </For>
        </span>
      </Show>

      <span class="flex items-center">
        <LightningIcon class="w-4 h-4 inline-block" />
        <a
          href="https://youlog.theme.everkm.com"
          target="_blank"
          title={`Powered by everkm-publish@v${props.pageContext.everkm_publish_version} with theme youlog@v${props.pageContext.theme_version}`}
          class="hover:text-text-secondary dark:hover:text-text-secondary transition-colors"
        >
          Youlog
        </a>
      </span>
    </div>
  );
};

const Footer: Component<FooterProps> = (props) => {
  return (
    <div class="mt-10 pt-8 flex flex-col items-center justify-center gap-2">
      <BottomNav configValue={props.configValue} />
      <YoulogPlatform
        youlogPlatform={props.youlogPlatform}
        youlogVersion={props.youlogVersion}
        versionsUrl={props.versionsUrl}
      />
      <CopyrightAndBeian
        pageContext={props.pageContext}
        configValue={props.configValue}
      />
    </div>
  );
};

export default Footer;

