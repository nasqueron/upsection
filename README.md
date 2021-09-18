Upsection. Generate static sites.
=================================

Several Nasqueron static sites use the ZURB Template for Foundation for Sites.

This command allows to maintain in sites repository an unified configuration
stored in config.yml, and generate Node package, browserslists or Gulp files.

The main expected benefit is to maintain the Node dependencies in a central
repository and so avoid to upgrade package.json everywhere.

Installation
------------

To install the `upsection` command and needed resources,
use `make install`.

How to use on an existing site
------------------------------

Go to the site repository directory and run `make`.

That will take care to call upsection to generate files and then
to call npm to install Node dependencies and run the gulp script.

If successful, you've a full build of the site in the dist/ directory.

To use in development mode, use `make dev`.

How to convert a site?
----------------------
  
  1. Update the keys of config.yml to adhere to Upsection conventions
  2. Move package.json metadata unique to your project in config.yml
  3. Run `upsection package.json` and compare with legacy package.json
  4. Remove from your repo package.json, gulpfile.babel.js and .browsers
  5. Add to your repo `template/Makefile`

How to start a new project?
---------------------------

  1. Copy the template directory for your site
  2. Generate a configuration file from the .in provided

If we would automate the tasks, that would give
for https://awesome.nasqueron.org:

```
cp -R template /path/to/your-awesome-site
cd /path/to/your-awesome-site
git init .
sed -i s/%%SUBDOMAIN%%/awesome/g config.yml.in > config.yml
rm config.yml.in
# Edit config.yml
make
```

The config.yml.in file offers %%SUBDOMAIN%% for any automation need.

How to regenerate the files on an existing site?
------------------------------------------------

Use `make clean all` if you want a fresh node_modules folder.

To keep node_modules folder, simply run `upsection` again.
If you updated dependencies, `npm install` works (or yarn).

To regenerate only one file, you can use `upsection .browserslistrc`.

What this script doesn't do?
----------------------------

Upsection takes care of the installation and maintenance of the build mechanism
but not of the maintenance of the content and assets.

As such, upsection doesn't propagate changes in template folder, so for e.g.
it won't upgrade the SCSS for a Foundation 6.3 site into a 6.7 version.

How to upgrade dependencies in upsection repository?
----------------------------------------------------

For the Node dependencies, edit `components/package-template.json`.
Then run `make publish` to update the repository reference package.
That last step allows to expose dependencies to security trackers.

When a new Foundation version is released, changes to templates/assets/
are expected.

The following files can be normally copied as is
from the Foundation for sites repository:

  - scss/settings/_settings.scss -> assets/scss/_settings.scss
  - js/entries/foundation.js -> assets/js/lib/foundation-explicit-pieces.js

Check also `assets/scss/app.css` if a component is added or removed
(e.g. foundation-slider).
