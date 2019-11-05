//=============================================================================
// Yanfly Engine Plugins - Key Name Entry
// YEP_KeyNameEntry.js
//=============================================================================

var Imported = Imported || {};
Imported.YEP_KeyNameEntry = true;

var Yanfly = Yanfly || {};
Yanfly.KeyNameEntry = Yanfly.KeyNameEntry || {};
Yanfly.KeyNameEntry.version = 1.00;

//=============================================================================
 /*:
 * @plugindesc v1.00 Allows the Name Input Processing event to function
 * with the keyboard keys to enter in letters and numbers.
 * @author Yanfly Engine Plugins
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * Pressing characters one by one for Name Input can be slow and tedious. This
 * plugin allows you to use the keyboard to perform name entry on the Name Input
 * Processing Event. There, players will have full range of their keyboard to
 * enter in character names. If they prefer the manual input, they can click
 * the mouse or press arrow keys on the keyboard to immediately switch the name
 * entry to manual letter entry as well.
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.00:
 * - Finished Plugin!
 *
 * ============================================================================
 * End of Helpfile
 * ============================================================================
 *
 * @param KeyboardMsg
 * @text Keyboard Message
 * @type note
 * @desc The message displayed when allowing keyboard entry.
 * You may use text codes here.
 * @default "Type in this character's name.\nPress \\c[6]ENTER\\c[0] when you're done.\n\n-or-\n\nPress the \\c[6]arrow keys\\c[0] to switch\nto manual character entry.\nPress \\c[6]ESC\\c[0] to use to keyboard."
 *
 * @param QWERTY Layout
 * @type boolean
 * @on YES
 * @off NO
 * @desc Set the visible on-screen keyboard to the QWERTY layout?
 * @default true
 *
 */
//=============================================================================

//=============================================================================
// Parameter Variables
//=============================================================================

Yanfly.Parameters = PluginManager.parameters('YEP_KeyNameEntry');
Yanfly.Param = Yanfly.Param || {};

Yanfly.Param.KNEMsg = JSON.parse(Yanfly.Parameters['KeyboardMsg']).split('\n');
Yanfly.Param.KNEQwerty = eval(Yanfly.Parameters['QWERTY Layout']);

if (Yanfly.Param.KNEQwerty) {
  Window_NameInput.LATIN1 =
   ['Q','W','E','R','T',  'Y','U','I','O','P',
    'A','S','D','F','G',  'H','J','K','L',"'",
    '`','Z','X','C','V',  'B','N','M',',','.',
    'q','w','e','r','t',  'y','u','i','o','p',
    'a','s','d','f','g',  'h','j','k','l',':',
    '~','z','x','c','v',  'b','n','m','"',';',
    '1','2','3','4','5',  '6','7','8','9','0',
    '!','@','#','$','%',  '^','&','*','(',')',
    '<','>','[',']','-',  '_','/',' ','Page','OK'];
};

//===========================================================================
// Input
//===========================================================================

Yanfly.KeyNameEntry.Input_clear = Input.clear;
Input.clear = function() {
  Yanfly.KeyNameEntry.Input_clear.call(this);
  this._inputString = undefined;
  this._inputSpecialKeyCode = undefined;
};

Yanfly.KeyNameEntry.Input_setupEventHandlers = Input._setupEventHandlers;
Input._setupEventHandlers = function() {
  Yanfly.KeyNameEntry.Input_setupEventHandlers.call(this);
  document.addEventListener('keypress', this._onKeyPress.bind(this));
};

Yanfly.KeyNameEntry.Input_onKeyDown = Input._onKeyDown;
Input._onKeyDown = function(event) {
  this._inputSpecialKeyCode = event.keyCode;
  Yanfly.KeyNameEntry.Input_onKeyDown.call(this, event);
};

Input._onKeyPress = function(event) {
  this._registerKeyInput(event);
};

Input._registerKeyInput = function(event) {
  this._inputSpecialKeyCode = event.keyCode;
  var character = String.fromCharCode(event.charCode);
  if (this._inputString === undefined) {
    this._inputString = character;
  } else {
    this._inputString += character;
  }
};

Yanfly.KeyNameEntry.Input_shouldPreventDefault = Input._shouldPreventDefault;
Input._shouldPreventDefault = function(keyCode) {
  if (keyCode === 8) return false;
  return Yanfly.KeyNameEntry.Input_shouldPreventDefault.call(this, keyCode);
};

Input.isSpecialCode = function(key) {
  if (key.match(/backspace/i)) return this._inputSpecialKeyCode === 8;
  if (key.match(/enter/i)) return this._inputSpecialKeyCode === 13;
  if (key.match(/escape/i)) return this._inputSpecialKeyCode === 27;
};

Input.isNumpadPressed = function() {
  return [48, 49, 50, 51, 52, 
          53, 54, 55, 56, 57].contains(this._inputSpecialKeyCode);
};

Input.isArrowPressed = function() {
  return [37, 38, 39, 40].contains(this._inputSpecialKeyCode);
};

//===========================================================================
// Window_NameInput
//===========================================================================

Yanfly.KeyNameEntry.Window_NameInput_initialize =
  Window_NameInput.prototype.initialize;
Window_NameInput.prototype.initialize = function(editWindow) {
  this._mode = 'keyboard';
  Yanfly.KeyNameEntry.Window_NameInput_initialize.call(this, editWindow);
  Input.clear();
  this.select(-1);
};

Yanfly.KeyNameEntry.Window_NameInput_processHandling =
  Window_NameInput.prototype.processHandling;
Window_NameInput.prototype.processHandling = function() {
  if (!this.isOpen()) return;
  if (!this.active) return;
  if (Input.isSpecialCode('backspace')) {
    Input.clear();
    this.processBack();
  } else if (this._mode === 'keyboard') {
    this.processKeyboardHandling();
  } else if (Input.isSpecialCode('escape')) {
    Input.clear();
    this.switchModes('keyboard');
  } else {
    Yanfly.KeyNameEntry.Window_NameInput_processHandling.call(this);
  }
};

Yanfly.KeyNameEntry.Window_NameInput_processTouch = Window_NameInput.prototype.processTouch;
Window_NameInput.prototype.processTouch = function() {
  if (!this.isOpenAndActive()) return;
  if (this._mode === 'keyboard') {
    if (TouchInput.isTriggered() && this.isTouchedInsideFrame()) {
      this.switchModes('default');
    } else if (TouchInput.isCancelled()) {
      this.switchModes('default');
    }
  } else {
    Yanfly.KeyNameEntry.Window_NameInput_processTouch.call(this);
  }
};

Window_NameInput.prototype.processKeyboardHandling = function() {
  if (Input.isSpecialCode('enter')) {
    this.onNameOk();
  } else if (Input._inputString !== undefined) {
    var text = Input._inputString;
    var length = text.length;
    for (var i = 0; i < length; ++i) {
      if (this._editWindow.add(text[i])) {
        SoundManager.playOk();
      } else {
        SoundManager.playBuzzer();
      }
    }
    Input.clear();
  }
};

Window_NameInput.prototype.switchModes = function(mode) {
  var prevMode = this._mode;
  this._mode = mode;
  if (prevMode !== this._mode) {
      this.refresh();
      SoundManager.playOk();
      if (this._mode === 'default') {
        this.select(0);
      } else {
        this.select(-1);
      }
  }
};

Yanfly.KeyNameEntry.Window_NameInput_cursorDown =
  Window_NameInput.prototype.cursorDown;
Window_NameInput.prototype.cursorDown = function(wrap) {
  if (this._mode === 'keyboard' && !Input.isArrowPressed()) return;
  if (Input.isNumpadPressed()) return;
  Yanfly.KeyNameEntry.Window_NameInput_cursorDown.call(this, wrap);
  this.switchModes('default');
};

Yanfly.KeyNameEntry.Window_NameInput_cursorUp =
  Window_NameInput.prototype.cursorUp;
Window_NameInput.prototype.cursorUp = function(wrap) {
  if (this._mode === 'keyboard' && !Input.isArrowPressed()) return;
  if (Input.isNumpadPressed()) return;
  Yanfly.KeyNameEntry.Window_NameInput_cursorUp.call(this, wrap);
  this.switchModes('default');
};

Yanfly.KeyNameEntry.Window_NameInput_cursorRight =
  Window_NameInput.prototype.cursorRight;
Window_NameInput.prototype.cursorRight = function(wrap) {
  if (this._mode === 'keyboard' && !Input.isArrowPressed()) return;
  if (Input.isNumpadPressed()) return;
  Yanfly.KeyNameEntry.Window_NameInput_cursorRight.call(this, wrap);
  this.switchModes('default');
};

Yanfly.KeyNameEntry.Window_NameInput_cursorLeft =
  Window_NameInput.prototype.cursorLeft;
Window_NameInput.prototype.cursorLeft = function(wrap) {
  if (this._mode === 'keyboard' && !Input.isArrowPressed()) return;
  if (Input.isNumpadPressed()) return;
  Yanfly.KeyNameEntry.Window_NameInput_cursorLeft.call(this, wrap);
  this.switchModes('default');
};

Yanfly.KeyNameEntry.Window_NameInput_cursorPagedown =
  Window_NameInput.prototype.cursorPagedown;
Window_NameInput.prototype.cursorPagedown = function() {
  if (this._mode === 'keyboard') return;
  if (Input.isNumpadPressed()) return;
  Yanfly.KeyNameEntry.Window_NameInput_cursorPagedown.call(this);
  this.switchModes('default');
};

Yanfly.KeyNameEntry.Window_NameInput_cursorPageup =
  Window_NameInput.prototype.cursorPageup;
Window_NameInput.prototype.cursorPageup = function() {
  if (this._mode === 'keyboard') return;
  if (Input.isNumpadPressed()) return;
  Yanfly.KeyNameEntry.Window_NameInput_cursorPageup.call(this);
  this.switchModes('default');
};

Yanfly.KeyNameEntry.Window_NameInput_refresh = Window_NameInput.prototype.refresh;
Window_NameInput.prototype.refresh = function() {
  if (this._mode === 'keyboard') {
    this.contents.clear();
    this.resetTextColor();
    var array = Yanfly.Param.KNEMsg;
    var length = array.length;
    var y = (this.contents.height - (length * this.lineHeight())) / 2;
    for (var i = 0; i < length; ++i) {
      var text = array[i];
      var width = Window_ChoiceList.prototype.textWidthEx.call(this, text);
      var x = Math.floor((this.contents.width - width) / 2);
      this.drawTextEx(text, x, y);
      y += this.lineHeight();
    }
  } else {
    Yanfly.KeyNameEntry.Window_NameInput_refresh.call(this);
  }
};

//=============================================================================
// End of File
//=============================================================================