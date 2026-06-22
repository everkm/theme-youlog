.PHONY: tag
tag:
	@if [ "$(TAG)" != "" ]; then \
		git tag -f $(TAG); \
		git push -f github $(TAG); \
	fi


ifneq (, $(shell echo $$DEBUG))
  EKMP = /Users/dayu/Coder/everkm/everkm2/be/everkm-publish/target/debug/everkm-publish
else
  EKMP = ./node_modules/.bin/everkm-publish
endif


print-ekmp:
	@echo $(EKMP)
	@$(EKMP) --version
	
clean-dist:
	rm -rf dist

work: print-ekmp
	@RUST_BACKTRACE=0 EVERKM_LOG=everkm_publish=debug,tpls=debug,info \
		$(EKMP) serve \
		--work-dir ../ \
		--theme youlog \
		--theme-dev \
		--lang=$${EVERKM_LANG:-zh} \
		--listen=0.0.0.0:9081

export-all: print-ekmp
	make clean-dist
	@EVERKM_LOG=info,everkm_publish=info \
		$(EKMP) serve \
		--work-dir ../ \
		--theme youlog \
		--theme-dev \
		--lazy-img \
		--cdn-prefix=/ \
		--lang=en \
		--stop-urls=/zh/ \
		--export

	@EVERKM_LOG=info,everkm_publish=info \
		$(EKMP) serve \
		--work-dir ../ \
		--theme youlog \
		--theme-dev \
		--lazy-img \
		--cdn-prefix=/ \
		--lang=zh \
		--base-prefix /zh \
		--export

# package-theme: print-ekmp
# 	@RUST_BACKTRACE=0 \
# 		EVERKM_LOG=info \
# 		$(EKMP) theme pack \
# 		--dev-dir ./ 

.PHONY: dist
dist: 
	cd theme/youlog && $(MAKE) build
	$(MAKE) export-all


preview:
	@$(EKMP) web dist

pnpm-install:
	pnpm install

set-latest:
	make -f ../scripts/set_latest_release.mk youlog-latest

install-everkm-publish:
	pnpm install everkm-publish@latest

push-index-themes:
	gh workflow run publish-theme.yaml \
		--repo everkm/themes \
		-f mode=single \
		-f full_name=everkm/theme-youlog