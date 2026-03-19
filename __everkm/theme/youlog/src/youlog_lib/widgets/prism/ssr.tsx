import { getCurrentLang } from "youlog_lib/core/i18n";

interface PrismProps {
  isCN?: boolean;
  disableDetectCN?: boolean;
}

const Prism = (props: PrismProps) => {
  let { isCN = false } = props;
  if (!isCN && typeof props.isCN === "undefined" && !props.disableDetectCN) {
    const lang = getCurrentLang().toLowerCase().replace("_", "-");
    isCN = lang === "zh" || lang.startsWith("zh-");
  }
  const cdnHost = isCN ? "cdn.jsdmirror.com" : "cdn.jsdelivr.net";
  return (
    <>
      {/* <link
        rel="stylesheet"
        href={`https://${cdnHost}/npm/prismjs@1.30.0/themes/prism-tomorrow.min.css`}
      ></link>
      <script
        src={`https://${cdnHost}/npm/prismjs@1.30.0/prism.min.js`}
      ></script> */}

      <link
        rel="stylesheet"
        href={`https://${cdnHost}/combine/npm/prismjs@1.30.0/themes/prism-tomorrow.min.css,npm/prismjs@1.30.0/plugins/toolbar/prism-toolbar.min.css`}
      ></link>
      <script
        src={`https://${cdnHost}/combine/npm/prismjs@1.30.0/components/prism-core.min.js,npm/prismjs@1.30.0/plugins/autoloader/prism-autoloader.min.js,npm/prismjs@1.30.0/plugins/toolbar/prism-toolbar.min.js,npm/prismjs@1.30.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js`}
      ></script>
      <script
        innerHTML={`Prism.plugins.autoloader.languages_path = "https://${cdnHost}/npm/prismjs@1.30.0/components/";`}
      ></script>
    </>
  );
};

export { Prism };
