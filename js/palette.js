// Copyright (c) 2014,15 Walter Bender
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 3 of the License, or
// (at your option) any later version.
//
// You should have received a copy of the GNU General Public License
// along with this library; if not, write to the Free Software
// Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA
// All things related to palettes
require(['activity/utils']);

var paletteBlocks = null;
var PROTOBLOCKSCALE = 1.0;
var PALETTELEFTMARGIN = 10;

// We don't include 'extras' since we want to be able to delete
// plugins from the extras palette.
var BUILTINPALETTES = ['turtle', 'pen', 'number', 'boolean', 'flow', 'blocks',
    'actions', 'media', 'sensors', 'myblocks',
];


function maxPaletteHeight(menuSize, scale) {
    // Palettes don't start at the top of the screen and the last
    // block in a palette cannot start at the bottom of the screen,
    // hence - 2 * menuSize.
    var h = (windowHeight() * canvasPixelRatio()) / scale - (2 * menuSize);
    return h - (h % STANDARDBLOCKHEIGHT) + (STANDARDBLOCKHEIGHT / 2);
}


function paletteBlockButtonPush(name, arg) {
    console.log('paletteBlockButtonPush: ' + name + ' ' + arg);
    blk = paletteBlocks.makeBlock(name, arg);
    return blk;
}


// There are several components to the palette system:
//
// (1) A palette button (in the Palettes.buttons dictionary) is a
// button that envokes a palette; The buttons have artwork associated
// with them: a bitmap and a highlighted bitmap that is shown when the
// mouse is over the button.
//
// loadPaletteButtonHandler is the event handler for palette buttons.
//
// (2) A menu (in the Palettes.dict dictionary) is the palette
// itself. It consists of a title bar (with an icon, label, and close
// button), and individual containers for each protoblock on the
// menu. There is a background behind each protoblock that is part of
// the palette container.
//
// loadPaletteMenuItemHandler


function Palettes(canvas, refreshCanvas, stage, cellSize, refreshCanvas, trashcan) {
    this.canvas = canvas;
    this.refreshCanvas = refreshCanvas;
    this.stage = stage;
    this.cellSize = cellSize;
    this.halfCellSize = Math.floor(cellSize / 2);
    this.scrollDiff = 0;
    this.refreshCanvas = refreshCanvas;
    this.originalSize = 55; // this is the original svg size
    this.trashcan = trashcan;

    // The collection of palettes.
    this.dict = {};
    this.buttons = {}; // The toolbar button for each palette.

    this.visible = true;
    this.scale = 1.0;
    this.x = 0;
    this.y = this.cellSize;

    this.current = 'turtle';

    this.container = new createjs.Container();
    this.container.snapToPixelEnabled = true;
    this.stage.addChild(this.container);

    this.setScale = function(scale) {
        this.scale = scale;

        this.updateButtonMasks();
        for (var i in this.dict) {
            this.dict[i].resizeEvent();
        }
    }

    // We need access to the macro dictionary because we load them.
    this.setMacroDictionary = function(obj) {
        this.macroDict = obj;
    }

    this.menuScrollEvent = function(direction, scrollSpeed) {
        var keys = Object.keys(this.buttons);

        var diff = direction * scrollSpeed;
        if (this.buttons[keys[0]].y + diff > this.cellSize && direction > 0) {
            return;
        }
        if (this.buttons[last(keys)].y + diff < windowHeight() / this.scale - this.cellSize && direction < 0) {
            return;
        }

        this.scrollDiff += diff;
        for (var name in this.buttons) {
            this.buttons[name].y += diff;
            this.buttons[name].visible = true;
        }
        this.updateButtonMasks();
        this.refreshCanvas();
    }

    this.updateButtonMasks = function() {
        for (var name in this.buttons) {
            var s = new createjs.Shape();
            s.graphics.r(0, 0, this.cellSize, windowHeight() / this.scale);
            s.x = 0;
            s.y = this.cellSize / 2;
            this.buttons[name].mask = s;
        }
    }

    this.makePalettes = function() {
        // First, an icon/button for each palette
        for (var name in this.dict) {
            if (name in this.buttons) {
                this.dict[name].updateMenu(true);
            } else {

                this.buttons[name] = new createjs.Container();
                this.buttons[name].snapToPixelEnabled = true;
                this.stage.addChild(this.buttons[name]);
                this.buttons[name].x = this.x;
                this.buttons[name].y = this.y + this.scrollDiff;
                this.y += this.cellSize;
                var me = this;

                function processButtonIcon(me, name, bitmap, extras) {
                    me.buttons[name].addChild(bitmap);
                    if (me.cellSize != me.originalSize) {
                        bitmap.scaleX = me.cellSize / me.originalSize;
                        bitmap.scaleY = me.cellSize / me.originalSize;
                    }

                    var hitArea = new createjs.Shape();
                    hitArea.graphics.beginFill('#FFF').drawEllipse(-me.halfCellSize, -me.halfCellSize, me.cellSize, me.cellSize);
                    hitArea.x = me.halfCellSize;
                    hitArea.y = me.halfCellSize;
                    me.buttons[name].hitArea = hitArea;
                    me.buttons[name].visible = false;

                    me.dict[name].makeMenu(false);
                    me.dict[name].moveMenu(me.cellSize, me.cellSize);
                    me.dict[name].updateMenu(false);
                    loadPaletteButtonHandler(me, name);
                }
                makePaletteBitmap(me, PALETTEICONS[name], name, processButtonIcon, null);
            }
        }
    };

    this.showMenus = function() {
        // Show the menu buttons, but not the palettes.
        for (var name in this.buttons) {
            this.buttons[name].visible = true;
        }
        for (var name in this.dict) {
            // this.dict[name].showMenu(true);
        }
        this.refreshCanvas();
    }

    this.hideMenus = function() {
        // Hide the menu buttons and the palettes themselves.
        for (var name in this.buttons) {
            this.buttons[name].visible = false;
        }
        for (var name in this.dict) {
            this.dict[name].hideMenu(true);
        }
        this.refreshCanvas();
    }

    this.getInfo = function() {
        for (var key in this.dict) {
            console.log(this.dict[key].getInfo());
        }
    }

    this.updatePalettes = function(showPalette) {
        this.makePalettes();
        if (showPalette) {
            var myPalettes = this;
            setTimeout(function() {
                myPalettes.dict[showPalette].showMenu();
                myPalettes.dict[showPalette].showMenuItems();
                myPalettes.refreshCanvas();
            }, 250);
        } else {
            this.refreshCanvas();
        }
    }

    this.hide = function() {
        this.hideMenus();
        this.visible = false;
    }

    this.show = function() {
        this.showMenus();
        this.visible = true;
    }

    this.setBlocks = function(blocks) {
        paletteBlocks = blocks;
    }

    this.add = function(name) {
        this.dict[name] = new Palette(this, name);
        return this;
    }

    this.remove = function(name) {
        if (!(name in this.buttons)) {
            console.log('Palette.remove: Cannot find palette ' + name);
            return;
        }
        this.buttons[name].removeAllChildren();
        var btnKeys = Object.keys(this.dict);
        for (var btnKey = btnKeys.indexOf(name) + 1; btnKey < btnKeys.length; btnKey++) {
            this.buttons[btnKeys[btnKey]].y -= this.cellSize;
        }
        delete this.buttons[name];
        delete this.dict[name];
        this.y -= this.cellSize;
        this.makePalettes();
    }

    this.bringToTop = function() {
        // Move all the palettes to the top layer of the stage
        for (var name in this.dict) {
            this.stage.removeChild(this.dict[name].menuContainer);
            this.stage.addChild(this.dict[name].menuContainer);
            for (var item in this.dict[name].protoContainers) {
                this.stage.removeChild(this.dict[name].protoContainers[item]);
                this.stage.addChild(this.dict[name].protoContainers[item]);
            }
        }
        this.refreshCanvas();
    }

    this.findPalette = function(x, y) {
        for (var name in this.dict) {
            var px = this.dict[name].menuContainer.x;
            var py = this.dict[name].menuContainer.y;
            var height = Math.min(maxPaletteHeight(this.cellSize, this.scale), this.dict[name].y);
            if (this.dict[name].menuContainer.visible && px < x &&
                x < px + MENUWIDTH && py < y && y < py + height) {
                return this.dict[name];
            }
        }
        return null;
    }

    return this;
}


// Palette Button event handlers
function loadPaletteButtonHandler(palettes, name) {
    var locked = false;
    var scrolling = false;

    palettes.buttons[name].on('mousedown', function(event) {
        scrolling = true;
        lastY = event.stageY;

        palettes.buttons[name].on('pressmove', function(event) {
            if (!scrolling) {
                return;
            }

            diff = event.stageY - lastY;
            palettes.menuScrollEvent(diff, 10);
            lastY = event.stageY;
        });

        palettes.buttons[name].on('pressup', function(event) {
            scrolling = false;
        }, null, true); // once = true
    });


    // A palette button opens or closes a palette.
    var circles = {};
    palettes.buttons[name].on('mouseover', function(event) {
        var r = palettes.cellSize / 2;
        circles = showMaterialHighlight(
            palettes.buttons[name].x + r, palettes.buttons[name].y + r, r,
            event, palettes.scale, palettes.stage);
    });

    palettes.buttons[name].on('pressup', function(event) {
        hideMaterialHighlight(circles, palettes.stage);
    });

    palettes.buttons[name].on('mouseout', function(event) {
        hideMaterialHighlight(circles, palettes.stage);
    });

    palettes.buttons[name].on('click', function(event) {
        if (locked) {
            return;
        }
        locked = true;
        setTimeout(function() {
            locked = false;
        }, 500);
        for (var i in palettes.dict) {
            if (palettes.dict[i] == palettes.dict[name]) {
                palettes.dict[name].showMenu(true);
                palettes.dict[name].showMenuItems(true);
            } else {
                if (palettes.dict[i].visible) {
                    palettes.dict[i].hideMenu(true);
                    palettes.dict[i].hideMenuItems(false);
                }
            }
        }
        palettes.refreshCanvas();
    });
}


// Define objects for individual palettes.
function Palette(palettes, name) {
    this.palettes = palettes;
    this.name = name;
    this.visible = false;
    this.menuContainer = null;
    this.protoList = [];
    this.protoContainers = {};
    this.background = null;
    this.scrollDiff = 0;
    this.y = 0;
    this.size = 0;
    this.columns = 0;
    this.draggingProtoBlock = false;
    this.mouseHandled = false;
    this.upButton = null;
    this.downButton = null;
    this.FadedUpButton = null;
    this.FadedDownButton = null;
    this.count = 0;

    this.makeMenu = function(createHeader) {
        if (this.menuContainer === null) {
            this.menuContainer = new createjs.Container();
            this.menuContainer.snapToPixelEnabled = true;
        }
        if (!createHeader) {
            return;
        }
        var paletteWidth = MENUWIDTH + (this.columns * 160);
        this.menuContainer.removeAllChildren();

        // Create the menu button
        function processHeader(palette, name, bitmap, extras) {
            palette.menuContainer.addChild(bitmap);
            function processButtonIcon(palette, name, bitmap, extras) {
                bitmap.scaleX = bitmap.scaleY = bitmap.scale = 0.8;
                palette.menuContainer.addChild(bitmap);
                palette.palettes.container.addChild(palette.menuContainer);

                function processCloseIcon(palette, name, bitmap, extras) {
                    bitmap.scaleX = bitmap.scaleY = bitmap.scale = 0.7;
                    palette.menuContainer.addChild(bitmap);
                    bitmap.x = paletteWidth - STANDARDBLOCKHEIGHT;
                    bitmap.y = 0;

                    var hitArea = new createjs.Shape();
                    hitArea.graphics.beginFill('#FFF').drawEllipse(-paletteWidth / 2, -STANDARDBLOCKHEIGHT / 2, paletteWidth, STANDARDBLOCKHEIGHT);
                    hitArea.x = paletteWidth / 2;
                    hitArea.y = STANDARDBLOCKHEIGHT / 2;
                    palette.menuContainer.hitArea = hitArea;
                    palette.menuContainer.visible = false;

                    if (!palette.mouseHandled) {
                        loadPaletteMenuHandler(palette);
                        palette.mouseHandled = true;
                    }

                    function processUpIcon(palette, name, bitmap, extras) {
                        bitmap.scaleX = bitmap.scaleY = bitmap.scale = 0.7;
                        palette.palettes.stage.addChild(bitmap);
                        bitmap.x = palette.menuContainer.x + paletteWidth;
                        bitmap.y = palette.menuContainer.y + STANDARDBLOCKHEIGHT;

                        var hitArea = new createjs.Shape();
                        hitArea.graphics.beginFill('#FFF').drawRect(0, 0, STANDARDBLOCKHEIGHT, STANDARDBLOCKHEIGHT);
                        hitArea.x = 0;
                        hitArea.y = 0;
                        bitmap.hitArea = hitArea;
                        bitmap.visible = false;
                        palette.upButton = bitmap;
                        palette.upButton.on('click', function(event) {
                            palette.scrollEvent(STANDARDBLOCKHEIGHT, 10);
                        });

                        function processDownIcon(palette, name, bitmap, extras) {
                            bitmap.scaleX = bitmap.scaleY = bitmap.scale = 0.7;
                            palette.palettes.stage.addChild(bitmap);
                            bitmap.x = palette.menuContainer.x + paletteWidth;
                            bitmap.y = palette.getDownButtonY();

                            var hitArea = new createjs.Shape();
                            hitArea.graphics.beginFill('#FFF').drawRect(0, 0, STANDARDBLOCKHEIGHT, STANDARDBLOCKHEIGHT);
                            hitArea.x = 0;
                            hitArea.y = 0;
                            bitmap.hitArea = hitArea;
                            bitmap.visible = false;
                            palette.downButton = bitmap;
                            palette.downButton.on('click', function(event) {
                                palette.scrollEvent(-STANDARDBLOCKHEIGHT, 10);
                            });
                        } 
                        makePaletteBitmap(palette, DOWNICON, name, processDownIcon, null);
                    function makeFadedDownIcon(palette, name, bitmap, extras) {
                            bitmap.scaleX = bitmap.scaleY = bitmap.scale = 0.7;
                            palette.palettes.stage.addChild(bitmap);
                            bitmap.x = palette.menuContainer.x + paletteWidth;
                            bitmap.y = palette.getDownButtonY();
                           
                            var hitArea = new createjs.Shape();
                            hitArea.graphics.beginFill('#FFF').drawRect(0, 0, STANDARDBLOCKHEIGHT, STANDARDBLOCKHEIGHT);
                            hitArea.x = 0;
                            hitArea.y = 0;
                            bitmap.hitArea = hitArea;
                            bitmap.visible = false;
                            palette.FadedDownButton = bitmap;
                            
                        } 
                        makePaletteBitmap(palette, FADEDDOWNICON, name, makeFadedDownIcon, null);

                        function makeFadedUpIcon(palette, name, bitmap, extras) {
                            bitmap.scaleX = bitmap.scaleY = bitmap.scale = 0.7;
                            palette.palettes.stage.addChild(bitmap);
                            bitmap.x = palette.menuContainer.x + paletteWidth;
                            bitmap.y = palette.menuContainer.y + STANDARDBLOCKHEIGHT;   

                            var hitArea = new createjs.Shape();
                            hitArea.graphics.beginFill('#FFF').drawRect(0, 0, STANDARDBLOCKHEIGHT, STANDARDBLOCKHEIGHT);
                            hitArea.x = 0;
                            hitArea.y = 0;
                            bitmap.hitArea = hitArea;
                            bitmap.visible = false;
                            palette.FadedUpButton = bitmap;
                        } 
                        makePaletteBitmap(palette, FADEDUPICON, name, makeFadedUpIcon, null);
                    } 
                    makePaletteBitmap(palette, UPICON, name, processUpIcon, null);
                }
                makePaletteBitmap(palette, CLOSEICON, name, processCloseIcon, null);
            }
            makePaletteBitmap(palette, PALETTEICONS[name], name, processButtonIcon, null);
        }

        makePaletteBitmap(this, PALETTEHEADER.replace('fill_color', '#282828').replace('palette_label', _(this.name)).replace(/header_width/g, paletteWidth), this.name, processHeader, null);
    };

    this.getDownButtonY = function () {
        var h = this.y;
        var max = maxPaletteHeight(this.palettes.cellSize, this.palettes.scale);
        if (this.y > max) {
            h = max;
        }
        return this.menuContainer.y + h - STANDARDBLOCKHEIGHT / 2;
    };

    this.resizeEvent = function() {
        this.updateBackground();
        this.updateBlockMasks();

        if (this.downButton !== null) {
            this.downButton.y = this.getDownButtonY();
        }
    };

    this.updateBlockMasks = function() {
        var h = Math.min(maxPaletteHeight(this.palettes.cellSize, this.palettes.scale), this.y);
        for (var i in this.protoContainers) {
            var s = new createjs.Shape();
            s.graphics.r(0, 0, MENUWIDTH, h);
            s.x = this.background.x;
            s.y = this.background.y;
            this.protoContainers[i].mask = s;
        }
    };

    this.updateBackground = function() {
        if (this.menuContainer === null) {
            return;
        }

        if (this.background !== null) {
            this.background.removeAllChildren();
        } else {
            this.background = new createjs.Container();
            this.background.snapToPixelEnabled = true;
            this.background.visible = false;
            this.palettes.stage.addChild(this.background);
            setupBackgroundEvents(this);
        }

        var h = Math.min(maxPaletteHeight(this.palettes.cellSize, this.palettes.scale), this.y);
        var shape = new createjs.Shape();
        shape.graphics.f('#b3b3b3').r(0, 0, MENUWIDTH, h).ef();
        shape.width = MENUWIDTH;
        shape.height = h;
        this.background.addChild(shape);

        this.background.x = this.menuContainer.x;
        this.background.y = this.menuContainer.y + STANDARDBLOCKHEIGHT;
    };

    this.updateMenu = function(hide) {
        if (this.menuContainer === null) {
            this.makeMenu(false);
        } else {
            // Hide the menu while we update.
            if (hide) {
                this.hide();
            }
        }
        this.y = 0;
        for (var blk in this.protoList) {
            // Don't show hidden blocks on the menus
            if (this.protoList[blk].hidden) {
                continue;
            }

            // Create a proto block for each palette entry.
            var blkname = this.protoList[blk].name;
            var modname = blkname;
            var arg;

            switch (blkname) {
                // Use the name of the action in the label
                case 'storein':
                    modname = 'store in ' + this.protoList[blk].defaults[0];
                    arg = this.protoList[blk].defaults[0];
                    break;
                case 'box':
                    modname = this.protoList[blk].defaults[0];
                    arg = this.protoList[blk].defaults[0];
                    break;
                case 'namedbox':
                    if (this.protoList[blk].defaults[0] === undefined) {
                        modname = 'namedbox';
                        arg = _('box');
                    } else {
                        modname = this.protoList[blk].defaults[0];
                        arg = this.protoList[blk].defaults[0];
                    }
                    break;
                case 'nameddo':
                    if (this.protoList[blk].defaults[0] === undefined) {
                        modname = 'nameddo';
                        arg = _('action');
                    } else {
                        modname = this.protoList[blk].defaults[0];
                        arg = this.protoList[blk].defaults[0];
                    }
                    break;
            }

            //The functions will automatically reach the top and hence doesn't make sense to keep inside loop, but doesn't make any difference.

            function calculateContainerXY(palette) {
                var y = palette.menuContainer.y + palette.y + STANDARDBLOCKHEIGHT;
            }

            function calculateHeight(palette, blkname) {
                var size = palette.protoList[blk].size;
                if (['if', 'while', 'until', 'ifthenelse', 'waitFor'].indexOf(modname) != -1) {
                    // Some blocks are not shown full-size on the palette.
                    size = 1;
                } else if (['repeat', 'forever'].indexOf(blkname) != -1) {
                    size += 1;
                } else if (['media', 'camera', 'video'].indexOf(blkname) != -1) {
                    size += 1;
                } else if (palette.protoList[blk].image) {
                    size += 1;
                } else if (['action', 'start'].indexOf(blkname) != -1) {
                    size += 1;
                } else if (['and', 'or'].indexOf(blkname) != -1) {
                    size += 1;
                }
                var height = STANDARDBLOCKHEIGHT * size * palette.protoList[blk].scale / 2.0;
                return height;
            }

            if (!this.protoContainers[modname]) {
                // create graphics for the palette entry for this block
                this.protoContainers[modname] = new createjs.Container();
                this.protoContainers[modname].snapToPixelEnabled = true;

                calculateContainerXY(this);

                this.protoContainers[modname].x = this.menuContainer.x;
                this.protoContainers[modname].y = this.menuContainer.y + this.y + this.scrollDiff + STANDARDBLOCKHEIGHT;
                this.palettes.stage.addChild(this.protoContainers[modname]);
                this.protoContainers[modname].visible = false;

                var height = calculateHeight(this, blkname);
                this.size += Math.ceil(height * PROTOBLOCKSCALE);
                this.y += Math.ceil(height * PROTOBLOCKSCALE);
                this.updateBackground();

                function processFiller(palette, modname, bitmap, extras) {
                    bitmap.y = 0;
                    var blkname = extras[0];
                    var blk = extras[1];
                    var myBlock = paletteBlocks.protoBlockDict[blkname];
                    if (myBlock == null) {
                        console.log('Could not find block ' + blkname);
                        return;
                    }

                    var block_label = '';

                    switch (myBlock.name) {
                        case 'text':
                            block_label = _('text');
                            break;
                        case 'number':
                            block_label = '100';
                            break;
                        case 'less':
                        case 'greater':
                        case 'equal':
                            // Label should be inside _() when defined.
                            block_label = myBlock.staticLabels[0];
                            break;
                        default:
                            if (blkname != modname) {
                                // Override label for do, storein, and box
                                block_label = palette.protoList[blk].defaults[0];
                            } else if (myBlock.staticLabels.length > 0) {
                                block_label = myBlock.staticLabels[0];
                                if (block_label == '') {
                                    if (blkname == 'loadFile') {
                                        block_label = _('open file')
                                    } else {
                                        block_label = blkname;
                                    }
                                }
                            } else {
                                block_label = blkname;
                            }
                    }

                    // Don't display the label on image blocks.
                    if (myBlock.image) {
                        block_label = '';
                    }

                    switch (myBlock.name) {
                        // case 'box':
                        case 'namedbox':
                            // so the label will fit
                            var svg = new SVG();
                            svg.init();
                            svg.setScale(myBlock.scale);
                            svg.setExpand(60, 0, 0, 0);
                            svg.setOutie(true);
                            var artwork = svg.basicBox();
                            var docks = svg.docks;
                            break;
                        case 'nameddo':
                            // so the label will fit
                            var svg = new SVG();
                            svg.init();
                            svg.setScale(myBlock.scale);
                            svg.setExpand(30, 0, 0, 0);
                            var artwork = svg.basicBlock();
                            var docks = svg.docks;
                            break;
                        case 'if':
                        case 'until':
                        case 'while':
                        case 'waitFor':
                            // so the block will fit
                            var svg = new SVG();
                            svg.init();
                            svg.setScale(myBlock.scale);
                            svg.setTab(true);
                            svg.setSlot(true);
                            var artwork = svg.basicBlock();
                            var docks = svg.docks;
                            break;
                        case 'ifthenelse':
                            // so the block will fit
                            var svg = new SVG();
                            svg.init();
                            svg.setScale(myBlock.scale);
                            svg.setTab(true);
                            svg.setSlot(true);
                            var artwork = svg.basicBlock();
                            var docks = svg.docks;
                            block_label = myBlock.staticLabels[0] + ' ' + myBlock.staticLabels[2];
                            break;
                        default:
                            var obj = myBlock.generator();
                            var artwork = obj[0];
                            var docks = obj[1];
                            break;
                    }

                    function calculateBounds(palette, blk, modname) {
                        var bounds = palette.protoContainers[modname].getBounds();
                        palette.protoContainers[modname].cache(bounds.x, bounds.y, Math.ceil(bounds.width), Math.ceil(bounds.height));

                        var hitArea = new createjs.Shape();
                        // Trim the hitArea height slightly to make
                        // it easier to select single-height blocks
                        // below double-height blocks.
                        hitArea.graphics.beginFill('#FFF').drawRect(0, 0, Math.ceil(bounds.width), Math.ceil(bounds.height * 0.75));
                        palette.protoContainers[modname].hitArea = hitArea;

                        loadPaletteMenuItemHandler(palette, blk, modname);
                        palette.palettes.refreshCanvas();
                    }

                    function processBitmap(palette, modname, bitmap, args) {
                        var myBlock = args[0];
                        var blk = args[1];
                        palette.protoContainers[modname].addChild(bitmap);
                        bitmap.x = PALETTELEFTMARGIN;
                        bitmap.y = 0;
                        bitmap.scaleX = PROTOBLOCKSCALE;
                        bitmap.scaleY = PROTOBLOCKSCALE;
                        bitmap.scale = PROTOBLOCKSCALE;

                        if (myBlock.image) {
                            var image = new Image();
                            image.onload = function() {
                                var bitmap = new createjs.Bitmap(image);
                                if (image.width > image.height) {
                                    bitmap.scaleX = bitmap.scaleY = bitmap.scale = MEDIASAFEAREA[2] / image.width * (myBlock.scale / 2);
                                } else {
                                    bitmap.scaleX = bitmap.scaleY = bitmap.scale = MEDIASAFEAREA[3] / image.height * (myBlock.scale / 2);
                                }
                                palette.protoContainers[modname].addChild(bitmap);
                                bitmap.x = MEDIASAFEAREA[0] * (myBlock.scale / 2);
                                bitmap.y = MEDIASAFEAREA[1] * (myBlock.scale / 2);
                                calculateBounds(palette, blk, modname);
                            };
                            image.src = myBlock.image;
                        } else {
                            calculateBounds(palette, blk, modname);
                        }
                    }

                    if (['do', 'nameddo', 'namedbox'].indexOf(myBlock.name) != -1) {
                        if (block_label.length > 8) {
                            block_label = block_label.substr(0, 7) + '...';
                        }
                    }

                    artwork = artwork.replace(/fill_color/g, PALETTEFILLCOLORS[myBlock.palette.name]).replace(/stroke_color/g, PALETTESTROKECOLORS[myBlock.palette.name]).replace('block_label', block_label);

                    while (myBlock.staticLabels.length < myBlock.args + 1) {
                        myBlock.staticLabels.push('');
                    }
                    for (var i = 1; i < myBlock.staticLabels.length; i++) {
                        artwork = artwork.replace('arg_label_' + i, myBlock.staticLabels[i]);
                    }

                    makePaletteBitmap(palette, artwork, modname, processBitmap, [myBlock, blk]);
                }

                makePaletteBitmap(this, PALETTEFILLER.replace(/filler_height/g, height.toString()), modname, processFiller, [blkname, blk]);
            } else {
                calculateContainerXY(this);
                var height = calculateHeight(this, blkname);
                this.y += Math.ceil(height * PROTOBLOCKSCALE);
            }
        }
        this.makeMenu(true);
    };

    this.moveMenu = function(x, y) {
        dx = x - this.menuContainer.x;
        dy = y - this.menuContainer.y;
        this.menuContainer.x = x;
        this.menuContainer.y = y;
        this.moveMenuItemsRelative(dx, dy);
    };

    this.moveMenuRelative = function(dx, dy) {
        this.menuContainer.x += dx;
        this.menuContainer.y += dy;
        this.moveMenuItemsRelative(dx, dy);
    };

    this.hide = function() {
        this.hideMenu();
    };

    this.show = function() {
        this.showMenu();

        for (var i in this.protoContainers) {
            this.protoContainers[i].visible = true;
        }
        this.updateBlockMasks();
        if (this.background !== null) {
            this.background.visible = true;
        }
    }

    this.hideMenu = function() {
        if (this.menuContainer != null) {
            this.menuContainer.visible = false;
            this.hideMenuItems(true);
        }
        this.moveMenu(this.palettes.cellSize, this.palettes.cellSize);
    }

    this.showMenu = function() {
        this.menuContainer.visible = true;
    }

    this.hideMenuItems = function(init) {
        for (var i in this.protoContainers) {
            this.protoContainers[i].visible = false;
        }
        if (this.background !== null) {
            this.background.visible = false;
        }
        if (this.upButton != null) {
            this.upButton.visible = false;
            this.downButton.visible = false;
            this.FadedUpButton.visible = false;
            this.FadedDownButton.visible = false;
        }
        this.visible = false;
    }

    this.showMenuItems = function(init) {
        if(this.scrollDiff == 0)
            this.count = 0;
        for (var i in this.protoContainers) {
            this.protoContainers[i].visible = true;
        }
        this.updateBlockMasks();
        if (this.background !== null) {
            this.background.visible = true;
        }
        // Use scroll position to determine visibility
        this.scrollEvent(0, 10);
        this.visible = true;
    };

    this.moveMenuItems = function(x, y) {
        for (var i in this.protoContainers) {
            this.protoContainers[i].x = x;
            this.protoContainers[i].y = y;
        }
        if (this.background !== null) {
            this.background.x = x;
            this.background.y = y;
        }
    };

    this.moveMenuItemsRelative = function(dx, dy) {
        for (var i in this.protoContainers) {
            this.protoContainers[i].x += dx;
            this.protoContainers[i].y += dy;
        }
        if (this.background !== null) {
            this.background.x += dx;
            this.background.y += dy;
        }
        if (this.upButton !== null) {
            this.upButton.x += dx;
            this.upButton.y += dy;
            this.downButton.x += dx;
            this.downButton.y += dy;
            this.FadedUpButton.x += dx;
            this.FadedUpButton.y += dy;
            this.FadedDownButton.x += dx;
            this.FadedDownButton.y += dy;
        }
    }
    this.scrollEvent = function(direction, scrollSpeed) {
        var diff = direction * scrollSpeed;
        var h = Math.min(maxPaletteHeight(this.palettes.cellSize, this.palettes.scale), this.y);

        if (this.y < maxPaletteHeight(this.palettes.cellSize, this.palettes.scale)) {
            this.upButton.visible = false;
            this.downButton.visible = false;
            this.FadedUpButton.visible = false;
            this.FadedDownButton.visible = false;
            return;
        }
        if (this.scrollDiff + diff > 0 && direction > 0) {
            var x =  - this.scrollDiff;

            if(x == 0)
            {
                this.downButton.visible = true;
                this.upButton.visible = false;
                this.FadedUpButton.visible = true;
                this.FadedDownButton.visible = false;
                
                return;
            }
            
            this.scrollDiff += x;
            this.FadedDownButton.visible = false;
            this.downButton.visible = true;
            
            for (var i in this.protoContainers) {
            this.protoContainers[i].y += x;
            this.protoContainers[i].visible = true;
        
            if(this.scrollDiff == 0)
            {
                this.downButton.visible = true;
                this.upButton.visible = false;
                this.FadedUpButton.visible = true;
                this.FadedDownButton.visible = false;
                
            }
            }
        }
        else if (this.y + this.scrollDiff +diff < h && direction < 0) {
            var x = -this.y + h - this.scrollDiff;
            if(x == 0)
            {
                this.upButton.visible = true;
                this.downButton.visible = false;
                this.FadedDownButton.visible = true;
                this.FadedUpButton.visible = false;
                
                return;
            }
            this.scrollDiff += -this.y + h - this.scrollDiff;
            this.FadedUpButton.visible = false;
            this.upButton.visible = true;
            
            for (var i in this.protoContainers) {
                this.protoContainers[i].y += x;
                this.protoContainers[i].visible = true;
            }

            if(-this.y + h - this.scrollDiff == 0)
            {
                this.upButton.visible   = true;
                this.downButton.visible = false;
                this.FadedDownButton.visible = true;
                this.FadedUpButton.visible = false;
                
            }

        }
        else if(this.count == 0){
            this.FadedUpButton.visible = true;
            this.FadedDownButton.visible = false;
            this.upButton.visible = false;
            this.downButton.visible = true;
        }
        else
        {
            this.scrollDiff += diff;
            this.FadedUpButton.visible = false;
            this.FadedDownButton.visible = false;
            this.upButton.visible = true;
            this.downButton.visible = true;

        for (var i in this.protoContainers) {
            this.protoContainers[i].y += diff;
            this.protoContainers[i].visible = true;
            }
        }
        this.updateBlockMasks();

        var stage = this.palettes.stage;
        stage.setChildIndex(this.menuContainer, stage.getNumChildren() - 1);
        this.palettes.refreshCanvas();
        this.count += 1;
    } 


    this.getInfo = function() {
        var returnString = this.name + ' palette:';
        for (var thisBlock in this.protoList) {
            returnString += ' ' + this.protoList[thisBlock].name;
        }
        return returnString;
    };

    this.add = function(protoblock) {
        if (this.protoList.indexOf(protoblock) == -1) {
            this.protoList.push(protoblock);
        }
        return this;
    }

    return this;
};


var blocks = undefined;

function initPalettes(canvas, refreshCanvas, stage, cellSize, refreshCanvas, trashcan, b) {
    // Instantiate the palettes object on first load.
    var palettes = new Palettes(canvas, refreshCanvas, stage, cellSize, refreshCanvas, trashcan).
    add('turtle').
    add('pen').
    add('number').
    add('boolean').
    add('flow').    
    add('blocks').
    add('actions').
    add('media').
    add('sensors').
    add('extras');
    palettes.makePalettes();
    blocks = b;

    // Give the palettes time to load.
    setTimeout(function() {
        palettes.show();
        palettes.bringToTop();
    }, 2000);
    return palettes;
}


var MODEUNSURE = 0;
var MODEDRAG = 1;
var MODESCROLL = 2;
var DECIDEDISTANCE = 20;


function setupBackgroundEvents(palette) {
    var scrolling = false;
    palette.background.on('mousedown', function(event) {
        scrolling = true;
        var lastY = event.stageY;

        palette.background.on('pressmove', function(event) {
            if (!scrolling) {
                return;
            }

            var diff = event.stageY - lastY;
            palette.scrollEvent(diff, 10);
            lastY = event.stageY;
        });

        palette.background.on('pressup', function(event) {
            scrolling = false;
        }, null, true); // once = true
    });
}


// Menu Item event handlers
function loadPaletteMenuItemHandler(palette, blk, blkname) {
    // A menu item is a protoblock that is used to create a new block.
    var locked = false;
    var moved = false;
    var saveX = palette.protoContainers[blkname].x;
    var saveY = palette.protoContainers[blkname].y;
    var bgScrolling = false;

    function makeBlockFromPalette(blk, blkname, palette, callback) {
        if (locked) {
            return;
        }
        locked = true;
        setTimeout(function() {
            locked = false;
        }, 500);

        var arg = '__NOARG__';
        switch (palette.protoList[blk].name) {
            case 'do':
                blkname = 'do ' + palette.protoList[blk].defaults[0];
                var arg = palette.protoList[blk].defaults[0];
                break;
            case 'storein':
                // Use the name of the box in the label
                blkname = 'store in ' + palette.protoList[blk].defaults[0];
                var arg = palette.protoList[blk].defaults[0];
                break;
            case 'box':
                // Use the name of the box in the label
                blkname = palette.protoList[blk].defaults[0];
                var arg = palette.protoList[blk].defaults[0];
                break;
            case 'namedbox':
                // Use the name of the box in the label
                if (palette.protoList[blk].defaults[0] == undefined) {
                    blkname = 'namedbox';
                    var arg = _('box');
                } else {
                    blkname = palette.protoList[blk].defaults[0];
                    var arg = palette.protoList[blk].defaults[0];
                }
                break;
            case 'nameddo':
                // Use the name of the action in the label
                if (palette.protoList[blk].defaults[0] == undefined) {
                    blkname = 'nameddo';
                    var arg = _('action');
                } else {
                    blkname = palette.protoList[blk].defaults[0];
                    var arg = palette.protoList[blk].defaults[0];
                }
                break;
        }
        var newBlock = paletteBlockButtonPush(palette.protoList[blk].name, arg);
        callback(newBlock);
    }

    palette.protoContainers[blkname].on('mousedown', function(event) {
        var stage = palette.palettes.stage;
        stage.setChildIndex(palette.protoContainers[blkname], stage.getNumChildren() - 1);
        palette.protoContainers[blkname].mask = null;

        moved = false;
        saveX = palette.protoContainers[blkname].x;
        saveY = palette.protoContainers[blkname].y - palette.scrollDiff;
        var startX = event.stageX;
        var startY = event.stageY;
        var lastY = event.stageY;
        if (palette.draggingProtoBlock) {
            return;
        }
        if (locked) {
            return;
        }
        locked = true;
        setTimeout(function() {
            locked = false;
        }, 500);

        var mode = window.hasMouse ? MODEDRAG : MODEUNSURE;

        palette.protoContainers[blkname].on('pressmove', function(event) {
            if (mode === MODEDRAG) {
                moved = true;
                palette.draggingProtoBlock = true;
                palette.protoContainers[blkname].x = Math.round(event.stageX / palette.palettes.scale) - PALETTELEFTMARGIN;
                palette.protoContainers[blkname].y = Math.round(event.stageY / palette.palettes.scale);
                palette.palettes.refreshCanvas();
                return;
            }

            if (mode === MODESCROLL) {
                var diff = event.stageY - lastY;
                palette.scrollEvent(diff, 10);
                lastY = event.stageY;
                return;
            }

            var xd = Math.abs(event.stageX - startX);
            var yd = Math.abs(event.stageY - startY);
            var diff = Math.sqrt(xd * xd + yd * yd);
            if (mode === MODEUNSURE && diff > DECIDEDISTANCE) {
                mode = yd > xd ? MODESCROLL : MODEDRAG;
            }
        });
    });

    palette.protoContainers[blkname].on('pressup', function(event) {
        if (moved) {
            moved = false;
            palette.draggingProtoBlock = false;
            if (palette.name == 'myblocks') {
                // If we are on the myblocks palette, it is a macro.
                var macroName = blkname.replace('macro_', '');

                // We need to copy the macro data so it is not overwritten.
                var obj = [];
                for (var b = 0; b < palette.palettes.macroDict[macroName].length; b++) {
                    var valueEntry = palette.palettes.macroDict[macroName][b][1];
                    var newValue = [];
                    if (typeof(valueEntry) == 'string') {
                        newValue = valueEntry;
                    } else if (typeof(valueEntry[1]) == 'string') {
                        if (valueEntry[0] == 'number') {
                            newValue = [valueEntry[0], Number(valueEntry[1])];
                        } else {
                            newValue = [valueEntry[0], valueEntry[1]];
                        }
                    } else if (typeof(valueEntry[1]) == 'number') {
                        if (valueEntry[0] == 'number') {
                            newValue = [valueEntry[0], valueEntry[1]];
                        } else {
                            newValue = [valueEntry[0], valueEntry[1].toString()];
                        }
                    } else {
                        if (valueEntry[0] == 'number') {
                            newValue = [valueEntry[0], Number(valueEntry[1]['value'])];
                        } else {
                            newValue = [valueEntry[0], {'value': valueEntry[1]['value']}];
                        }
                    }
                    var newBlock = [palette.palettes.macroDict[macroName][b][0],
                                    newValue,
                                    palette.palettes.macroDict[macroName][b][2],
                                    palette.palettes.macroDict[macroName][b][3],
                                    palette.palettes.macroDict[macroName][b][4]];
                    obj.push(newBlock);
                }

                // Set the position of the top block in the stack
                // before loading.
                obj[0][2] = palette.protoContainers[blkname].x;
                obj[0][3] = palette.protoContainers[blkname].y;
                console.log('loading macro ' + macroName);
                paletteBlocks.loadNewBlocks(obj);

                // Ensure collapse state of new stack is set properly.
                var thisBlock = paletteBlocks.blockList.length - 1;
                var topBlk = paletteBlocks.findTopBlock(thisBlock);
                setTimeout(function() {
                    paletteBlocks.blockList[topBlk].collapseToggle();
                }, 500);
            } else {
                // Create the block.
                function myCallback (newBlock) {
                    // Move the drag group under the cursor.
                    paletteBlocks.findDragGroup(newBlock);
                    for (var i in paletteBlocks.dragGroup) {
                        paletteBlocks.moveBlockRelative(paletteBlocks.dragGroup[i], Math.round(event.stageX / palette.palettes.scale) - paletteBlocks.stage.x, Math.round(event.stageY / palette.palettes.scale) - paletteBlocks.stage.y);
                    }
                    // Dock with other blocks if needed
                    console.log('new block moved ' + newBlock);
                    blocks.blockMoved(newBlock);
                }

                var newBlock = makeBlockFromPalette(blk, blkname, palette, myCallback);
            }

            // Return protoblock we've been dragging back to the palette.
            palette.protoContainers[blkname].x = saveX;
            palette.protoContainers[blkname].y = saveY + palette.scrollDiff;
            palette.updateBlockMasks();
            palette.palettes.refreshCanvas();
        }
    });
}


// Palette Menu event handlers
function loadPaletteMenuHandler(palette) {
    // The palette menu is the container for the protoblocks. One
    // palette per palette button.

    var locked = false;
    var trashcan = palette.palettes.trashcan;
    var paletteWidth = MENUWIDTH + (palette.columns * 160);

    palette.menuContainer.on('click', function(event) {
        if (Math.round(event.stageX / palette.palettes.scale) > palette.menuContainer.x + paletteWidth - STANDARDBLOCKHEIGHT) {
            palette.hide();
            palette.palettes.refreshCanvas();
            return;
        }

        if (locked) {
            return;
        }
        locked = true;
        setTimeout(function() {
            locked = false;
        }, 500);

        for (p in palette.palettes.dict) {
            if (palette.name != p) {
                if (palette.palettes.dict[p].visible) {
                    palette.palettes.dict[p].hideMenuItems(false);
                }
            }
        }
        if (palette.visible) {
            palette.hideMenuItems(false);
        } else {
            palette.showMenuItems(false);
        }
        palette.palettes.refreshCanvas();
    });

    palette.menuContainer.on('mousedown', function(event) {
        trashcan.show();
        // Move them all?
        var offset = {
            x: palette.menuContainer.x - Math.round(event.stageX / palette.palettes.scale),
            y: palette.menuContainer.y - Math.round(event.stageY / palette.palettes.scale)
        };

        palette.menuContainer.on('pressup', function(event) {
            if (trashcan.overTrashcan(event.stageX / palette.palettes.scale, event.stageY / palette.palettes.scale)) {
                palette.hide();
                palette.palettes.refreshCanvas();
                // Only delete plugin palettes.
                if (BUILTINPALETTES.indexOf(palette.name) === -1) {
                    promptPaletteDelete(palette);
                } else if (palette.name == 'myblocks') {
                    promptMacrosDelete(palette);
                }
            }
            trashcan.hide();
        });

        palette.menuContainer.on('mouseout', function(event) {
            if (trashcan.overTrashcan(event.stageX / palette.palettes.scale, event.stageY / palette.palettes.scale)) {
                palette.hide();
                palette.palettes.refreshCanvas();
            }
            trashcan.hide();
        });

        palette.menuContainer.on('pressmove', function(event) {
            var oldX = palette.menuContainer.x;
            var oldY = palette.menuContainer.y;
            palette.menuContainer.x = Math.round(event.stageX / palette.palettes.scale) + offset.x;
            palette.menuContainer.y = Math.round(event.stageY / palette.palettes.scale) + offset.y;
            palette.palettes.refreshCanvas();
            var dx = palette.menuContainer.x - oldX;
            var dy = palette.menuContainer.y - oldY;

            // If we are over the trash, warn the user.
            if (trashcan.overTrashcan(event.stageX / palette.palettes.scale, event.stageY / palette.palettes.scale)) {
                trashcan.highlight();
            } else {
                trashcan.unhighlight();
            }

            // Hide the menu items while drag.
            palette.hideMenuItems(false);
            palette.moveMenuItemsRelative(dx, dy);
        });
    });

    palette.menuContainer.on('mouseout', function(event) {
    });
}


function promptPaletteDelete(palette) {
    var msg = 'Do you want to remove all "%s" blocks from your project?'.replace('%s', palette.name)
    if (!confirm(msg)) {
        return;
    }

    console.log('removing palette ' + palette.name);
    palette.palettes.remove(palette.name);

    delete pluginObjs['PALETTEHIGHLIGHTCOLORS'][palette.name];
    delete pluginObjs['PALETTESTROKECOLORS'][palette.name];
    delete pluginObjs['PALETTEFILLCOLORS'][palette.name];
    delete pluginObjs['PALETTEPLUGINS'][palette.name];

    for (var i = 0; i < palette.protoList.length; i++) {
        var name = palette.protoList[i].name;
        delete pluginObjs['FLOWPLUGINS'][name];
        delete pluginObjs['ARGPLUGINS'][name];
        delete pluginObjs['BLOCKPLUGINS'][name];
    }

    localStorage.plugins = preparePluginExports({});
}


function promptMacrosDelete(palette) {
    var msg = 'Do you want to remove all the stacks from your custom palette?';
    if (!confirm(msg)) {
        return;
    }

    console.log('removing macros from ' + palette.name);
    for (var i = 0; i < palette.protoList.length; i++) {
        var name = palette.protoList[i].name;
        delete palette.protoContainers[name];
        palette.protoList.splice(i, 1);
    }
    palette.palettes.updatePalettes('myblocks');
    localStorage.macros = prepareMacroExports(null, null, {});
}


function makePaletteBitmap(palette, data, name, callback, extras) {
    // Async creation of bitmap from SVG data
    // Works with Chrome, Safari, Firefox (untested on IE)
    var img = new Image();
    img.onload = function() {
        bitmap = new createjs.Bitmap(img);
        callback(palette, name, bitmap, extras);
    }
    img.src = 'data:image/svg+xml;base64,' + window.btoa(
        unescape(encodeURIComponent(data)));
}


function regeneratePalette(palette) {
    palette.visible = false;
    palette.hideMenuItems();
    palette.protoContainers = {};
    palette.palettes.updatePalettes();
}
