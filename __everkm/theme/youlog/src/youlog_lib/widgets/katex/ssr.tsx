import { getCurrentLang } from "youlog_lib/core/i18n";

interface KatexProps {
  isCN?: boolean;
  disableDetectCN?: boolean;
}

const Katex = (props: KatexProps) => {
  let { isCN = false } = props;

  // 如果未指定 isCN，则根据语言自动检测是否为中国大陆
  if (!isCN && typeof props.isCN === "undefined" && !props.disableDetectCN) {
    const lang = getCurrentLang().toLowerCase().replace("_", "-");
    isCN = lang === "zh" || lang.startsWith("zh-");
  }

  const cdnHost = isCN ? "cdn.jsdmirror.com" : "cdn.jsdelivr.net";
  return (
    <>
      <link
        rel="stylesheet"
        href={`https://${cdnHost}/npm/katex@0.16.9/dist/katex.min.css`}
      ></link>
      <script
        defer
        src={`https://${cdnHost}/npm/katex@0.16.9/dist/katex.min.js`}
      ></script>
      <script
        defer
        src={`https://${cdnHost}/npm/katex@0.16.9/dist/contrib/auto-render.min.js`}
      ></script>
    </>
  );
};

export { Katex };
