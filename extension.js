//////////////////////////////////////////////////////////////////////////////////////////
//   _  _ ____ _  _ ___  ____                                                           //
//   |_/  |__| |\ | |  \ |  |    This file belongs to Kando, the cross-platform         //
//   | \_ |  | | \| |__/ |__|    pie menu. Read more on github.com/kando-menu/kando     //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////

// SPDX-FileCopyrightText: 2023 Simon Schneegans <code@simonschneegans.de>
// SPDX-License-Identifier: MIT

'use strict';

const {Gio, GLib} = imports.gi;

const Me               = imports.misc.extensionUtils.getCurrentExtension();
const Shortcuts        = Me.imports.src.Shortcuts.Shortcuts;
const InputManipulator = Me.imports.src.InputManipulator.InputManipulator;

const DBUS_INTERFACE = `
<node>
  <interface name="org.gnome.Shell.Extensions.KandoIntegration">
    <method name="GetFocusedWindow">
      <arg name="title" type="s" direction="out" />
      <arg name="class" type="s" direction="out" />
    </method>
    <method name="GetPointer">
      <arg name="x"    type="i" direction="out" />
      <arg name="y"    type="i" direction="out" />
      <arg name="mods" type="i" direction="out" />
    </method>
    <method name="MovePointer">
      <arg name="x"    type="i" direction="in" />
      <arg name="y"    type="i" direction="in" />
    </method>
    <method name="SimulateShortcut">
      <arg name="shortcut" type="s" direction="in" />
      <arg name="success"  type="b" direction="out" />
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

class Extension {

  // Exports the DBus interface.
  enable() {
    this._dbus = Gio.DBusExportedObject.wrapJSObject(DBUS_INTERFACE, this);
    this._dbus.export(Gio.DBus.session, '/org/gnome/shell/extensions/KandoIntegration');

    this._shortcuts        = new Shortcuts();
    this._inputManipulator = new InputManipulator();

    this._shortcuts.connect('activated', (s, shortcut) => {
      this._dbus.emit_signal('ShortcutPressed', new GLib.Variant('(s)', [shortcut]));
    });
  }

  // Unbinds all shortcuts and unexports the DBus interface.
  disable() {
    this._dbus.flush();
    this._dbus.unexport();
    this._dbus = null;

    this.UnbindAllShortcuts();

    this._shortcuts.destroy();
  }

  // Returns the title and class of the currently focused window.
  GetFocusedWindow() {
    for (let actor of global.get_window_actors()) {
      if (actor.meta_window.has_focus()) {
        return [actor.meta_window.get_title(), actor.meta_window.get_wm_class()];
      }
    }

    return ['', ''];
  }

  // Returns the current pointer position and the currently pressed modifiers.
  GetPointer() {
    return global.get_pointer();
  }

  // Moves the pointer to the given position.
  MovePointer(x, y) {
    return this._inputManipulator.movePointer(x, y);
  }

  // Simulates the given shortcut.
  SimulateShortcut(shortcut) {
    return this._inputManipulator.activateAccelerator(shortcut);
  }

  // Binds the given shortcut. When it's pressed, the "ShortcutPressed" signal will be
  // emitted.
  BindShortcut(shortcut) {
    return this._shortcuts.bind(shortcut);
  }

  // Unbinds a previously bound shortcut.
  UnbindShortcut(shortcut) {
    return this._shortcuts.unbind(shortcut);
  }

  // Unbinds all previously bound shortcuts.
  UnbindAllShortcuts() {
    return this._shortcuts.unbindAll();
  }
}

function init() {
  return new Extension();
}
