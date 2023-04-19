//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
//     |  /  __|   \ |       _ \   _ \     This file belongs to Ken-Do, the truly       //
//     . <   _|   .  | ____| |  | (   |    amazing cross-platform marking menu.         //
//    _|\_\ ___| _|\_|      ___/ \___/     Read more on github.com/ken-do-menu/ken-do   //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////

// SPDX-FileCopyrightText: 2023 Simon Schneegans <code@simonschneegans.de>
// SPDX-License-Identifier: MIT

const Gio = imports.gi.Gio;

const DBUS_INTERFACE = `
<node>
  <interface name="org.gnome.Shell.Extensions.KenDoIntegration">
    <method name="GetFocusedWindow">
      <arg type="s" direction="out" name="title" />
      <arg type="s" direction="out" name="class" />
    </method>
    <method name="GetPointer">
      <arg type="i" direction="out" name="x" />
      <arg type="i" direction="out" name="y" />
      <arg type="i" direction="out" name="mods" />
    </method>
  </interface>
</node>`;

class Extension {

  enable() {
    this._dbus = Gio.DBusExportedObject.wrapJSObject(DBUS_INTERFACE, this);
    this._dbus.export(Gio.DBus.session, '/org/gnome/shell/extensions/KenDoIntegration');
  }

  disable() {
    this._dbus.flush();
    this._dbus.unexport();
  }

  GetFocusedWindow() {
    for (let actor of global.get_window_actors()) {
      if (actor.meta_window.has_focus()) {
        return [actor.meta_window.get_title(), actor.meta_window.get_wm_class()];
      }
    }

    return ['', ''];
  }

  GetPointer() {
    return global.get_pointer();
  }
}

function init() {
  return new Extension();
}
