//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
//     |  /  __|   \ |       _ \   _ \     This file belongs to Ken-Do, the truly       //
//     . <   _|   .  | ____| |  | (   |    amazing cross-platform marking menu.         //
//    _|\_\ ___| _|\_|      ___/ \___/     Read more on github.com/ken-do-menu/ken-do   //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////

// SPDX-License-Identifier: GPL-2.0-or-later
// SPDX-FileCopyrightText: 2023 Simon Schneegans <code@simonschneegans.de>
// SPDX-FileCopyrightText: 2022 Hendrik G. Seliger <github@hseliger.eu>

// This is based on https://github.com/hseliger/window-calls-extended which
// itself is based on the initial version by ickyicky
// (https://github.com/ickyicky), extended by a few methods to provide the
// focused window's title, window class, and pid.

const {Gio} = imports.gi;

const MR_DBUS_IFACE = `
<node>
    <interface name="org.gnome.Shell.Extensions.KenDoIntegration">
        <method name="List">
            <arg type="s" direction="out" name="win"/>
        </method>
        <method name="FocusTitle">
            <arg type="s" direction="out" />
        </method>
        <method name="FocusPID">
            <arg type="s" direction="out" />
        </method>
        <method name="FocusClass">
            <arg type="s" direction="out" />
        </method>
    </interface>
</node>`;

class Extension {
  enable() {
    this._dbus = Gio.DBusExportedObject.wrapJSObject(MR_DBUS_IFACE, this);
    this._dbus.export(Gio.DBus.session, '/org/gnome/Shell/Extensions/KenDoIntegration');
  }

  disable() {
    this._dbus.flush();
    this._dbus.unexport();
    delete this._dbus;
  }
  List() {
    let win =
      global.get_window_actors().map(a => a.meta_window).map(w => ({
                                                               class: w.get_wm_class(),
                                                               pid: w.get_pid(),
                                                               id: w.get_id(),
                                                               maximized:
                                                                 w.get_maximized(),
                                                               focus: w.has_focus(),
                                                               title: w.get_title()
                                                             }));
    return JSON.stringify(win);
  }
  FocusTitle() {
    let win = global.get_window_actors()
                .map(a => a.meta_window)
                .map(w => ({focus: w.has_focus(), title: w.get_title()}));
    for (let [_ignore, aWindow] of win.entries()) {
      let [focus, theTitle] = Object.entries(aWindow);
      if (focus[1] == true) return theTitle[1];
    }
    return '';
  }
  FocusPID() {
    let win = global.get_window_actors()
                .map(a => a.meta_window)
                .map(w => ({focus: w.has_focus(), pid: w.get_pid()}));
    for (let [_ignore, aWindow] of win.entries()) {
      let [focus, thePID] = Object.entries(aWindow);
      if (focus[1] == true) return '' + thePID[1];  // Turn number into string
    }
    return '';
  }
  FocusClass() {
    let win = global.get_window_actors()
                .map(a => a.meta_window)
                .map(w => ({focus: w.has_focus(), class: w.get_wm_class()}));
    for (let [_ignore, aWindow] of win.entries()) {
      let [focus, theClass] = Object.entries(aWindow);
      if (focus[1] == true) return theClass[1];
    }
    return '';
  }
}

function init() {
  return new Extension();
}
