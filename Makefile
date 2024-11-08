COMPONENTS_DIR=/usr/local/share/upsection
BIN_DIR=/usr/local/bin

MKDIR=mkdir -p
INSTALL_BIN=install -m 755
INSTALL_SHARE=install -m 644

#   -------------------------------------------------------------
#   Main targets
#   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

all:
	# Nothing to build

install:
	${MKDIR} ${COMPONENTS_DIR} ${BIN_DIR}
	${INSTALL_BIN} src/upsection.py ${BIN_DIR}/upsection
	${INSTALL_SHARE} components/* ${COMPONENTS_DIR}

#   -------------------------------------------------------------
#   Development and maintenance targets
#   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

test:
	cd tests/site && \
	cp ../../config.yml . && \
	cp -Rp ../../template/* . && \
	PACKAGE_TEMPLATE=../../components/package-template.json UPSECTION=../../src/upsection.py make

publish:
	upsection package.json
