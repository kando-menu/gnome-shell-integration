//////////////////////////////////////////////////////////////////////////////////////////
//   _  _ ____ _  _ ___  ____                                                           //
//   |_/  |__| |\ | |  \ |  |    This file belongs to Kando, the cross-platform         //
//   | \_ |  | | \| |__/ |__|    pie menu. Read more on github.com/kando-menu/kando     //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////

// SPDX-FileCopyrightText: 2023 Simon Schneegans <code@simonschneegans.de>
// SPDX-License-Identifier: MIT

'use strict';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import Shell from 'gi://Shell';
import Meta from 'gi://Meta';
import GObject from 'gi://GObject';

//////////////////////////////////////////////////////////////////////////////////////////
// This class can be used to bind a function to global hot keys. It's designed in the   //
// following way: An  arbitrary number of shortcuts can be registered. If one of the    //
// shortcuts is pressed, the "activated" signal will be executed. The pressed shortcut  //
// is passed as a parameter to the callback.                                            //
//////////////////////////////////////////////////////////////////////////////////////////

export var Shortcuts = GObject.registerClass(

  // Whenever one of the registered shortcuts is pressed, the "activated" callback
  // will be executed. The pressed shortcut is given as parameter.
  {Properties: {}, Signals: {'activated': {param_types: [GObject.TYPE_STRING]}}},

  class Shortcuts extends GObject.Object {
    _init() {
      super._init();

      // All registered callbacks are stored in this map.
      this._shortcuts = new Map();

      // Listen for global shortcut activations and execute the given callback if it's
      // one of ours.
      this._displayConnection =
        global.display.connect('accelerator-activated', (display, action) => {
          for (let it of this._shortcuts) {
            if (it[1].action == action) {
              this.emit('activated', it[0]);
            }
          }
        });
    }

    // Unbinds all registered shortcuts.
    destroy() {
      global.display.disconnect(this._displayConnection);
      global.stage.disconnect(this._stageConnection);

      for (let shortcut of this._shortcuts) {
        console.log('Unbinding shortcut: ' + shortcut.name);
        this.unbind(shortcut.name);
      }
    }

    // Binds the given shortcut. When it's pressed, the callback given to this class
    // instance at construction time will be executed.
    bind(shortcut) {

      const action = global.display.grab_accelerator(shortcut, Meta.KeyBindingFlags.NONE);

      if (action == Meta.KeyBindingAction.NONE) {
        return false;
      }

      const name = Meta.external_binding_name_for_action(action);
      Main.wm.allowKeybinding(name, Shell.ActionMode.NORMAL);

      this._shortcuts.set(shortcut, {name: name, action: action});

      return true;
    }

    // Un-binds any previously bound shortcut.
    unbind(shortcut) {
      const it = this._shortcuts.get(shortcut);

      if (it) {
        global.display.ungrab_accelerator(it.action);
        Main.wm.allowKeybinding(it.name, Shell.ActionMode.NONE);
        this._shortcuts.delete(shortcut);

        return true;
      }

      return false;
    }

    unbindAll() {
      for (let shortcut of this._shortcuts) {
        this.unbind(shortcut[0]);
      }
    }
  });
