# Currant-i18n
# This script needs the jinja module to extract strings

PROJECT_NAME = "Currant"
BUGSADDR = "developer@bbtechgroup.com"
ORGANIZATION = "Brothers Bridge Technology"
AUTHOR = "Felix Yan"
VERSION = "1.0"

SED = /usr/bin/env sed
MSGFMT = /usr/bin/env msgfmt
INSTALL = /usr/bin/env install
PYBABEL = $(shell [[ -x /usr/bin/pybabel2 ]] && echo /usr/bin/pybabel2 || echo /usr/bin/env pybabel)
DESTDIR = generated

all:

extract:
	$(PYBABEL) extract -F web/.pybabel.cfg --copyright-holder=$(ORGANIZATION) --msgid-bugs-address=$(BUGSADDR) --project=$(PROJECT_NAME) --version=$(VERSION) -o web/web.pot ../web/src

update:
	for file in */*.po; \
  	do \
		package=$$(echo $$file | $(SED) -e 's#\([^/]\+\).*#\1#'); \
		lang=$$(echo $$file | $(SED) -e 's#.*/\([^/]\+\).po#\1#'); \
		$(PYBABEL) update -i $$package/$$package.pot -l $$lang -o $$package/$$lang.po; \
	done

install:
	for file in */*.po; \
  	do \
		package=$$(echo $$file | $(SED) -e 's#\([^/]\+\).*#\1#'); \
		lang=$$(echo $$file | $(SED) -e 's#.*/\([^/]\+\).po#\1#'); \
		$(INSTALL) -d $(DESTDIR)/$$lang/LC_MESSAGES; \
		$(MSGFMT) -o $(DESTDIR)/$$lang/LC_MESSAGES/$$package.mo $$file; \
	done
