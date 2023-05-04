<!--
SPDX-FileCopyrightText: Simon Schneegans <code@simonschneegans.de>
SPDX-License-Identifier: CC-BY-4.0
-->

# GNOME Shell Integration for Ken-Do

This GNOME Shell extension is required for [🥧 Ken-Do](https://github.com/ken-do-menu/ken-do) on GNOME under Wayland.
Via a D-Bus interface, it provides the name of the currently focused window, and the current mouse pointer position.
Furthermore, it allows registering and simulating keyboard shortcuts.

## Installation

The extension is not yet available on extensions.gnome.org. To install it, clone this repository and run `make install`:

```bash
git clone https://github.com/ken-do-menu/gnome-shell-integration.git
cd gnome-shell-integration
make install
```

Afterwards, restart GNOME Shell by logging out and back in.
Finally, enable the extension:

```bash
gnome-extensions enable ken-do-integration@ken-do-menu.github.io
```
