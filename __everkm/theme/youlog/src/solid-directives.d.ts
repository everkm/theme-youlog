import 'solid-js'

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      observeVisibility: (isVisible: boolean) => void
      autoFocus: boolean
      clickOutside: () => void
    }

    // 自定义元素
    interface IntrinsicElements {
      'x-in-search': {
        'app-id': string;
        'api-key': string;
        index: string;
        site: string;
        'only-button'?: string;
      };
      'yousha-comment': {
        community: string;
      };
      'youlog-version': {
        'version-list-url': string;
        version: string;
      };
    }
  }
}
