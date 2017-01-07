# Currant-i18n
# This script needs the jinja2 module to extract strings

PROJECT_NAME = "Currant"
BUGSADDR = "developer@bbtechgroup.com"
ORGANIZATION = "Brothers Bridge Technology"
AUTHOR = "Felix Yan"
VERSION = "1.0"

PYTHON = /usr/bin/env python
INSTALL = /usr/bin/env install
#PYBABEL = $(shell [ -x /usr/bin/pybabel2 ] && echo /usr/bin/pybabel2 || echo /usr/bin/env pybabel)
PYBABEL = ./pybabel
GREP = /usr/bin/env grep
DESTDIR = generated

all: extract update install

extract:
	$(PYBABEL) extract --no-wrap -F web/.pybabel.cfg --copyright-holder=$(ORGANIZATION) --msgid-bugs-address=$(BUGSADDR) --project=$(PROJECT_NAME) --version=$(VERSION) -o web/web.pot ../web/src ../server

update:
	for file in */*.po; \
	do \
		package=$$($(PYTHON) -c "print('$$file'.split('/')[0])"); \
		lang=$$($(PYTHON) -c "print('$$file'.split('/')[-1].split('.po')[0])"); \
		$(PYBABEL) update --no-wrap -i $$package/$$package.pot -l $$lang -o $$package/$$lang.po; \
	done

install:
	for file in */*.po; \
	do \
		package=$$($(PYTHON) -c "print('$$file'.split('/')[0])"); \
		lang=$$($(PYTHON) -c "print('$$file'.split('/')[-1].split('.po')[0])"); \
		$(GREP) "Language:" $$file; \
		$(INSTALL) -d $(DESTDIR)/$$lang/LC_MESSAGES; \
		$(PYBABEL) compile -f -o $(DESTDIR)/$$lang/LC_MESSAGES/$$package.mo -l $$lang -i $$file; \
	done
