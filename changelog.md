<!--
SPDX-FileCopyrightText: Simon Schneegans <code@simonschneegans.de>
SPDX-License-Identifier: CC-BY-4.0

Added      - for new features.
Changed    - for changes in existing functionality.
Deprecated - for soon-to-be removed features.
Removed    - for now removed features.
Fixed      - for any bug fixes.
Security   - in case of vulnerabilities.
-->

# Changelog of the GNOME Shell Extension for Kando

Kando uses [semantic versioning](https://semver.org).
This changelog follows the rules of [Keep a Changelog](http://keepachangelog.com/).

## [GNOME Shell Integration 0.11.0](https://github.com/kando-menu/gnome-shell-integration/releases/tag/v0.11.0)

**Release Date:** 2026-03-28

### :tada: Added

- This changelog. I originally thought that Kando and its extensions will always be updated together, but it turned out that the GNOME Shell extension is actually updated at different paces than Kando itself. So I decided to create a separate changelog for the extension, which will be updated with every release of the extension.

### :bug: Fixed

- The retrieved pointer position and work area if display scaling without fractional scaling is being used on Wayland.

## [GNOME Shell Integration 0.10.0](https://github.com/kando-menu/gnome-shell-integration/releases/tag/v0.10.0)

**Release Date:** 2026-03-08

### :tada: Added

- Support for GNOME 50.
- A feature which prevents window animations for Kando's menu. Else it would always slide in using GNOME's default animation, which is not what we want.

### :wrench: Changed

- The SimulateKeys is now asynchronous, which is required for the temporary unbinding of the shortcuts introduced in Kando 2.3.0.

## [GNOME Shell Integration 0.9.0](https://github.com/kando-menu/gnome-shell-integration/releases/tag/v0.9.0)

**Release Date:** 2025-11-23

### :tada: Added

- The possibility to retrieve the current monitor geometry, which will be required for Kando 2.1.1.

### :bug: Fixed

- Menus not opening at the pen on GNOME 49.1.

## [GNOME Shell Integration 0.8.0](https://github.com/kando-menu/gnome-shell-integration/releases/tag/v0.8.0)

**Release Date:** 2025-09-19

### :bug: Fixed

- Some regressions introduced with the final GNOME 49 release. Sadly, this involves removing support for multiple pointing devices on GNOME 49 Wayland. Hopefully this will be fixed in GNOME Shell 49.1.

## [GNOME Shell Integration 0.7.0](https://github.com/kando-menu/gnome-shell-integration/releases/tag/v0.7.0)

**Release Date:** 2025-08-15

### :tada: Added

- Support for GNOME 49.

## [GNOME Shell Integration 0.6.0](https://github.com/kando-menu/gnome-shell-integration/releases/tag/v0.6.0)

**Release Date:** 2025-05-25

### :tada: Added

- Support for multiple pointing devices, like for instance if you are using a drawing tablet and a mouse. The menu will show up at the location of the last used pointing device. Thanks to [@hhhhhhh2019](https://github.com/hhhhhhh2019) for this contribution!

## [GNOME Shell Integration 0.5.0](https://github.com/kando-menu/gnome-shell-integration/releases/tag/v0.5.0)

**Release Date:** 2025-02-17

### :tada: Added

- Support for GNOME 48.

### :wrench: Changed

- The text-scaling factor is now incorporated into the returned pointer position.
- The extension now does deliberately nothing on X11. It used to bind the configured shortcuts and thus made them unavailable for Kando to use on X11.

## [GNOME Shell Integration 0.4.0](https://github.com/kando-menu/gnome-shell-integration/releases/tag/v0.4.0)

**Release Date:** 2024-08-23

### :tada: Added

- Support for GNOME 47.
