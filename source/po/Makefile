# Currant-i18n
# This script needs the jinja module to extract strings

PROJECT_NAME = "Currant"
BUGSADDR = "developer@bbtechgroup.com"
ORGANIZATION = "Brothers Bridge Technology"
AUTHOR = "Felix Yan"
VERSION = "1.0"

SED = /usr/bin/sed
MSGFMT = /usr/bin/msgfmt
INSTALL = /usr/bin/install
PYBABEL = /usr/bin/pybabel2
DESTDIR = generated

all:

extract:
	$(PYBABEL) extract -F web/.pybabel.cfg --copyright-holder=$(ORGANIZATION) --msgid-bugs-address=$(BUGSADDR) --project=$(PROJECT_NAME) --version=$(VERSION) -o web/web.pot ../web/src

update:
	test -x $(MSGFMT) && for file in */*.po; \
  	do \
		package=$$(echo $$file | $(SED) -e 's#\([^/]\+\).*#\1#'); \
		lang=$$(echo $$file | $(SED) -e 's#.*/\([^/]\+\).po#\1#'); \
		$(PYBABEL) update -i $$package/$$package.pot -l $$lang -o $$package/$$lang.po; \
	done

install:
	test -x $(MSGFMT) && for file in */*.po; \
  	do \
		package=$$(echo $$file | $(SED) -e 's#\([^/]\+\).*#\1#'); \
		lang=$$(echo $$file | $(SED) -e 's#.*/\([^/]\+\).po#\1#'); \
		$(INSTALL) -d $(DESTDIR)/$$lang/LC_MESSAGES; \
		$(MSGFMT) -o $(DESTDIR)/$$lang/LC_MESSAGES/$$package.mo $$file; \
	done
