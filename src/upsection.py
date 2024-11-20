#!/usr/bin/env python3

import json
import os
import sys
import yaml


#   -------------------------------------------------------------
#   Available builders configuration
#   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


DEFAULT_PACKAGE_TEMPLATE_PATH = "/usr/local/share/upsection/package-template.json"


def get_package_template_path():
    try:
        return os.environ["PACKAGE_TEMPLATE"]
    except KeyError:
        return DEFAULT_PACKAGE_TEMPLATE_PATH


def get_builders():
    return {
        ".browserslistrc": build_browserslistrc,
        "package.json": build_package,
    }


#   -------------------------------------------------------------
#   Build package.json
#   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


def build_package():
    with open(get_package_template_path()) as fd:
        package_template = json.load(fd)

    package = {
        **package_template,
        **get_package_config(),
    }

    return json.dumps(package, sort_keys=False, indent=4) + "\n"


def get_package_config():
    package_metadata = app["config"]["package"]

    repository = get_repository(package_metadata["repository_name"])
    del package_metadata["repository_name"]

    return {
        **package_metadata,
        "repository": repository,
    }


#   -------------------------------------------------------------
#   Build .browserslistrc
#   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


def build_browserslistrc():
    return "# Browsers that we support\n" + get_browsers_list() + "\n"


def get_browsers_list():
    return "\n".join(app["config"]["tasks"]["autoprefixer"]["browsers"])


def get_repository(name):
    return {
        "type": "git",
        "url": "https://devcentral.nasqueron.org/source/" + name + ".git",
    }


#   -------------------------------------------------------------
#   Application entry point
#   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


def initialize_app():
    try:
        with open("config.yml") as fd:
            config = yaml.safe_load(fd)
    except FileNotFoundError as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        print(
            "Please consult the documentation : https://agora.nasqueron.org/Upsection"
        )
        sys.exit(1)

    return {
        "config": config,
        "builders": get_builders(),
    }


def run(args):
    if len(args) == 1:
        build_all()
        return

    build_some(args[1:])


def build_all():
    for file_to_build, builder in app["builders"].items():
        with open(file_to_build, "w") as fd:
            fd.write(builder())


def build_some(files_to_build):
    for file_to_build in files_to_build:
        build(file_to_build)


def build(file_to_build):
    try:
        content = app["builders"][file_to_build]()
    except KeyError:
        print("Don't know how to generate", file_to_build, file=sys.stderr)
        return

    with open(file_to_build, "w") as fd:
        fd.write(content)


if __name__ == "__main__":
    app = initialize_app()
    run(sys.argv)
