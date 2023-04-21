//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
//     |  /  __|   \ |       _ \   _ \     This file belongs to Ken-Do, the truly       //
//     . <   _|   .  | ____| |  | (   |    amazing cross-platform marking menu.         //
//    _|\_\ ___| _|\_|      ___/ \___/     Read more on github.com/ken-do-menu/ken-do   //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////

// SPDX-FileCopyrightText: 2023 Simon Schneegans <code@simonschneegans.de>
// SPDX-License-Identifier: MIT

'use strict';

const {Gio, GLib} = imports.gi;

const Me        = imports.misc.extensionUtils.getCurrentExtension();
const Shortcuts = Me.imports.src.Shortcuts.Shortcuts;

const DBUS_INTERFACE = `
<node>
  <interface name="org.gnome.Shell.Extensions.KenDoIntegration">
    <method name="GetFocusedWindow">
      <arg name="title" type="s" direction="out" />
      <arg name="class" type="s" direction="out" />
    </method>
    <method name="GetPointer">
      <arg name="x"    type="i" direction="out" />
      <arg name="y"    type="i" direction="out" />
      <arg name="mods" type="i" direction="out" />
    </method>
    <method name="BindShortcut">
      <arg name="shortcut" type="s" direction="in" />
      <arg name="success"  type="b" direction="out" />
    </method>
    <method name="UnbindShortcut">
      <arg name="shortcut" type="s" direction="in" />
      <arg name="success"  type="b" direction="out" />
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
    this._dbus.export(Gio.DBus.session, '/org/gnome/shell/extensions/KenDoIntegration');

    this._shortcuts = new Shortcuts();

    this._shortcuts.connect('activated', (s, shortcut) => {
      this._dbus.emit_signal('ShortcutPressed', new GLib.Variant('(s)', [shortcut]));
    });
  }

  // Unbinds all shortcuts and unexports the DBus interface.
  disable() {
    this._dbus.flush();
    this._dbus.unexport();
    this._dbus = null;

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

  // Binds the given shortcut. When it's pressed, the "ShortcutPressed" signal will be
  // emitted.
  BindShortcut(shortcut) {
    return this._shortcuts.bind(shortcut);
  }

  // Unbinds a previously bound shortcut.
  UnbindShortcut(shortcut) {
    return this._shortcuts.unbind(shortcut);
  }
}

function init() {
  return new Extension();
}
