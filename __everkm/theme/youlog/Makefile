.PHONY: tag client-build client-dev jsrender-build jsrender-dev build bundle
tag:
	cd ../.. && $(MAKE) tag

# 需要与 build.js 中的输出目录一致
DIST_DIR=./dist

fe-install:
	cd . && pnpm i

# 清理 dist/ 与 templates/everkm-render.js
fe-clean:
	rm -rf $(DIST_DIR)
	rm -f templates/everkm-render.js

# 仅浏览器端资源（youlog、插件等），不生成 everkm-render.js
client-build: fe-clean
	cd . && NODE_ENV=production pnpm run build
	ls -Rlh $(DIST_DIR)

# 浏览器端资源开发（watch）
client-dev: fe-clean
	cd . && pnpm run dev

# 组装可发布主题包：JSRender 构建 + 复制模板与静态资源
build: fe-clean
	$(MAKE) jsrender-build

	cp -r templates $(DIST_DIR)
	cp assets-manifest.json $(DIST_DIR)
	cp everkm-theme.yaml $(DIST_DIR)
	cp assets/* $(DIST_DIR)/assets/
	@if [ -d "screenshots" ]; then cp -r screenshots $(DIST_DIR)/; fi

	# 将 everkm_version 写入 everkm-theme.yaml
	# 如果 EVERKM_VERSION 存在则替换，否则不处理
	@if [ -n "$${EVERKM_VERSION}" ]; then \
		VERSION=$${EVERKM_VERSION}; \
		if [ "$$(uname)" = "Darwin" ]; then \
			sed -i '' "s/version: .*/version: $${VERSION}/" $(DIST_DIR)/everkm-theme.yaml; \
		else \
			sed -i "s/version: .*/version: $${VERSION}/" $(DIST_DIR)/everkm-theme.yaml; \
		fi; \
	fi

bundle: build
	@if [ -d ".dist" ]; then \
		rm -rf .dist; \
	fi

	# 打包
	mkdir .dist
	mv $(DIST_DIR) .dist/youlog
	@ZIP_NAME="youlog.zip"; \
	if [ -n "$${EVERKM_VERSION}" ]; then \
		ZIP_NAME="youlog-$${EVERKM_VERSION}.zip"; \
	fi; \
	cd .dist && zip -r ../$$ZIP_NAME youlog; \
	rm -rf .dist

analyze:
	# Ref: <https://www.npmjs.com/package/esbuild-visualizer>
	esbuild-visualizer --metadata bundle-analysis.json --filename bundle-stats.html
	open bundle-stats.html

# INSTALL_DIR=/path/to/site/__everkm/theme/youlog
INSTALL_DIR=/Users/dayu/Coder/dayu_me3/__everkm/theme/youlog
debug-install:
	rsync -av --delete $(DIST_DIR)/assets/ $(INSTALL_DIR)/assets/
	rsync -av --delete templates/ $(INSTALL_DIR)/templates/
	cp assets-manifest.json $(INSTALL_DIR)

copy-types:
	cp -r /Users/dayu/Coder/everkm/everkm2/be/everkm-publish/types/* src/types

# JSRender：浏览器资源 + everkm-render.js
# everkm-render.js 供 everkm-publish 在发布时调用，与 Tera 模板对等（非运行时 SSR 服务）
jsrender-build: fe-clean
	pnpm run build:jsrender

# JSRender 开发（watch）：同时重建 Client 与 everkm-render.js
jsrender-dev: fe-clean
	pnpm run dev:jsrender
