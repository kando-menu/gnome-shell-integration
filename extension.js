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

  constructor(metadata) {
    super(metadata);

    // This set contains all currently bound shortcuts. We will use it to re-bind all
    // shortcuts when the extension is re-enabled.
    this._currentShortcuts = new Set();
  }

  // Exports the DBus interface.
  enable() {
    this._dbus = Gio.DBusExportedObject.wrapJSObject(DBUS_INTERFACE, this);
    this._dbus.export(Gio.DBus.session, '/org/gnome/shell/extensions/KandoIntegration');

    this._shortcuts        = new Shortcuts();
    this._inputManipulator = new InputManipulator();

    this._shortcuts.connect('activated', (s, shortcut) => {
      this._dbus.emit_signal('ShortcutPressed', new GLib.Variant('(s)', [shortcut]));
    });

    this._currentShortcuts.forEach((shortcut) => {
      this.BindShortcut(shortcut);
    });
  }

  // Unbinds all shortcuts and unexports the DBus interface.
  disable() {
    this._dbus.flush();
    this._dbus.unexport();
    this._dbus = null;

    this.UnbindAllShortcuts();

    this._shortcuts.destroy();
    this._shortcuts = null;

    this._inputManipulator = null;
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

    const [x, y] = global.get_pointer();

    return [windowName, windowClass, x, y];
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
      this._currentShortcuts.add(shortcut);
    }

    return success;
  }

  // Unbinds a previously bound shortcut.
  UnbindShortcut(shortcut) {
    const success = this._shortcuts.unbind(shortcut);

    if (success) {
      this._currentShortcuts.delete(shortcut);
    }

    return success;
  }

  // Unbinds all previously bound shortcuts.
  UnbindAllShortcuts() {
    return this._shortcuts.unbindAll();
  }
}
