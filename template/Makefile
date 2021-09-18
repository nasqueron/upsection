CP=cp
RM=rm -rf
SOURCE=/usr/local/share/upsection

#   -------------------------------------------------------------
#   Main targets
#   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

ALL_TARGETS=package.json .browserslistrc gulpfile.babel.js node_modules
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
	upsection package.json

.browserslistrc:
	upsection .browserslistrc

node_modules: package.json
	npm install

gulpfile.babel.js:
	${CP} ${SOURCE}/gulpfile.js gulpfile.babel.js
