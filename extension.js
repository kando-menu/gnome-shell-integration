//////////////////////////////////////////////////////////////////////////////////////////
//   _  _ ____ _  _ ___  ____                                                           //
//   |_/  |__| |\ | |  \ |  |    This file belongs to Kando, the cross-platform         //
//   | \_ |  | | \| |__/ |__|    pie menu. Read more on github.com/kando-menu/kando     //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////

// SPDX-FileCopyrightText: Simon Schneegans <code@simonschneegans.de>
// SPDX-License-Identifier: MIT

'use strict';

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Clutter from 'gi://Clutter';

import * as utils from './src/utils.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import {Shortcuts} from './src/Shortcuts.js';
import {InputManipulator} from './src/InputManipulator.js';

// This is the DBus interface which will be exported by this extension. It provides
// methods to get information about the currently focused window and the mouse pointer
// position. It also allows to move the mouse pointer, simulate key strokes and bind
// shortcuts.
const DBUS_INTERFACE = `
<node>
  <interface name="org.gnome.Shell.Extensions.KandoIntegration">
    <method name="GetWMInfo">
      <arg name="windowTitle" type="s" direction="out" />
      <arg name="windowClass" type="s" direction="out" />
      <arg name="pointerX"    type="i" direction="out" />
      <arg name="pointerY"    type="i" direction="out" />
    </method>
    <method name="MovePointer">
      <arg name="dx"   type="i" direction="in" />
      <arg name="dy"   type="i" direction="in" />
    </method>
    <method name="SimulateKeys">
      <arg name="keys" type="a(ibi)" direction="in" />
    </method>
    <method name="BindShortcut">
      <arg name="shortcut" type="s" direction="in" />
      <arg name="success"  type="b" direction="out" />
    </method>
    <method name="UnbindShortcut">
      <arg name="shortcut" type="s" direction="in" />
      <arg name="success"  type="b" direction="out" />
    </method>
    <method name="UnbindAllShortcuts">
    </method>
    <signal name="ShortcutPressed">
      <arg name="shortcut" type="s"/>
    </signal>
  </interface>
</node>`;

export default class KandoIntegration extends Extension {

  // Exports the DBus interface.
  enable() {

    // Do nothing on X11.
    if (!Meta.is_wayland_compositor()) {
      return;
    }

    // This is used to get the desktop's text scaling factor.
    this._shellSettings = new Gio.Settings({schema: 'org.gnome.desktop.interface'});

    this._dbus = Gio.DBusExportedObject.wrapJSObject(DBUS_INTERFACE, this);
    this._dbus.export(Gio.DBus.session, '/org/gnome/shell/extensions/KandoIntegration');

    this._shortcuts        = new Shortcuts();
    this._inputManipulator = new InputManipulator();

    this._shortcuts.connect('activated', (s, shortcut) => {
      this._dbus.emit_signal('ShortcutPressed', new GLib.Variant('(s)', [shortcut]));
    });

    // Re-bind all shortcuts that were bound before the extension was disabled.
    this._settings = this.getSettings();
    this._settings.get_strv('shortcuts').forEach((shortcut) => {
      this._shortcuts.bind(shortcut);
    });

    this._backend           = global.backend ? global.backend : Meta.get_backend();
    this._lastPointerDevice = null;

    this._deviceChangedID = this._backend.connect('last-device-changed', (b, device) => {
      // For now, we assume that tablets, pens and erasers create a secondary cursor.
      // Is this true? For all other pointer-input devices, we use the main mouse pointer
      // location.
      if (device.get_device_type() == Clutter.InputDeviceType.TABLET_DEVICE ||
          device.get_device_type() == Clutter.InputDeviceType.PEN_DEVICE ||
          device.get_device_type() == Clutter.InputDeviceType.ERASER_DEVICE) {

        this._lastPointerDevice = device;
      } else if (device.get_device_type() == Clutter.InputDeviceType.POINTER_DEVICE ||
                 device.get_device_type() == Clutter.InputDeviceType.TOUCHPAD_DEVICE ||
                 device.get_device_type() == Clutter.InputDeviceType.TOUCHSCREEN_DEVICE) {

        if (utils.shellVersionIsAtLeast(49, 'beta')) {
          const sprite = Clutter.get_default_backend().get_pointer_sprite(global.stage);
          this._lastPointerDevice = sprite.device;
        } else {
          const seat              = Clutter.get_default_backend().get_default_seat();
          this._lastPointerDevice = seat.get_pointer();
        }
      }
    });
  }

  // Unbinds all shortcuts and unexports the DBus interface.
  disable() {

    // Do nothing on X11.
    if (!Meta.is_wayland_compositor()) {
      return;
    }

    this._shellSettings = null;

    this._dbus.flush();
    this._dbus.unexport();
    this._dbus = null;

    this._shortcuts.destroy();
    this._shortcuts = null;

    this._settings = null;

    this._inputManipulator = null;

    this._backend.disconnect(this._deviceChangedID);
    this._backend = null;
  }

  // Returns the title and class of the currently focused window as well as the current
  // pointer position.
  GetWMInfo() {
    let windowName  = '';
    let windowClass = '';

    for (let actor of global.get_window_actors()) {
      if (actor.meta_window.has_focus()) {
        windowName  = actor.meta_window.get_title();
        windowClass = actor.meta_window.get_wm_class();

        break;
      }
    }

    let [x, y] = [0, 0];

    if (this._lastPointerDevice != null) {
      if (utils.shellVersionIsAtLeast(49, 1)) {
        // This will hopefully work in the final 49 release:
        // https://gitlab.gnome.org/GNOME/mutter/-/merge_requests/4668
        global.stage.foreach_sprite((stage, sprite) => {
          if (sprite.device == this._lastPointerDevice) {
            const coords = sprite.get_coords();
            [x, y]       = [coords.x, coords.y];
            return false;  // Stop iteration.
          }
        });
      } else if (utils.shellVersionIsAtLeast(49, 'beta')) {
        // Between 49 beta and 49.1, there was no way to query the position of a specific
        // input device. So we just return the main pointer position here.
        [x, y] = global.get_pointer();
      } else {
        // In GNOME Shell < 49 beta, we can query the position of the last pointer
        // device directly.
        const seat               = Clutter.get_default_backend().get_default_seat();
        const [ok, coords, mods] = seat.query_state(this._lastPointerDevice, null);
        [x, y]                   = [coords.x, coords.y];
      }
    } else {
      [x, y] = global.get_pointer();
    }

    const scalingFactor = this._shellSettings.get_double('text-scaling-factor');

    return [
      windowName, windowClass, Math.round(x / scalingFactor),
      Math.round(y / scalingFactor)
    ];
  }

  // Warps the mouse pointer by the given distance.
  MovePointer(dx, dy) {
    this._inputManipulator.movePointer(dx, dy);
  }

  // Simulates the given key strokes. The keys argument is an array of arrays. Each
  // sub-array contains three elements: The keysym, a boolean indicating whether the key
  // should be pressed or released and an optional delay in milliseconds.
  SimulateKeys(keys) {
    this._inputManipulator.simulateKeys(keys);
  }

  // Binds the given shortcut. When it's pressed, the "ShortcutPressed" signal will be
  // emitted.
  BindShortcut(shortcut) {
    const success = this._shortcuts.bind(shortcut);

    if (success) {
      const shortcuts = this._settings.get_strv('shortcuts');
      shortcuts.push(shortcut);
      this._settings.set_strv('shortcuts', shortcuts);
    }

    return success;
  }

  // Unbinds a previously bound shortcut.
  UnbindShortcut(shortcut) {
    const success = this._shortcuts.unbind(shortcut);

    if (success) {
      const shortcuts = this._settings.get_strv('shortcuts');
      this._settings.set_strv('shortcuts', shortcuts.filter((s) => s !== shortcut));
    }

    return success;
  }

  // Unbinds all previously bound shortcuts.
  UnbindAllShortcuts() {
    this._shortcuts.unbindAll();
    this._settings.set_strv('shortcuts', []);
  }
}
