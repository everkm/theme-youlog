#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
set_latest_release.py

将 theme 仓库中指定的 GitHub Release 从 prerelease 晋升为正式 latest 版本。
优先从 CHANGELOG.md 读取对应版本说明；找不到 changelog 时回退 git log 摘要。

依赖：Python 3.10+、GitHub CLI（`gh`）。

用法示例：
  python3 scripts/set_latest_release.py --repo everkm/theme-youlog --tag v0.4.3
  python3 scripts/set_latest_release.py --repo everkm/theme-youlog
  python3 scripts/set_latest_release.py --repo everkm/theme-youlog --changelog __everkm/theme/youlog/CHANGELOG.md

更新日志：
- 2026-06-12：初版，CHANGELOG 强校验 + gh release edit 晋升 latest。
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
            f"CHANGELOG.md has no section for v{version}; add '## v{version}' before promoting"
        )
    body = match.group(1).strip()
    if not body:
        raise SystemExit(f"CHANGELOG.md section for v{version} is empty")
    return body


def git_log_summary(tag: str) -> str:
    log = subprocess.check_output(
        ["git", "log", "-5", "--pretty=format:- %s"],
        text=True,
        cwd=Path(__file__).resolve().parents[1],
    )
    return log.strip() or f"Release {tag}"


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
        "--changelog",
        type=Path,
        default=Path("__everkm/theme/youlog/CHANGELOG.md"),
        help="Path to CHANGELOG.md",
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
    changelog_path = args.changelog
    if changelog_path.is_file():
        body = parse_changelog_section(changelog_path, version)
    else:
        print(f"[WARN] changelog not found at {changelog_path}, falling back to git log")
        body = git_log_summary(tag)

    print(f"[INFO] promoting {args.repo} {tag} to latest release")
    promote_release(args.repo, tag, body)
    print(f"[INFO] done: {args.repo} {tag}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
