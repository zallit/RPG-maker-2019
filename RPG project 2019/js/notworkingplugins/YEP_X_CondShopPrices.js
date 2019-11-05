//=============================================================================
// Yanfly Engine Plugins - Shop Menu Extension - Conditional Prices
// YEP_X_CondShopPrices.js
//=============================================================================

var Imported = Imported || {};
Imported.YEP_X_CondShopPrices = true;

var Yanfly = Yanfly || {};
Yanfly.CnShPr = Yanfly.CnShPr || {};
Yanfly.CnShPr.version = 1.01;

//=============================================================================
 /*:
 * @plugindesc v1.01 (Req YEP_ShopMenuCore) Allows you to set prices that can
 * change based on various conditions and even variables.
 * @author Yanfly Engine Plugins
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires YEP_ShopMenuCore. Make sure this plugin is located
 * under YEP_ShopMenuCore in the plugin list.
 *
 * Ever wanted to have shop prices for certain items fluctuate as your game
 * progresses? Or maybe even set market values for certain items that change
 * over time. This plugin lets you bind base prices, percentages, increases,
 * exact values, and more! And the best part is, this can be done through
 * variables so you can have extremely dynamic control over your game's market.
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * Insert the following notetags into the items, weapons, and/or armors you
 * want these notetags to affect.
 *
 * Item, Weapon, and Armor Notetags:
 * 
 *   <Base Price Variable: x>
 *   - Sets the base price of the item to this variable's value.
 *   This will replace the price set in the database.
 *
 *   <Percent Price Variable: x>
 *   - Sets the variable which defines the percent modifier for the price.
 *   If the variable's value is 100, then the percentage is 100%.
 *   If the variable's value is 50, then the percentage is 50%.
 *   If the variable's value is 350, then the percentage is 350%.
 *   Use multiples of this notetag to have multiple variables affect the price.
 *   This is calculated after the base price.
 *
 *   <Increase Price Variable: x>
 *   - Sets the variable which defines a flat increase/decrease for the price.
 *   If the variable's value is 100, then the price is increased by 100.
 *   If the variable's value is -200, then the price is decreased by 200.
 *   Use multiples of this notetag to have multiple variables affect the price.
 *   This is calculated after the price percentage modifier.
 *
 *   <Exact Price Variable: x>
 *   - Sets the variable which determines the exact value of the price.
 *   If the variable's value is 50, then the price becomes 50.
 *   If the variable's value is 2000, then the price becomes 2000.
 *   This ignores all other modifiers.
 *
 *   <Price Minimum: x>
 *   <Price Maximum: x>
 *   - Sets the minimum/maximum values the price can reach. This is used to
 *   prevent some prices from overinflating drastically.
 *
 * ============================================================================
 * Order of Calculation
 * ============================================================================
 *
 * Calculations will be done in the following order:
 * 
 * 1. Default price of the item
 * 2. <Base Price Variable: x>
 * 3. Percentage calculated by the global percentage variable plugin parameter
 * 4. All instances of <Percent Price Variable: x>
 * 5. Flat increase calculated by the global increase variable plugin parameter
 * 6. All instances of <Increase Price Variable: x>
 * 7. Overwrite all if <Exact Price Variable: x> exists
 * 8. Running the code of the Global Price Finalization plugin parameter
 * 9. Finishing up with <Price Minimum: x> and <Price Maximum: x>
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.01:
 * - Fixed a bug that would reset the global variables.
 *
 * Version 1.00:
 * - Finished Plugin!
 *
 * ============================================================================
 * End of Helpfile
 * ============================================================================
 *
 * @param GlobalPricePercVar
 * @text Global Price % Variable
 * @type variable
 * @desc The variable used to define the global price percentage.
 * Set this to zero if you don't want use it.
 * @default 0
 *
 * @param GlobalPriceFlatVar
 * @text Global Price + Variable
 * @type variable
 * @desc The variable used to define the global price increase.
 * Set this to zero if you don't want use it.
 * @default 0
 *
 * @param GlobalPriceFinalize
 * @text Global Price Finalization
 * @type note
 * @desc JavaScript code that's ran at the end of each item's price
 * calculation to determine the price.
 * @default "// The following variables can be used.\n// item - the item in question being analyzed\n// price - the finalized price of the item to be returned\n\n// Set price minimum and maximum.\nprice = price.clamp(0, $gameParty.maxGold());"
 *
 */
//=============================================================================

if (Imported.YEP_ShopMenuCore) {

//=============================================================================
// Parameter Variables
//=============================================================================

Yanfly.Parameters = PluginManager.parameters('YEP_X_CondShopPrices');
Yanfly.Param = Yanfly.Param || {};

Yanfly.Param.CnShPrGlobalPerc = Number(Yanfly.Parameters['GlobalPricePercVar']);
Yanfly.Param.CnShPrGlobalFlat = Number(Yanfly.Parameters['GlobalPriceFlatVar']);
Yanfly.Param.CnShPrFinalizePrice = new Function('item','price',
  JSON.parse(Yanfly.Parameters['GlobalPriceFinalize']) + '\nreturn price;');

//=============================================================================
// Game_System
//=============================================================================

Yanfly.CnShPr.Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
  Yanfly.CnShPr.Game_System_initialize.call(this);
  this.initConditionalShopPricesSettings();
};

Game_System.prototype.initConditionalShopPricesSettings = function() {
  if (!$gameVariables) return;
  this._initiatedConditionalShopPriceVariables = true;
  if (Yanfly.Param.CnShPrGlobalPerc > 0 && !this._setupCnShPrGlobalPerc) {
    $gameVariables.setValue(Yanfly.Param.CnShPrGlobalPerc, 100);
    this._setupCnShPrGlobalPerc = true;
  }
  if (Yanfly.Param.CnShPrGlobalFlat > 0 && !this._setupCnShPrGlobalFlat) {
    $gameVariables.setValue(Yanfly.Param.CnShPrGlobalFlat, 0);
    this._setupCnShPrGlobalFlat = true;
  }
};

Game_System.prototype.getGlobalPriceRate = function() {
  if (this._initiatedConditionalShopPriceVariables === undefined) {
    this.initConditionalShopPricesSettings();
  }
  if (Yanfly.Param.CnShPrGlobalPerc > 0) {
    return $gameVariables.value(Yanfly.Param.CnShPrGlobalPerc) / 100;
  } else {
    return 1;
  }
};

Game_System.prototype.getGlobalPriceFlat = function() {
  if (this._initiatedConditionalShopPriceVariables === undefined) {
    this.initConditionalShopPricesSettings();
  }
  if (Yanfly.Param.CnShPrGlobalFlat > 0) {
    return $gameVariables.value(Yanfly.Param.CnShPrGlobalFlat);
  } else {
    return 0;
  }
};

//=============================================================================
// Scene_Map
//=============================================================================

Yanfly.CnShPr.Scene_Map_createDisplayObjects =
  Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects = function() {
  Yanfly.CnShPr.Scene_Map_createDisplayObjects.call(this);
  $gameSystem.initConditionalShopPricesSettings();
};

//=============================================================================
// Window_ShopBuy
//=============================================================================

Yanfly.CnShPr.Window_ShopBuy_price = Window_ShopBuy.prototype.price;
Window_ShopBuy.prototype.price = function(item) {
  var price = Yanfly.CnShPr.Window_ShopBuy_price.call(this, item);
  price = this.processConditionalShopPrices(item, price);
  return price;
};

Window_ShopBuy.prototype.processConditionalShopPrices = function(item, price) {
  if (item.baseItemId) {
    var note = DataManager.getBaseItem(item).note;
  } else {
    var note = item.note;
  }
  var notedata = note.split(/[\r\n]+/);
  // Base
  if (note.match(/<Base Price Variable:[ ](\d+)>/i)) {
    price = $gameVariables.value(Number(RegExp.$1));
  }
  // Rates
  price *= $gameSystem.getGlobalPriceRate();
  for (var i = 0; i < notedata.length; i++) {
    if (notedata[i].match(/<Percent Price Variable:[ ](\d+)>/i)) {
      price *= $gameVariables.value(Number(RegExp.$1)) / 100;
    }
  }
  // Flats
  price += $gameSystem.getGlobalPriceFlat();
  for (var i = 0; i < notedata.length; i++) {
    if (notedata[i].match(/<Increase Price Variable:[ ](\d+)>/i)) {
      price += $gameVariables.value(Number(RegExp.$1));
    }
  }
  // Exact
  if (note.match(/<Exact Price Variable:[ ](\d+)>/i)) {
    price = $gameVariables.value(Number(RegExp.$1));
  }
  // Finalize
  price = Yanfly.Param.CnShPrFinalizePrice.call(this, item, price);
  // Maximum/Minimum
  if (note.match(/<Price (?:Min|Minimum):[ ](\d+)>/i)) {
    price = Math.max(Number(RegExp.$1), price);
  }
  if (note.match(/<Price (?:Max|Maximum):[ ](\d+)>/i)) {
    price = Math.min(Number(RegExp.$1), price);
  }
  // Done
  return Math.max(0, Math.round(price));
};

//=============================================================================
// End of File
//=============================================================================

} else {

var text = '';
text += 'You are getting this error because you are trying to run ';
text += 'YEP_X_CondShopPrices without the required plugins. Please visit ';
text += 'Yanfly.moe and install the required plugins neede for this plugin ';
text += 'found in this plugin\'s help file before you can use it.';
console.log(text);
require('nw.gui').Window.get().showDevTools();

}; // Imported.YEP_ShopMenuCore