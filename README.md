<!--
SPDX-FileCopyrightText: Simon Schneegans <code@simonschneegans.de>
SPDX-License-Identifier: CC-BY-4.0
-->

# GNOME Shell Integration for Kando

> [!IMPORTANT]
> The code in the `main` branch is for GNOME Shell 45+. For older GNOME versions, please use the `gnome-40-44` branch.

This GNOME Shell extension is required for [🥧 Kando](https://github.com/kando-menu/kando) on GNOME under Wayland.
Via a D-Bus interface, it provides the name of the currently focused window, and the current mouse pointer position.
Furthermore, it allows registering and simulating keyboard shortcuts.

## ⬇️ Installation

### From the GNOME Extensions Website

Just head over to [extensions.gnome.org](https://extensions.gnome.org/extension/7068/kando-integration/) and flip the switch to install the extension!

### From Source Code

To install the extension directly from the `main` branch on GitHub, clone this repository and run `make install`:

```bash
git clone https://github.com/kando-menu/gnome-shell-integration.git
cd gnome-shell-integration
make install
```

Afterwards, restart GNOME Shell by logging out and back in.
Finally, enable the extension:

```bash
gnome-extensions enable kando-integration@kando-menu.github.io
```

## 🗒️ Changelog

We do not maintain a separate changelog for this repository.
Changes are documented alongside other changes in Kando's [changelog](https://github.com/kando-menu/kando/blob/main/docs/changelog.md).
