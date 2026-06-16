import { describe, expect, it } from "vitest";
import {
  buildAjaxHeadFingerprint,
  buildAjaxLayoutFingerprint,
  buildAjaxPageFingerprint,
} from "./ajaxLayout";

describe("ajaxLayout fingerprints", () => {
  const config = {
    layout: {
      aisde_no_header: false,
      only_display_logo: true,
    },
    algolia_search: { app_id: "x" },
    header_nav: [{ title: "Home" }],
    features: {
      code_highlight: true,
      katex_formula: false,
    },
    custom_css: "/theme.css",
  };

  it("builds stable layout fingerprint", () => {
    const fp = buildAjaxLayoutFingerprint({
      page: "book",
      stack: true,
      hasNav: true,
      config,
    });
    expect(fp).toBe(
      "page=book|stack=1|nav=1|sidebar_header=1|only_logo=1|algolia=1|header_nav=1",
    );
  });

  it("uses layout fingerprint for page shell", () => {
    const fp = buildAjaxPageFingerprint({
      page: "book",
      stack: false,
      hasNav: false,
      config,
    });
    expect(fp).toBe(
      "page=book|stack=0|nav=0|sidebar_header=1|only_logo=1|algolia=1|header_nav=1",
    );
  });

  it("builds head fingerprint for reload detection", () => {
    expect(buildAjaxHeadFingerprint(config)).toBe(
      "code=1|katex=0|custom_css=1",
    );
  });
});
