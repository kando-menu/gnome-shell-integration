//////////////////////////////////////////////////////////////////////////////////////////
//   _  _ ____ _  _ ___  ____                                                           //
//   |_/  |__| |\ | |  \ |  |    This file belongs to Kando, the cross-platform         //
//   | \_ |  | | \| |__/ |__|    pie menu. Read more on github.com/kando-menu/kando     //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////

// SPDX-FileCopyrightText: Simon Schneegans <code@simonschneegans.de>
// SPDX-License-Identifier: MIT

'use strict';

// We import the Config module. This is done differently in the GNOME Shell process and in
// the preferences process.
const Config = await importConfig();

//////////////////////////////////////////////////////////////////////////////////////////
// Two methods for checking the current version of GNOME Shell.                         //
//////////////////////////////////////////////////////////////////////////////////////////

// Returns the given argument, except for "alpha", "beta", and "rc". In these cases -3,
// -2, and -1 are returned respectively.
function toNumericVersion(x) {
  switch (x) {
    case 'alpha':
      return -3;
    case 'beta':
      return -2;
    case 'rc':
      return -1;
  }
  return x;
}

const [GS_MAJOR, GS_MINOR] = Config.PACKAGE_VERSION.split('.').map(toNumericVersion);

// This method returns true if the current GNOME Shell version matches the given
// arguments.
export function shellVersionIs(major, minor) {
  return GS_MAJOR == major && GS_MINOR == toNumericVersion(minor);
}

// This method returns true if the current GNOME Shell version is at least as high as the
// given arguments. Supports "alpha" and "beta" for the minor version number.
export function shellVersionIsAtLeast(major, minor = 0) {
  if (GS_MAJOR > major) {
    return true;
  }

  if (GS_MAJOR == major) {
    return GS_MINOR >= toNumericVersion(minor);
  }

  return false;
}

//////////////////////////////////////////////////////////////////////////////////////////
// This method can be used to import the Config module.                                 //
//////////////////////////////////////////////////////////////////////////////////////////

export async function importConfig() {
  if (typeof global === 'undefined') {
    return (await import('resource:///org/gnome/Shell/Extensions/js/misc/config.js'));
  }
  return (await import('resource:///org/gnome/shell/misc/config.js'));
}
