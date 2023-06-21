//////////////////////////////////////////////////////////////////////////////////////////
//   _  _ ____ _  _ ___  ____                                                           //
//   |_/  |__| |\ | |  \ |  |    This file belongs to Kando, the cross-platform         //
//   | \_ |  | | \| |__/ |__|    pie menu. Read more on github.com/kando-menu/kando     //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////

// SPDX-FileCopyrightText: Simon Schneegans <code@simonschneegans.de>
// SPDX-License-Identifier: MIT

'use strict';

const {Clutter, Gtk} = imports.gi;

//////////////////////////////////////////////////////////////////////////////////////////
// An instance of this class can be used to create faked input events. You can use it   //
// to move the mouse pointer or to press accelerator key strokes.                       //
//////////////////////////////////////////////////////////////////////////////////////////

var InputManipulator = class InputManipulator {

  // ------------------------------------------------------------ constructor / destructor

  constructor() {

    // get_default_seat() is available since GNOME Shell 3.36.
    if (Clutter.get_default_backend().get_default_seat) {
      const dev      = Clutter.get_default_backend().get_default_seat();
      this._mouse    = dev.create_virtual_device(Clutter.InputDeviceType.POINTER_DEVICE);
      this._keyboard = dev.create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
    } else {
      const dev      = Clutter.DeviceManager.get_default();
      this._mouse    = dev.create_virtual_device(Clutter.InputDeviceType.POINTER_DEVICE);
      this._keyboard = dev.create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
    }
  }

  // -------------------------------------------------------------------- public interface

  // Warps the mouse pointer by the given distance.
  movePointer(dx, dy) {
    this._mouse.notify_relative_motion(0, dx, dy);
  }

  // Simulates the given key strokes. The keys argument is an array of arrays. Each
  // sub-array contains three elements: The keysym, a boolean indicating whether the key
  // should be pressed or released and an optional delay in milliseconds.
  async simulateKeys(keys) {
    for (const key of keys) {
      const [keycode, down, delay] = key;

      // Wait a couple of milliseconds if the key a delay is specified.
      if (delay > 0) {
        await new Promise(resolve => {
          setTimeout(resolve, delay);
        });
      }

      // https://gitlab.gnome.org/GNOME/mutter/-/blob/main/src/backends/native/meta-xkb-utils.c#L61
      // https://gitlab.gnome.org/GNOME/mutter/-/blob/main/src/backends/native/meta-xkb-utils.c#L123
      this._keyboard.notify_key(
        0, keycode - 8, down ? Clutter.KeyState.PRESSED : Clutter.KeyState.RELEASED);
    }
  }

  // ----------------------------------------------------------------------- private stuff

  // Helper method which 'releases' the desired modifier keys.
  _releaseModifiers(modifiers) {

    // Since we do not know whether left or right version of each key is pressed, we
    // release both...
    if (modifiers & Clutter.ModifierType.CONTROL_MASK) {
      this._keyboard.notify_keyval(0, Clutter.KEY_Control_L, Clutter.KeyState.RELEASED);
      this._keyboard.notify_keyval(0, Clutter.KEY_Control_R, Clutter.KeyState.RELEASED);
    }

    if (modifiers & Clutter.ModifierType.SHIFT_MASK) {
      this._keyboard.notify_keyval(0, Clutter.KEY_Shift_L, Clutter.KeyState.RELEASED);
      this._keyboard.notify_keyval(0, Clutter.KEY_Shift_R, Clutter.KeyState.RELEASED);
    }

    if (modifiers & Clutter.ModifierType.MOD1_MASK) {
      this._keyboard.notify_keyval(0, Clutter.KEY_Alt_L, Clutter.KeyState.RELEASED);
      this._keyboard.notify_keyval(0, Clutter.KEY_Alt_R, Clutter.KeyState.RELEASED);
    }

    if ((modifiers & Clutter.ModifierType.MOD4_MASK) ||
        (modifiers & Clutter.ModifierType.SUPER_MASK)) {
      this._keyboard.notify_keyval(0, Clutter.KEY_Super_L, Clutter.KeyState.RELEASED);
      this._keyboard.notify_keyval(0, Clutter.KEY_Super_R, Clutter.KeyState.RELEASED);
    }
  }

  // Helper method which 'presses' the desired modifier keys.
  _pressModifiers(modifiers) {
    if (modifiers & Clutter.ModifierType.CONTROL_MASK) {
      this._keyboard.notify_keyval(0, Clutter.KEY_Control_L, Clutter.KeyState.PRESSED);
    }

    if (modifiers & Clutter.ModifierType.SHIFT_MASK) {
      this._keyboard.notify_keyval(0, Clutter.KEY_Shift_L, Clutter.KeyState.PRESSED);
    }

    if (modifiers & Clutter.ModifierType.MOD1_MASK) {
      this._keyboard.notify_keyval(0, Clutter.KEY_Alt_L, Clutter.KeyState.PRESSED);
    }

    if ((modifiers & Clutter.ModifierType.MOD4_MASK) ||
        (modifiers & Clutter.ModifierType.SUPER_MASK)) {
      this._keyboard.notify_keyval(0, Clutter.KEY_Super_L, Clutter.KeyState.PRESSED);
    }
  }
};
