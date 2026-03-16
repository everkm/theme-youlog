import { Component } from "solid-js";
import NavMenu, { NavItem } from "../youlog_lib/widgets/nav-menu/ssr";

const predefindLangs = [
  { title: "中文", url: "/zh/", code: "zh" },
  { title: "English", url: "/", code: "en" },
];

function getLanguageSwitchItems(currentLang: string): NavItem[] {
  let langLabel = "English";
  if (currentLang === "zh") langLabel = "中文";
  return [{ title: langLabel, children: predefindLangs }];
}

interface PrimaryNavProps {
  requestId: string;
  currentLang: string;
  items: NavItem[];
}

const PrimaryNav: Component<PrimaryNavProps> = (props) => {
  const mergedItems = [...props.items, ...getLanguageSwitchItems(props.currentLang)];
  return (
    <>
      <div id="mobile-menu-container" class="md:hidden absolute right-4"></div>
      <nav class="hidden md:block invisible absolute right-4" id="primary-nav">
        <NavMenu items={mergedItems} requestId={props.requestId} defaultNewWindow={false} withContext={true} />
      </nav>
    </>
  );
};

export default PrimaryNav;
