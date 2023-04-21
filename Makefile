# SPDX-FileCopyrightText: Simon Schneegans <code@simonschneegans.de>
# SPDX-License-Identifier: MIT

SHELL := /bin/bash

# We define these here to make the makefile easier to port to another extension.
NAME     := ken-do-integration
DOMAIN   := ken-do-menu.github.io
ZIP_NAME := $(NAME)@$(DOMAIN).zip

# These files will be included in the extension zip file.
ZIP_CONTENT = extension.js metadata.json src/*.js

# These five recipes can be invoked by the user.
.PHONY: zip install uninstall clean

# The zip recipes only bundles the extension without installing it.
zip: $(ZIP_NAME)

# The install recipes creates the extension zip and installs it.
install: $(ZIP_NAME)
	gnome-extensions install "$(ZIP_NAME)" --force
	@echo "Extension installed successfully! Now restart the Shell ('Alt'+'F2', then 'r')."

# This uninstalls the previously installed extension.
uninstall:
	gnome-extensions uninstall "$(NAME)@$(DOMAIN)"

# This removes all temporary files created with the other recipes.
clean:
	rm $(ZIP_NAME)

# This bundles the extension and checks whether it is small enough to be uploaded to
# extensions.gnome.org. We do not use "gnome-extensions pack" for this, as this is not
# readily available on the GitHub runners.
$(ZIP_NAME): $(ZIP_CONTENT)
	@echo "Packing zip file..."
	@rm --force $(ZIP_NAME)
	@zip $(ZIP_NAME) -- $(ZIP_CONTENT)
