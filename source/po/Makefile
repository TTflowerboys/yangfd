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
PYBABEL = $(shell [ -x /usr/bin/pybabel2 ] && echo python2 ./pybabel || echo ./pybabel)
GREP = /usr/bin/env grep
DESTDIR = generated

all: generate extract update install

# generate js i18n keys to a html style like "{{_('xxx')}}", so the js key can be extracted
generate:
	cd ../web; npm run generate_i18n_js; cd ../po

extract:
	$(PYBABEL) extract -F web/.pybabel.cfg --copyright-holder=$(ORGANIZATION) --msgid-bugs-address=$(BUGSADDR) --project=$(PROJECT_NAME) --version=$(VERSION) -o web/web.pot ../web/src ../server

update:
	for file in */*.po; \
	do \
		package=$$($(PYTHON) -c "print('$$file'.split('/')[0])"); \
		lang=$$($(PYTHON) -c "print('$$file'.split('/')[-1].split('.po')[0])"); \
		$(PYBABEL) update -i $$package/$$package.pot -l $$lang -o $$package/$$lang.po; \
	done

install:
	for file in */*.po; \
	do \
		package=$$($(PYTHON) -c "print('$$file'.split('/')[0])"); \
		lang=$$($(PYTHON) -c "print('$$file'.split('/')[-1].split('.po')[0])"); \
		$(GREP) "Language:" $$file; \
		$(INSTALL) -d $(DESTDIR)/$$lang/LC_MESSAGES; \
		$(PYBABEL) compile -o $(DESTDIR)/$$lang/LC_MESSAGES/$$package.mo -l $$lang -i $$file; \
	done
