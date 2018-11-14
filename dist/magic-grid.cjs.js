'use strict';

/**
 * @author emmanuelolaojo
 * @since 11/11/18
 */

/**
 * Validates the configuration object.
 *
 * @param config - configuration object
 */
var checkParams = function (config) {
  if (!config.container) { error("container"); }
  if (!config.items && !config.static) { error("items or static"); }
};


var error = function (prop) {
  throw new Error(("Missing property '" + prop + "' in MagicGrid config"));
};

/**
 * Finds the longest column in
 * a column list
 *
 * @param cols - list of columns
 *
 * @return longest column
 */
var getMax = function (cols) {
  var max = cols[0];

  for (var col of cols) {
    if (col.height > max.height) { max = col; }
  }

  return max;
};

/**
 * Finds the longest column in
 * a column list
 *
 * @param cols - list of columns
 *
 * @return longest column
 */
var getMin = function (cols) {
  var min = cols[0];

  for (var col of cols) {
    if (col.height < min.height) { min = col; }
  }

  return min;
};

/**
 * @author emmanuelolaojo
 * @since 11/10/18
 *
 * The MagicGrid class is an
 * implementation of a flexible
 * grid layout.
 */

var MagicGrid = function MagicGrid (config) {
  checkParams(config);

  this.containerClass = config.container;
  this.container = document.querySelector(config.container);
  this.items = this.container.children;
  this.static = config.static || false;
  this.size = config.items;
  this.gutter = config.gutter || 25;
  this.maxColumns = config.maxColumns || false;
  this.useMin = config.useMin || false;
  this.animate = config.animate || false;
  this.started = false;

  this.init();
};

/**
 * Initializes styles
 *
 * @private
 */
MagicGrid.prototype.init = function init () {
  if (!this.ready() || this.started) { return; }

  this.container.style.position = "relative";
  for (var i = 0; i < this.items.length; i++) {
    this.items[i].style.position = "absolute";
  
    if (this.animate) {
      this.items[i].style.transition = "top,left 0.2s ease";
    }
  }

  this.started = true;
};

/**
 * Calculates the width of a column.
 *
 * @return width of a column in the grid
 * @private
 */
MagicGrid.prototype.colWidth = function colWidth () {
  return this.items[0].getBoundingClientRect().width + this.gutter;
};

/**
 * Initializes an array of empty columns
 * and calculates the leftover whitespace.
 *
 * @return {{cols: Array, wSpace: number}}
 * @private
 */
MagicGrid.prototype.setup = function setup () {
  var width = this.container.getBoundingClientRect().width;
  var numCols = Math.floor(width / this.colWidth()) || 1;
  var cols = [];

  if (this.maxColumns && numCols > this.maxColumns) {
    numCols = this.maxColumns;
  }

  for (var i = 0; i < numCols; i++) {
    cols[i] = {height: 0, index: i};
  }

  var wSpace = width - numCols * this.colWidth() + this.gutter;

  return {cols: cols, wSpace: wSpace};
};

/**
 * Gets the next available column.
 *
 * @param cols list of columns
 * @param i index of dom element
 *
 * @return {*} next available column
 * @private
 */
MagicGrid.prototype.nextCol = function nextCol (cols, i) {
  if (this.useMin) {
    return getMin(cols);
  }

  return cols[i % cols.length];
};

/**
 * Position each items in the container
 * based on their corresponding columns
 * values.
 */
MagicGrid.prototype.positionItems = function positionItems () {
  var ref = this.setup();
    var cols = ref.cols;
    var wSpace = ref.wSpace;

  wSpace = Math.floor(wSpace / 2);

  for (var i = 0; i < this.items.length; i++) {
    var col = this.nextCol(cols, i);
    var left = col.index * this.colWidth() + wSpace;
    var item = this.items[i];

    item.style.left = left + "px";
    item.style.top = col.height + this.gutter + "px";

    col.height += item.getBoundingClientRect().height + this.gutter;
  }

  this.container.style.height = getMax(cols).height;
};

/**
 * Checks if every items has been loaded
 * in the dom.
 *
 * @return {Boolean} true if every items is present
 */
MagicGrid.prototype.ready = function ready () {
  if (this.static) { return true; }
  return this.container.length > 0 && this.items.length === this.size;
};

/**
 * Periodically checks that all items
 * have been loaded in the dom. Calls
 * this.listen() once all the items are
 * present.
 *
 * @private
 */
MagicGrid.prototype.getReady = function getReady () {
    var this$1 = this;

  var interval = setInterval(function () {
    this$1.container = document.querySelector(this$1.containerClass);
    this$1.items = this$1.container.children;

    if (this$1.ready()) {
      clearInterval(interval);

      this$1.init();
      this$1.listen();
    }
  }, 100);
};

/**
 * Positions all the items and
 * repositions them whenever the
 * window size changes.
 */
MagicGrid.prototype.listen = function listen () {
    var this$1 = this;

  if (this.ready()) {
    this.positionItems();

    window.addEventListener("resize", function () {
      setTimeout(this$1.positionItems(), 200);
    });
  } else { this.getReady(); }
};

module.exports = MagicGrid;
