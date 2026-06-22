---
slug: index
---



# Youlog Theme Configuration

Youlog is a documentation/blog theme for [everkm-publish](https://publish.everkm.cn), with `book` as the default template. Site-level configuration is placed under the `config` node in workspace `__everkm/everkm.yaml`; route parameters for book directories are set in the `query` of `folders`.

## Configuration Overview

```yaml
# __everkm/everkm.yaml

config:
  site: { ... }           # Site basic info
  layout: { ... }         # Layout options
  features: { ... }       # Feature toggles
  theme_color: "..."      # Browser theme color
  custom_css: "..."       # Custom stylesheet
  copyright: { ... }      # Footer copyright
  beian: [ ... ]          # ICP filing info
  yousha: { ... }         # Yousha comments
  algolia_search: { ... } # Full-text search
  header_nav: [ ... ]     # Top navigation bar
  bottom_nav: [ ... }     # Footer links
  body_end_html: "..."    # HTML appended at end of body

folders:
  "/docs/":
    template: book
    query:
      nav_file: /docs/_nav.md   # Optional: chapter navigation file
      stack: true               # Optional: top-bottom layout (header on top, below split into left/right)
```

---

## Site Info `site`

| Field | Type | Description |
|--------|------|------|
| `site.name` | string | Site name, used in page title, sidebar, header, footer, etc. |
| `site.description` | string | Site description (publish system metadata) |
| `site.keywords` | string | Site keywords (publish system metadata) |
| `site.logo` | string | Logo image path, e.g. `~/assets/logos/logo.svg` |
| `site.host` | string | Site domain, used for "Permalink" display in the content area |

Example:

```yaml
config:
  site:
    name: My Docs
    description: My documentation site
    keywords: docs, everkm
    logo: ~/assets/logos/logo.svg
    host: docs.example.com
```

---

## Layout `layout`

| Field | Type | Default | Description |
|--------|------|--------|------|
| `layout.only_display_logo` | boolean | `false` | When a logo exists, show only the image without the site name |
| `layout.aisde_no_header` | boolean | `false` | Sidebar does not show the site header (Logo / site name). Note: the config key uses the historical spelling `aisde`, not `aside` |
| `layout.hide_print_button` | boolean | `false` | When `true`, hides the print entry (Print button in meta area and print header) |
| `layout.hide_page_qrcode` | boolean | `false` | When `true`, hides the page QR code (on screen and at the bottom of printed pages) |

The `hide_print_button` and `hide_page_qrcode` options can also be set in individual article front matter (see below). **Article-level config takes precedence over global `layout` config.**

Example:

```yaml
config:
  layout:
    hide_print_button: false
    hide_page_qrcode: false
```

When `stack=true`, the site header moves to the top-left of the top bar; it is no longer duplicated inside the sidebar.

---

## Feature Toggles `features`

| Field | Type | Default | Description |
|--------|------|--------|------|
| `features.code_highlight` | boolean | `true` | Whether to enable Prism code highlighting |
| `features.katex_formula` | boolean | `false` | Whether to enable KaTeX math formula rendering |

Example:

```yaml
config:
  features:
    code_highlight: true
    katex_formula: true
```

---

## Appearance

| Field | Type | Description |
|--------|------|------|
| `theme_color` | string | Browser `theme-color`, e.g. `"#0f766e"` |
| `custom_css` | string | Path to custom CSS file, e.g. `~/assets/my.css` |

Color variable examples can be found under `templates/theme-demo/` in the theme package. Override CSS variables via `custom_css` to customize brand colors.

---

## Navigation

### Header Navigation `header_nav`

Displayed at the top-right of the page (horizontal menu on desktop, collapsible menu on mobile). Supports nested sub-menus.

```yaml
config:
  header_nav:
    - title: Home
      url: /
    - title: Docs
      url: /docs/
    - title: More
      url: /more/
      children:
        - title: Sub-menu
          url: /more/sub/
```

| Field | Type | Default | Description |
|------|------|--------|------|
| `title` | string | — | Display text |
| `url` | string | — | Link URL |
| `new_window` | boolean | `true` | Whether to open in a new window |
| `children` | array | — | Sub-menu items, same structure as parent |

### Footer Navigation `bottom_nav`

Displayed at the bottom of the content area. **Only supports one level** of links.

```yaml
config:
  bottom_nav:
    - title: everkm
      url: https://everkm.cn
    - title: GitHub
      url: https://github.com/everkm/theme-youlog
      new_window: true
```

---

## Search `algolia_search`

When configured, the Algolia full-text search component appears in the top bar (requires `plugin-in-search` build artifacts).

```yaml
config:
  algolia_search:
    app_id: YOUR_APP_ID
    api_key: YOUR_SEARCH_API_KEY
    index_name: your_index
    site: your-site-id
```

| Field | Description |
|------|------|
| `app_id` | Algolia Application ID |
| `api_key` | Algolia Search-Only API Key |
| `index_name` | Index name |
| `site` | Site identifier (used internally by the plugin) |

---

## Comments `yousha`

Configure to integrate [Yousha Comments](https://yousha.top/):

```yaml
config:
  yousha:
    community: your-community-id
```

When configured, a `<yousha-comment>` component is rendered below the article content.

---

## Footer Info

### Copyright `copyright`

```yaml
config:
  copyright:
    from_year: 2021        # Optional, start year; if omitted, only the current year is shown
    text: everkm           # Copyright holder text
    link: https://everkm.cn  # Optional, link URL
```

### ICP Filing `beian`

```yaml
config:
  beian:
    - text: ICP Filing Number
      link: https://beian.miit.gov.cn/
    - text: Public Security Filing Number
      link: https://beian.mps.gov.cn/
```

---

## Book Template Route Parameters (`folders.query`)

For directories using `template: book`, template query parameters can be passed via `query` in `everkm.yaml`:

```yaml
folders:
  "/docs/":
    template: book
    query:
      nav_file: /docs/_nav.md
      stack: true
  "/blog/":
    template: book
    # No nav_file: no left-side tree navigation
```

| Parameter | Type | Description |
|------|------|------|
| `nav_file` | string | **Optional.** Path to the chapter navigation Markdown file (usually `_nav.md` or `_SUMMARY.md`). When not configured or the file does not exist, tree navigation and previous/next navigation are not displayed |
| `stack` | boolean | **Optional.** `true` / `1` / `yes` enables top-bottom layout: full-width header on top, navigation tree on the left and content on the right below. Default `false` uses left-right layout (full-height sidebar on the left, header and content on the right) |

### Layout Mode Comparison

**Default (`stack=false`)**

```
┌──────────┬──────────────────┐
│ Sidebar  │ Header           │
│ (full h) ├──────────────────┤
│ Nav tree │ Content + TOC    │
└──────────┴──────────────────┘
```

**Top-Bottom Layout (`stack=true`)**

```
┌─────────────────────────────┐
│ Header (site Logo + tools)  │
├──────────┬──────────────────┤
│ Nav tree │ Content + TOC    │
└──────────┴──────────────────┘
```

Behavior differences when `stack=true`:

- The site Logo / name is permanently displayed on the left side of the top bar (no longer switches to article title on scroll)
- The sidebar no longer duplicates the site header
- The sidebar only shows the navigation tree

---

## Article Front Matter

The following fields can be set in the YAML front matter at the beginning of a Markdown file:

| Field | Type | Description |
|------|------|------|
| `meta.description` | string | Page `<meta name="description">` |
| `meta.keywords` | string | Page `<meta name="keywords">` |
| `meta.hide_meta` | boolean | When `true`, hides meta info such as update date and permalink (default `false`) |
| `meta.hide_toc` | boolean | When `true`, hides the table of contents (TOC) (default `false`) |
| `meta.hide_title` | boolean | When `true`, hides the article title (default `false`) |
| `meta.permalink` | string | Permalink slug, displayed in the meta area as `https://{site.host}/{permalink}` |
| `meta.hide_print_button` | boolean | When `true`, hides the print entry; when not set, inherits `layout.hide_print_button` (default `false`) |
| `meta.hide_page_qrcode` | boolean | When `true`, hides the page QR code; when not set, inherits `layout.hide_page_qrcode` (default `false`) |

Example:

```yaml
---
title: Built-in Filters
meta:
  description: Filter documentation
  keywords: filter, everkm
  permalink: docs/builtin-filter
  hide_print_button: true
  hide_page_qrcode: true
---
```

---

## Environment Variables

Deployment or hosting platforms can inject values via environment variables (read by the theme via `env()`):

| Variable | Description |
|--------|------|
| `YOULOG_PLATFORM` | Youlog platform link; when configured, a "Youlog" entry appears in the footer |
| `YOULOG_VERSION` | Current deployment version number; linked with the version list component |
| `YOULOG_VERSIONS_URL` | Version list JSON URL, used by the `<youlog-version>` component |

> The `versions_url` field in `everkm.yaml` is reserved for the publish workspace; the theme's footer version component actually reads the environment variable `YOULOG_VERSIONS_URL`.

---

## Content Markdown Extensions

### Alert Blocks

Use blockquotes with specific classes in Markdown:

| Class | Purpose |
|-------|------|
| `.tips` | Tips |
| `.info` | Info |
| `.warning` | Warning |
| `.error` | Error |
| `.success` | Success |

### dcard `list` Parameter

`dcard/list` supports the parameter `hide_prev_next: true`, which hides the previous/next navigation links in list items.

---

## Reader Settings (Browser-side)

The following settings are stored locally in the user's browser and are **not** configured in `everkm.yaml`:

- Font size, line height, font family
- Light / dark mode

Access the reading settings panel via the "Aa" button in the top bar.

---

## Theme Metadata

| Item | Value |
|----|-----|
| Theme name | `youlog` |
| Default template | `book` |
| Demo site | https://youlog.theme.everkm.com/ |
| Repository | https://github.com/everkm/theme-youlog |

