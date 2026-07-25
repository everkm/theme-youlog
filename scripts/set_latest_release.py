#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
set_latest_release.py

将 theme 仓库中指定的 GitHub Release 从 prerelease 晋升为正式 latest 版本。
从中英文 CHANGELOG.md 读取对应版本说明（英文在前、中文在后）；文件不存在或缺少版本条目时中止。

依赖：Python 3.10+、GitHub CLI（`gh`）。

用法示例：
  python3 scripts/set_latest_release.py --repo everkm/theme-youlog --tag v0.5.11
  python3 scripts/set_latest_release.py --repo everkm/theme-youlog \\
    --website https://youlog.theme.everkm.com/ \\
    --changelog-en ./en/CHANGELOG.md --changelog-zh ./zh/CHANGELOG.md

更新日志：
- 2026-06-12：初版，CHANGELOG 强校验 + gh release edit 晋升 latest。
- 2026-07-25：对齐 theme-paper：Release notes 改为英文 + 分割线 + 中文；最前可附官方网站。
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


def parse_changelog_section(changelog_path: Path, version: str) -> str:
    text = changelog_path.read_text(encoding="utf-8")
    pattern = rf"^##\s+v{re.escape(version)}\b[^\n]*\n(.*?)(?=^##\s+v|\Z)"
    match = re.search(pattern, text, flags=re.MULTILINE | re.DOTALL)
    if not match:
        raise SystemExit(
            f"{changelog_path} has no section for v{version}; add '## v{version}' before promoting"
        )
    body = match.group(1).strip()
    if not body:
        raise SystemExit(f"{changelog_path} section for v{version} is empty")
    return body


def build_release_notes(en_body: str, zh_body: str, website: str | None = None) -> str:
    parts: list[str] = []
    if website:
        parts.append(f"Official Website / 官方网站: {website}")
    parts.append(en_body)
    parts.append("---")
    parts.append(zh_body)
    return "\n\n".join(parts)


def promote_release(repo: str, tag: str, body: str) -> None:
    subprocess.run(
        [
            "gh",
            "release",
            "edit",
            tag,
            "--repo",
            repo,
            "--prerelease=false",
            "--latest",
            "--notes",
            body,
        ],
        check=True,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", required=True, help="GitHub owner/repo")
    parser.add_argument("--tag", help="Release tag, e.g. v0.4.3 (default: newest release)")
    parser.add_argument(
        "--website",
        help="Official demo site URL prepended to release notes",
    )
    parser.add_argument(
        "--changelog-en",
        type=Path,
        required=True,
        help="Path to English CHANGELOG.md",
    )
    parser.add_argument(
        "--changelog-zh",
        type=Path,
        required=True,
        help="Path to Chinese CHANGELOG.md",
    )
    args = parser.parse_args()

    tag = args.tag
    if not tag:
        listing = subprocess.check_output(
            [
                "gh",
                "release",
                "list",
                "--repo",
                args.repo,
                "--limit",
                "1",
                "--json",
                "tagName,isPrerelease",
            ],
            text=True,
        )
        releases = json.loads(listing)
        if not releases:
            raise SystemExit(f"no releases found for {args.repo}")
        tag = releases[0]["tagName"]

    version = tag[1:] if tag.startswith("v") else tag
    for path in (args.changelog_en, args.changelog_zh):
        if not path.is_file():
            raise SystemExit(f"CHANGELOG not found at {path}")

    en_body = parse_changelog_section(args.changelog_en, version)
    zh_body = parse_changelog_section(args.changelog_zh, version)
    body = build_release_notes(en_body, zh_body, website=args.website)

    print(f"[INFO] promoting {args.repo} {tag} to latest release")
    promote_release(args.repo, tag, body)
    print(f"[INFO] done: {args.repo} {tag}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
