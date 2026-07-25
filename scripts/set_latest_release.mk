MYDIR := $(dir $(lastword $(MAKEFILE_LIST)))
# PYTHON ?= $(MYDIR).venv/bin/python
PYTHON ?= python3


youlog-latest:
	$(PYTHON) $(MYDIR)set_latest_release.py --repo everkm/theme-youlog \
		--website https://youlog.theme.everkm.com/ \
		--changelog-en $(MYDIR)../en/CHANGELOG.md \
		--changelog-zh $(MYDIR)../zh/CHANGELOG.md
