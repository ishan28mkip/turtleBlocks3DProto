//Trashcan : done;
//External dependencies : utils
//External variables : canvas, stage, refreshCanvas

require(['activity/utils']);

var TRASHWIDTH = 320;
var TRASHHEIGHT = 120;

function Trashcan (canvas, stage, size, refreshCanvas) {
    this.canvas = canvas;
    this.stage = stage;
    this.refreshCanvas = refreshCanvas;
    this.size = size;

    this.iconsize = 55;  // default value
    this.container = new createjs.Container();

    //Makes the trashcan border;
    function makeBorderHighlight(me) {
        var img = new Image();
        img.onload = function () {
            bitmap = new createjs.Bitmap(img);
            bitmap.scaleX = size / me.iconsize;
            bitmap.scaleY = size / me.iconsize;
            me.container.addChild(bitmap);
            bitmap.visible = false;
            bounds = me.container.getBounds();
            me.container.cache(bounds.x, bounds.y, bounds.width, bounds.height);
            // Hide the trash until a block is moved.
            me.container.visible = false;
        };
        img.src = 'data:image/svg+xml;base64,' + window.btoa(
            unescape(encodeURIComponent(BORDER.replace('stroke_color', '#000000'))));
    }

    //Makes the trashcan border and call the border highlighting function
    function makeBorder(me) {
        var img = new Image();
        img.onload = function () {
            border = new createjs.Bitmap(img);
            bitmap.scaleX = me.size / me.iconsize;
            bitmap.scaleY = me.size / me.iconsize;
            me.container.addChild(border);
            makeBorderHighlight(me);
        };
        img.src = 'data:image/svg+xml;base64,' + window.btoa(
            unescape(encodeURIComponent(BORDER.replace('stroke_color', '#e0e0e0'))));
    }

    //Make the trashcan and call the border  making function
    function makeTrash(me) {
        var img = new Image();
        img.onload = function () {
            bitmap = new createjs.Bitmap(img);
            me.container.addChild(bitmap);
            me.iconsize = bitmap.getBounds().width;
            bitmap.scaleX = me.size / me.iconsize;
            bitmap.scaleY = me.size / me.iconsize;
            bitmap.x = ((TRASHWIDTH - size) / 2) * bitmap.scaleX;
            bitmap.y = ((TRASHHEIGHT - size) / 2) * bitmap.scaleY;
            makeBorder(me);
        };
        img.src = 'images/trash.svg';
    }

    //Onresize
    this.resizeEvent = function(scale) {
        this.container.x = (this.canvas.width * 1/scale / 2) - ((TRASHWIDTH / 2) * (this.size / this.iconsize));
        this.container.y = (this.canvas.height * 1/scale) - (TRASHHEIGHT * (this.size / this.iconsize));
    };


    this.stage.addChild(this.container); //Adds the trashcan to the stage
    this.stage.setChildIndex(this.container, 0); //sets the depth of the container
    this.resizeEvent(1); //Adds the resize event
    makeTrash(this); //Makes the trashcan graphics

    this.hide = function() { //Hide the container
        createjs.Tween.get(this.container)
            .to({alpha: 0}, 200)
            .set({visible: false});
    };

    this.show = function() { //show the container
        createjs.Tween.get(this.container)
            .to({alpha: 0.0, visible: true})
            .to({alpha: 1.0}, 200);
    };

    this.highlight = function() { //highlight the container
        if (!last(this.container.children).visible) {
            last(this.container.children).visible = true;
            this.container.children[1].visible = false;
            this.container.visible = true;
            this.container.updateCache();
            this.refreshCanvas();
        }
    };

    this.unhighlight = function() { //unhighlight the container
        if (last(this.container.children).visible) {
            last(this.container.children).visible = false;
            this.container.children[1].visible = true;
            this.container.visible = true;
            this.container.updateCache();
            this.refreshCanvas();
        }
    };

    this.overTrashcan = function(x, y) { //check if the x,y coordinate is over the trashcan
        var tx = this.container.x;
        var ty = this.container.y;
        if (x < tx) {
            return false;
        } else if (x > tx + (TRASHWIDTH * this.size / this.iconsize)) {
            return false;
        }
        if (y < ty) {
            return false;
        }
        return true;
    };
}
