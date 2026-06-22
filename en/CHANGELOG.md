---
title: Changelog
slug: changelog
---

{#private}
This changelog is for end users. Keep the wording user-friendly and avoid exposing internal technical details.


## v0.5.9 (2026-06-22)

- **Header navigation**
  - Added `start_icon` and `end_icon` to show icons before or after menu text (e.g. language switcher, external link)
  - Added `reflect_active_child`: when a sub-item matches the current page, the parent shows that sub-item's title (useful for language menus)
  - Added `no_highlight` to exclude specific items from the current-page highlight style
  - Added `match_children_prefix`: when enabled on a parent menu, its direct child links can match the current page by URL prefix (including the home path `/`). Useful for language menus where the English entry points to `/` and should stay highlighted on pages not listed separately in the menu (e.g. the changelog page)


## v0.5.8 (2026-06-22)

- **Sidebar navigation**
  - Fixed occasional flicker where the sidebar tree briefly collapsed then re-expanded, and momentary loss of the current-location highlight during AJAX navigation; expand and scroll state now persist reliably after page changes


## v0.5.7 (2026-06-22)

- **Anchor navigation (small screens)**
  - Fixed incorrect heading alignment and extra blank space below the title when first opening (uncached) a page via a `#anchor` link
  - After fonts, images, and other resources finish loading and change the content height, headings are automatically re-aligned; manual scrolling during this process immediately takes over


## v0.5.6 (2026-06-22)

- **Anchor navigation**
  - Unified anchor scrolling so headings are no longer hidden behind the TOC bar on small screens when entering a page cold with a `#anchor` link
  - Jump positions are now consistent across TOC clicks, AJAX navigation, and browser back/forward


## v0.5.5 (2026-06-22)

- **Table of contents (small screens)**
  - Fixed incorrect heading position when entering a page via an anchor link

## v0.5.4 (2026-06-22)

- **Sidebar navigation (small screens)**
  - Fixed the menu button failing to open the sidebar, or navigation links being unclickable after opening, in stack layout
  - Sidebar drawer now fills the viewport height from the top when open; desktop layout is unaffected
  - Sidebar drawer max width is capped to avoid covering too much of the main content
  - Fixed the sidebar menu button sometimes stopping work after AJAX navigation

- **Table of contents (small screens)**
  - Fixed imprecise scrolling to the target heading when tapping a TOC entry, especially with a short TOC or entries near the top
  - Fixed incorrect heading position when entering a page via an anchor link

## v0.5.3 (2026-06-20)

- Added `body_end_html` config option to append custom HTML at the bottom of every page, for analytics scripts, live chat widgets, and other third-party integrations


## v0.5.2 (2026-06-20)

- **Top navigation**
  - Improved current-page highlighting: the home page matches exactly only, no longer highlighted by subpaths
  - Directory links correctly match child pages, consistent with sidebar navigation rules
  - Current page is highlighted in the floating menu without expanding the dropdown first

- **Site search**
  - Fixed the top-bar Algolia search box disappearing or breaking after AJAX navigation
  - Floating search overlay closes automatically before navigation to avoid leftover panels

- **Table of contents (TOC)**
  - Fixed desktop sticky TOC overflowing the viewport; long TOCs scroll normally
  - Active TOC entry scrolls into view as you scroll the main content
  - Fixed duplicate anchor IDs causing multiple TOC entries to highlight at once
  - TOC scrolling is isolated from page scrolling; expanding the TOC on small screens no longer scrolls the whole page
  - Small-screen expanded TOC height is limited dynamically by position, avoiding clipped or off-screen content
  - Desktop TOC updates incrementally after AJAX navigation for smoother transitions
  - Scroll highlighting marks only the current heading, not parent headings


## v0.5.1 (2026-06-17)

- Fixed site name, navigation, footer, and other config not displaying in the correct language on multilingual sites
- Fixed pages potentially failing to render when optional features (e.g. Algolia search, Yousha comments, copyright info) are not configured


## v0.5.0 (2026-06-17)

**New features**

**Stack layout mode**
- `book` template adds `stack` layout: full-width site branding in the top bar, navigation on the left and content on the right below—suited for documentation sites
- `nav_file` replaces `summary`; sidebar and prev/next navigation hide automatically when not configured
- Sidebar / TopHeader intelligently switch site header and menu button display by layout mode

**Page print & QR code**
- Added `layout.hide_print_button` and `layout.hide_page_qrcode` to control print button and page QR code globally or per page
- Front matter overrides global layout settings for finer control

**TOC & title visibility**
- Added `meta.hide_toc` and `meta.hide_title` to show or hide per-page TOC and title

**AJAX navigation (PJAX v5)**
- Full rewrite as a seamless PJAX engine: page transitions without flicker or white screen
- Link prefetch cache loads pages in the background on hover for near-instant navigation
- Layout fingerprint: full page reload when head resources change, keeping styles and scripts in sync
- Sidebar nav tree, TOC, code highlighting, and other widgets remount automatically after AJAX navigation

**Unified anchor scrolling**
- Shared anchor scroll utility with support for nested scroll containers
- TOC clicks, heading anchors, and URL hash navigation behave consistently
- Stack layout accounts for top bar height for accurate scroll positioning

**Improvements**

**Sidebar nav tree**
- Sidebar highlight refreshes automatically after anchor navigation (TOC click / hash links), without scrolling to the section manually
- Directory paths `index.html` and trailing `/` are treated as equivalent, avoiding false highlights on directory index pages
- Interactive styles moved to clickable links for better hit targets; expand/collapse icons stay vertically centered with multi-line titles

**Sidebar width drag**
- Fixed sidebar width resizer breaking after PJAX navigation (works after browser back/forward and in-site link changes)

**Markdown typography**
- Removed left accent bar on h2 headings for a cleaner look
- Fixed link underlines showing through `<code>`-only link backgrounds
- Heading anchor icon replaced with a chain-link style

**Hash navigation & history**
- Fixed full page requests incorrectly triggered on browser back/forward (popstate)
- TOC links use `data-no-ajax` so TOC clicks are not intercepted by pjax

**Internal**

- Build naming unified: `ssr-*` → `jsrender-*`, `fe-*` → `client-*`, reducing confusion with runtime SSR
- `scrollAnchor` utility moved to `youlog_lib/core`, shared by TOC and page-ajax
- Widget documentation standards; module entries aggregated in `index.ts`; README structure unified
- `set_latest_release` release script enforces changelog validation on every release

## v0.4.3 (2026-04-10)
- `.markdown-body` uses justified text for paragraphs, list items, and blockquotes in CJK languages (zh/ja/ko)

## v0.4.2 (2026-03-18)
- Removed `markdown_body` from NavTree


## v0.4.1 (2026-03-18)
- Added `config.features.code_highlight` code highlighting toggle, default `true`
- Added `config.features.katex_fomula` formula rendering, default `false`


## v0.4.0 (2026-03-18)
- Improved module source structure
- Improved footnotes, code highlighting, and formula rendering


## v0.3.16 (2025-12-09)
- Underlines added to links in body content
- Added alert blocks: `.tips`, `.info`, `.success`, `.warning`, `.error`


## v0.3.15 (2025-11-23)
- Added `data-doc-meta-permalink` attribute

## v0.3.14 (2025-11-23)
- Updated `updated_at` icon
- Switched permalink field to `permalink`

## v0.3.13 (2025-11-23)
- DocMeta uses icons

## v0.3.12 (2025-11-20)
- Added `dcard/palyer`


## v0.3.11 (2025-11-14)
- UI improvements

## v0.3.10 (2025-11-14)
- UI improvements

## v0.3.9 (2025-11-14)
- UI improvements

## v0.3.8 (2025-11-14)
- Fixed UI values not updating on Theme Reset
- UI improvements

## v0.3.7 (2025-11-13)
- Added scan-to-open-this-page QR code
- Added print feature
- Fixed font size, font family, and dark mode settings
- Refactored navigation structure parsing
- Style improvements

## v0.3.6 (2025-11-12)
- Fixed Yousha comments integration

## v0.3.5 (2025-11-11)
- Added `dcard/items` 

## v0.3.4 (2025-11-10)
- Improved meta information display
- dcard/list updates
    1. Removed updated marker
    2. Added `hide_prev_next` for prev/next navigation

## v0.3.3 (2025-11-08)
- Fixed Breadcrumbs click path resolution

## v0.2.8 (2025-10-17)

- Added `$CONFIG.layout.aside_no_header` to control whether the sidebar shows the Header
