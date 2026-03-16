interface KatexProps {
  isCN?: boolean;
}

const Katex = (props: KatexProps) => {
  const { isCN = false } = props;
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
