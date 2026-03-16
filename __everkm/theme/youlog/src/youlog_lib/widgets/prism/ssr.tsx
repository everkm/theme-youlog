interface PrismProps {
  isCN?: boolean;
}

const Prism = (props: PrismProps) => {
  const { isCN = false } = props;
  const cdnHost = isCN ? "cdn.jsdmirror.com" : "cdn.jsdelivr.net";
  return (
    <>
      <link
        rel="stylesheet"
        href={`https://${cdnHost}/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css`}
      ></link>
      <script
        src={`https://${cdnHost}/npm/prismjs@1.29.0/prism.min.js`}
      ></script>
    </>
  );
};

export { Prism };
