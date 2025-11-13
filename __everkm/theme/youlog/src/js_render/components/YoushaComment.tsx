import { Component, Show } from "solid-js";

interface YoushaCommentProps {
  configValue: (path: string, defaultValue?: any) => any;
}

const YoushaComment: Component<YoushaCommentProps> = (props) => {
  return (
    <Show when={props.configValue("yousha")}>
      <div class="mt-10 pt-8 print:hidden">
        <yousha-comment
          community={props.configValue("yousha.community")}
        ></yousha-comment>
      </div>
    </Show>
  );
};

const YoushaCommentScript: Component<YoushaCommentProps> = (props) => {
  return (
    <Show when={props.configValue("yousha")}>
      <script
        src="https://share.yousha.top/embed/yousha-comment.js"
        type="module"
      ></script>
      {/* <script src="https://app-dev.dayu.me/assets/js/yousha-comment.js" type="module"></script> */}
    </Show>
  );
};

export default YoushaComment;
export { YoushaCommentScript };
