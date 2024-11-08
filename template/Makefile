CP=cp
RM=rm -rf
SOURCE=/usr/local/share/upsection
UPSECTION ?= upsection

#   -------------------------------------------------------------
#   Main targets
#   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

ALL_TARGETS=package.json .babelrc .browserslistrc gulpfile.babel.js node_modules
CLEAN_TARGETS=dist/ ${ALL_TARGETS}

all: ${ALL_TARGETS}
	npm run build

dev: ${ALL_TARGETS}
	npm start

clean:
	${RM} ${CLEAN_TARGETS}

#   -------------------------------------------------------------
#   Individual targets
#   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

package.json:
	${UPSECTION} package.json

.browserslistrc:
	${UPSECTION} .browserslistrc

node_modules: package.json
	npm install

.babelrc:
	${CP} ${SOURCE}/babelrc .babelrc

gulpfile.babel.js:
	${CP} ${SOURCE}/gulpfile.js gulpfile.babel.js
