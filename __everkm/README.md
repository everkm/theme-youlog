## 模板发布与索引触发

- 先 `make tag` 完成打包，发布到 Github Release
- 运行 `make set-latest` 标记 Release 最新版
- 触发 everkm/themes 索引最新模板 <https://github.com/everkm/themes/actions/workflows/publish-theme.yaml>

```bash
gh workflow run publish-theme.yaml \
  --repo everkm/themes \
  -f mode=single \
  -f full_name=everkm/theme-youlog
```