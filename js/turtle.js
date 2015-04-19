
// Turtles
var DEFAULTCOLOR = 0;
var DEFAULTVALUE = 50;
var DEFAULTCHROMA = 100;
var DEFAULTSTROKE = 5;
var DEFAULTFONT = 'sans-serif';

// Turtle sprite
var turtlePath = 'images/turtle.svg';
var turtleBasePath = 'images/';



//Global Three.js definitions, port to some other file and fix dependencies
/*Global Setting Variable defined*/
var threeScene,threeCamera,threeRenderer;

/*Object variable defined*/
var skybox, basicPlane,axesHelper,basicBlockGeometry,basicBlockMaterial;
var pointLights = [];
var basicBlocks = [];

var axisX = new THREE.Vector3(1,0,0);
var axisY = new THREE.Vector3(0,1,0);
var axisZ = new THREE.Vector3(0,0,1);
var origin = new THREE.Vector3(0,0,0);

/*Global Cursor Variables defined*/
var currentCursorPosition = new THREE.Vector3(0,0,0);
var initialCursorPosition = new THREE.Vector3(0,0,0);

var cursorAxisX = new THREE.Vector3(1,0,0);
var cursorAxisY = new THREE.Vector3(0,1,0);
var cursorAxisZ = new THREE.Vector3(0,0,1);

var currentRotationRoll = 0;
var currentRotationPitch = 0; 
var currentRotationYaw  = 0;

var blockType = 0;
var blockColor = new THREE.Color(0x2244ff);

initializeThree();

function initializeThree(){
        //Basic Config Settings
    threeScene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight, 0.1, 1000);
    threeRenderer = new THREE.WebGLRenderer({ antialias: true });

    threeRenderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(threeRenderer.domElement);

    //Background box Initialization
    var skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
    var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x96D3F3, side: THREE.BackSide });
    skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    threeScene.add(skybox);

    /*Basic Geometry Initializations*/

    //Initialize a basic plane of reference
    var basicPlaneGeometry = new THREE.PlaneBufferGeometry(200,200);
    var basicPlaneMaterial = new THREE.MeshLambertMaterial({color: 0x96D3F3});
    basicPlane = new THREE.Mesh(basicPlaneGeometry,basicPlaneMaterial);
    //threeScene.add(basicPlane);

    //Initialization of current object to be put at place
    basicBlockGeometry = new THREE.BoxGeometry(1,1,1);
    basicBlockMaterial = new THREE.MeshLambertMaterial({color: blockColor.getHex()});

    //axes helper
    
    var axislength = 8;
    axesHelper = new THREE.Object3D();
    axesHelper.add(new THREE.ArrowHelper(axisX, initialCursorPosition, axislength, 0xff0000, 1, 1), new THREE.ArrowHelper(axisY, initialCursorPosition, axislength, 0x00ff00, 1, 1),new THREE.ArrowHelper(axisZ, initialCursorPosition, axislength, 0x0000ff, 1, 1));
    threeScene.add(axesHelper);

    /*Light Source Initialization*/

    var ambientLight = new THREE.AmbientLight(0xffffff);
    threeScene.add(ambientLight);

    //Sun
    // var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    // directionalLight.position.set( 0, 1, 0 );
    // threeScene.add( directionalLight );

    // pointLights.push(new THREE.PointLight(0xffffff));
    // pointLights[0].position.set(50, 50, 50);
    // threeScene.add(pointLights[0]);

    /*
    pointLights.push(new THREE.PointLight(0xffffff));
    pointLights[1].position.set(100, 100, 100);
    threeScene.add(pointLights[1]);*/


    //Initialize Camera Position
    threeCamera.position.z=50;
    threeCamera.position.x=50;
    threeCamera.position.y=50;
    threeCamera.lookAt(axesHelper.position);
    threeRender();
}


function threeRender() {
    //Scene Renderer
    threeRenderer.render( threeScene, threeCamera );
}



//individual turtles
function Turtle (name, turtles) {
    this.name = name;
    this.turtles = turtles; //turtles is a property of turle and turtle is a property of turtles. Lol Wut?

    // Is the turtle running?
    this.running = false;

    // In the trash?
    this.trash = false;

    // Things used for drawing the turtle.
    this.container = null;
    this.x = 0;
    this.y = 0;
    this.bitmap = null;
    this.skinChanged = false;  // Should we reskin the turtle on clear?

    // Which start block is assocated with this turtle?
    this.startBlock = null;
    this.decorationBitmap = null;  // Start block decoration.

    // Queue of blocks this turtle is executing.
    this.queue = [];

    // Listeners
    this.listeners = {};

    // Things used for what the turtle draws.
    this.drawingCanvas = null;
    this.svgOutput = '';
    // Are we currently drawing a path?
    this.svgPath = false;
    this.color = DEFAULTCOLOR;
    this.value = DEFAULTVALUE;
    this.chroma = DEFAULTCHROMA;
    this.stroke = DEFAULTSTROKE;
    this.canvasColor = '#ff0031';
    this.orientation = 0;
    this.fillState = false;
    this.penState = true;
    this.font = DEFAULTFONT;
    this.media = [];  // Media (text, images) we need to remove on clear.

    //Function that renders the three scene again.
    this.threeRedraw=function(){
        threeRender();
    };

    //What happens when the turtle moves.
    //Port to three
    this.move = function(ox, oy, x, y, invert) {
        if (invert) {
            ox = this.turtles.turtleX2screenX(ox);
            oy = this.turtles.turtleY2screenY(oy);
            nx = this.turtles.turtleX2screenX(x);
            ny = this.turtles.turtleY2screenY(y);
        } else {
            nx = x;
            ny = y;
        }

        // Draw a line if the pen is down.
        if (this.penState) {
            this.drawingCanvas.graphics.lineTo(nx, ny);
            if (!this.svgPath) {
                this.svgPath = true;
                var oxScaled = ox * this.turtles.scale;
                var oyScaled = oy * this.turtles.scale;
                this.svgOutput += '<path d="M ' + oxScaled + ',' + oyScaled + ' ';
            }
            var nxScaled = nx * this.turtles.scale;
            var nyScaled = ny * this.turtles.scale;
            this.svgOutput += nxScaled + ',' + nyScaled + ' ';
        } else {
            this.drawingCanvas.graphics.moveTo(nx, ny);
        }
        // Update turtle position on screen.
        this.container.x = nx;
        this.container.y = ny;
        if (invert) {
            this.x = x;
            this.y = y;
        } else {
            this.x = this.turtles.screenX2turtleX(x);
            this.y = this.turtles.screenY2turtleY(y);
        }
    };

    this.arc = function(cx, cy, ox, oy, x, y, radius, start, end, anticlockwise, invert) {
        if (invert) {
            cx = this.turtles.turtleX2screenX(cx);
            cy = this.turtles.turtleY2screenY(cy);
            ox = this.turtles.turtleX2screenX(ox);
            oy = this.turtles.turtleY2screenY(oy);
            nx = this.turtles.turtleX2screenX(x);
            ny = this.turtles.turtleY2screenY(y);
        } else {
            nx = x;
            ny = y;
        }

        if (!anticlockwise) {
            sa = start - Math.PI;
            ea = end - Math.PI;
        } else {
            sa = start;
            ea = end;
        }

        // Draw an arc if the pen is down.
        if (this.penState) {
            this.drawingCanvas.graphics.arc(cx, cy, radius, sa, ea, anticlockwise);
            if (!this.svgPath) {
                this.svgPath = true;
                var oxScaled = ox * this.turtles.scale;
                var oyScaled = oy * this.turtles.scale;
                this.svgOutput += '<path d="M ' + oxScaled + ',' + oyScaled + ' ';
            }
            var sweep;
            if (anticlockwise) {
                sweep = 0;
            } else {
                sweep = 1;
            }
            var nxScaled = nx * this.turtles.scale;
            var nyScaled = ny * this.turtles.scale;
            var radiusScaled = radius * this.turtles.scale;
            this.svgOutput += 'A ' + radiusScaled + ',' + radiusScaled + ' 0 0 ' + sweep + ' ' + nxScaled + ',' + nyScaled + ' ';
        } else {
            this.drawingCanvas.graphics.moveTo(nx, ny);
        }
        // Update turtle position on screen.
        this.container.x = nx;
        this.container.y = ny;
        if (invert) {
            this.x = x;
            this.y = y;
        } else {
            this.x = this.screenX2turtles.turtleX(x);
            this.y = this.screenY2turtles.turtleY(y);
        }
    };

    // Turtle functions
    this.doClear = function() {
        // Reset turtle.
        this.x = 0;
        this.y = 0;
        this.orientation = 0.0;
        var i = this.turtles.turtleList.indexOf(this) % 10;
        this.color = i * 10;
        this.value = DEFAULTVALUE;
        this.chroma = DEFAULTCHROMA;
        this.stroke = DEFAULTSTROKE;
        this.font = DEFAULTFONT;
        this.container.x = this.turtles.turtleX2screenX(this.x);
        this.container.y = this.turtles.turtleY2screenY(this.y);

        if (this.skinChanged) {
            this.doTurtleShell(55, turtleBasePath + 'turtle-' + i.toString() + '.svg');
            this.skinChanged = false;
        }

        this.bitmap.rotation = this.orientation;
        this.container.updateCache();

        // Clear all media.
        for (i = 0; i < this.media.length; i++) {
            this.turtles.stage.removeChild(this.media[i]);
        }
        // FIX ME: potential memory leak
        this.media = [];

        // Clear all graphics.
        this.penState = true;
        this.fillState = false;

        this.canvasColor = getMunsellColor(this.color, this.value, this.chroma);
        this.drawingCanvas.graphics.clear();
        this.drawingCanvas.graphics.beginStroke(this.canvasColor);
        this.drawingCanvas.graphics.setStrokeStyle(this.stroke, 'round', 'round');

        this.svgOutput = '';
        this.svgPath = false;

        //3D variable reset
        currentCursorPosition.copy(origin);
        axesHelper.position.copy(currentCursorPosition);

        cursorAxisX.copy(axisX);
        cursorAxisY.copy(axisY);
        cursorAxisZ.copy(axisZ);

        currentRotationRoll = 0;
        currentRotationPitch = 0; 
        currentRotationYaw  = 0;

        threeRenderer.render( threeScene, threeCamera );


        this.turtles.refreshCanvas();
    };

    //Port to three
    this.doForward = function(steps) {
        if (!this.fillState) {
            this.drawingCanvas.graphics.beginStroke(this.canvasColor);
            this.drawingCanvas.graphics.setStrokeStyle(this.stroke, 'round', 'round');
            this.drawingCanvas.graphics.moveTo(this.container.x, this.container.y);
        }

        // old turtle point
        var ox = this.turtles.screenX2turtleX(this.container.x);
        var oy = this.turtles.screenY2turtleY(this.container.y);

        // new turtle point
        var rad = this.orientation * Math.PI / 180.0;
        var nx = ox + Number(steps) * Math.sin(rad);
        var ny = oy + Number(steps) * Math.cos(rad);

        this.move(ox, oy, nx, ny, true);
        this.turtles.refreshCanvas();
    };

    //3D functions
    // Turtle 3D functions put as turtle functions directly do not pollute the global namespace

    /*Manipulating Cursor Positions*/
    this.createCurrentObjectAtCursor = function(){
    switch (blockType){
        case 0: basicBlocks.push(new THREE.Mesh(basicBlockGeometry,basicBlockMaterial)); 
        break;
        default : basicBlocks.push(new THREE.Mesh(basicBlockGeometry,basicBlockMaterial));
    }
    threeScene.add(basicBlocks[basicBlocks.length-1]);
    basicBlocks[basicBlocks.length-1].position.copy(currentCursorPosition);
    //Rotate the block to match the orientation of the axis
    rotateAroundObjectAxis(basicBlocks[basicBlocks.length-1],cursorAxisX,currentRotationRoll*Math.PI/180);
    rotateAroundObjectAxis(basicBlocks[basicBlocks.length-1],cursorAxisY,currentRotationPitch*Math.PI/180);
    rotateAroundObjectAxis(basicBlocks[basicBlocks.length-1],cursorAxisZ,currentRotationYaw*Math.PI/180);
    threeRender();
    };

    this.setCursorPosition = function(x,y,z){
        var material = new THREE.LineBasicMaterial({
            color: this.canvasColor,
            linewidth : this.stroke
        });
        var geometry = new THREE.Geometry();
        var lineBegin = new THREE.Vector3();
        var lineClose = new THREE.Vector3();
        lineBegin.copy(currentCursorPosition);
        geometry.vertices.push(lineBegin);
        if(this.penState){
            currentCursorPosition.set(x,y,z);
            lineClose.copy(currentCursorPosition);
            geometry.vertices.push(lineClose);
            threeScene.add(new THREE.Line(geometry, material));
            axesHelper.position.set(x,y,z);
            threeRender();
        }
        else{
            currentCursorPosition.set(x,y,z);
            axesHelper.position.set(x,y,z);
            threeRender();
        }  
    };

    this.setCursorPositionX = function(x){
        var material = new THREE.LineBasicMaterial({
            color: this.canvasColor,
            linewidth : this.stroke
        });
        var geometry = new THREE.Geometry();
        var lineBegin = new THREE.Vector3();
        var lineClose = new THREE.Vector3();
        lineBegin.copy(currentCursorPosition);
        geometry.vertices.push(lineBegin);
        if(this.penState){
            currentCursorPosition.setX(x);
            lineClose.copy(currentCursorPosition);
            geometry.vertices.push(lineClose);
            threeScene.add(new THREE.Line(geometry, material));
            axesHelper.position.setX(x);
            threeRender();
        }
        else{
            currentCursorPosition.setX(x);
            axesHelper.position.setX(x);
            threeRender();
        } 
    };

    this.setCursorPositionY = function(y){
        var material = new THREE.LineBasicMaterial({
            color: this.canvasColor,
            linewidth : this.stroke
        });
        var geometry = new THREE.Geometry();
        var lineBegin = new THREE.Vector3();
        var lineClose = new THREE.Vector3();
        lineBegin.copy(currentCursorPosition);
        geometry.vertices.push(lineBegin);
        if(this.penState){
            currentCursorPosition.setY(y);
            lineClose.copy(currentCursorPosition);
            geometry.vertices.push(lineClose);
            threeScene.add(new THREE.Line(geometry, material));
            axesHelper.position.setY(y);
            threeRender();
        }
        else{
            currentCursorPosition.setY(y);
            axesHelper.position.setY(y);
            threeRender();
        }  
    };

    this.setCursorPositionZ = function(z){
        var material = new THREE.LineBasicMaterial({
            color: this.canvasColor,
            linewidth : this.stroke
        });
        var geometry = new THREE.Geometry();
        var lineBegin = new THREE.Vector3();
        var lineClose = new THREE.Vector3();
        lineBegin.copy(currentCursorPosition);
        geometry.vertices.push(lineBegin);
        if(this.penState){
            currentCursorPosition.setZ(z);
            lineClose.copy(currentCursorPosition);
            geometry.vertices.push(lineClose);
            threeScene.add(new THREE.Line(geometry, material));
            axesHelper.position.setZ(z);
            threeRender();
        }
        else{
            currentCursorPosition.setZ(z);
            axesHelper.position.setZ(z);
            threeRender();
        }
    };

    this.doForwardX = function(x){
        var material = new THREE.LineBasicMaterial({
            color: this.canvasColor,
            linewidth : this.stroke
        });
        var geometry = new THREE.Geometry();
        var lineBegin = new THREE.Vector3();
        var lineClose = new THREE.Vector3();
        var alongX = new THREE.Vector3();
        alongX.copy(cursorAxisX);
        alongX.multiplyScalar(x);
        lineBegin.copy(currentCursorPosition);
        geometry.vertices.push(lineBegin);
        if(this.penState){
            currentCursorPosition.addVectors(currentCursorPosition,alongX);
            lineClose.copy(currentCursorPosition);
            geometry.vertices.push(lineClose);
            threeScene.add(new THREE.Line(geometry, material));
            axesHelper.position.copy(currentCursorPosition);
            threeRender();
        }
        else{
            currentCursorPosition.addVectors(currentCursorPosition,alongX);
            axesHelper.position.copy(currentCursorPosition);
            threeRender();
        } 
    };

    this.doForwardY = function(y){
        var material = new THREE.LineBasicMaterial({
            color: this.canvasColor,
            linewidth : this.stroke
        });
        var geometry = new THREE.Geometry();
        var lineBegin = new THREE.Vector3();
        var lineClose = new THREE.Vector3();
        var alongY = new THREE.Vector3();
        alongY.copy(cursorAxisY);
        alongY.multiplyScalar(y);
        lineBegin.copy(currentCursorPosition);
        geometry.vertices.push(lineBegin);
        if(this.penState){
            currentCursorPosition.addVectors(currentCursorPosition,alongY);
            lineClose.copy(currentCursorPosition);
            geometry.vertices.push(lineClose);
            threeScene.add(new THREE.Line(geometry, material));
            axesHelper.position.copy(currentCursorPosition);
            threeRender();
        }
        else{
            currentCursorPosition.addVectors(currentCursorPosition,alongY);
            axesHelper.position.copy(currentCursorPosition);
            threeRender();
        }  
    };

    this.doForwardZ = function(z){
        var material = new THREE.LineBasicMaterial({
            color: this.canvasColor,
            linewidth : this.stroke
        });
        var geometry = new THREE.Geometry();
        var lineBegin = new THREE.Vector3();
        var lineClose = new THREE.Vector3();
        var alongZ = new THREE.Vector3();
        alongZ.copy(cursorAxisZ);
        alongZ.multiplyScalar(z);
        lineBegin.copy(currentCursorPosition);
        geometry.vertices.push(lineBegin);
        if(this.penState){
            currentCursorPosition.addVectors(currentCursorPosition,alongZ);
            lineClose.copy(currentCursorPosition);
            geometry.vertices.push(lineClose);
            threeScene.add(new THREE.Line(geometry, material));
            axesHelper.position.copy(currentCursorPosition);
            threeRender();
        }
        else{
            currentCursorPosition.addVectors(currentCursorPosition,alongZ);
            axesHelper.position.copy(currentCursorPosition);
            threeRender();
        }
    };

    /*Rotation Fuctions*/

    this.setRoll = function(degrees){
        var tempRot = degrees - currentRotationRoll;
        rotateAroundObjectAxis(axesHelper,cursorAxisX,tempRot*Math.PI/180);
        cursorAxisY.applyAxisAngle(cursorAxisX.normalize(),tempRot*Math.PI/180);
        cursorAxisZ.applyAxisAngle(cursorAxisX.normalize(),tempRot*Math.PI/180);
        if(currentRotationRoll + tempRot >= 360)
            currentRotationRoll = currentRotationRoll + tempRot - 360;
        else if(currentRotationRoll + tempRot < 0 )
            currentRotationRoll = currentRotationRoll + tempRot + 360;
        else
            currentRotationRoll += tempRot;
        threeRender();
    };

    this.setPitch = function(degrees){
        var tempRot = degrees - currentRotationPitch;
        rotateAroundObjectAxis(axesHelper,cursorAxisY,tempRot*Math.PI/180);
        cursorAxisX.applyAxisAngle(cursorAxisY.normalize(),tempRot*Math.PI/180);
        cursorAxisZ.applyAxisAngle(cursorAxisY.normalize(),tempRot*Math.PI/180);
        if(currentRotationPitch + tempRot >= 360)
            currentRotationPitch = currentRotationPitch + tempRot - 360;
        else if(currentRotationPitch + tempRot < 0 )
            currentRotationPitch = currentRotationPitch + tempRot + 360;
        else
            currentRotationPitch += tempRot;
        threeRender();
    };

    this.setYaw = function(degrees){
        var tempRot = degrees - currentRotationYaw;
        rotateAroundObjectAxis(axesHelper,cursorAxisZ,tempRot*Math.PI/180);
        cursorAxisX.applyAxisAngle(cursorAxisZ.normalize(),tempRot*Math.PI/180);
        cursorAxisY.applyAxisAngle(cursorAxisZ.normalize(),tempRot*Math.PI/180);
        if(currentRotationYaw + tempRot >= 360)
            currentRotationYaw = currentRotationYaw + tempRot - 360;
        else if(currentRotationYaw + tempRot < 0 )
            currentRotationYaw = currentRotationYaw + tempRot + 360;
        else
            currentRotationYaw += tempRot;
        threeRender();
    };

    this.doRoll = function(degrees){
        this.setRoll(currentRotationRoll+degrees);
    };

    this.doPitch = function(degrees){
        this.setPitch(currentRotationPitch+degrees);
    };

    this.doYaw = function(degrees){
        this.setYaw(currentRotationYaw+degrees);
    };

    //Make later
    this.setCameraX = function(x){

    };

    this.setCameraY = function(y){

    };

    this.setCameraZ = function(z){

    };


    //port to three
    this.doSetXY = function(x, y) {
        if (!this.fillState) {
            this.drawingCanvas.graphics.beginStroke(this.canvasColor);
            this.drawingCanvas.graphics.setStrokeStyle(this.stroke, 'round', 'round');
            this.drawingCanvas.graphics.moveTo(this.container.x, this.container.y);
        }

        // old turtle point
        var ox = this.turtles.screenX2turtleX(this.container.x);
        var oy = this.turtles.screenY2turtleY(this.container.y);

        // new turtle point
        var nx = Number(x);
        var ny = Number(y);

        this.move(ox, oy, nx, ny, true);
        this.turtles.refreshCanvas();
    };

    this.doArc = function(angle, radius) {
        if (!this.fillState) {
            this.drawingCanvas.graphics.beginStroke(this.canvasColor);
            this.drawingCanvas.graphics.setStrokeStyle(this.stroke, 'round', 'round');
            this.drawingCanvas.graphics.moveTo(this.container.x, this.container.y);
        }
        var adeg = Number(angle);
        var arad = (adeg / 180) * Math.PI;
        var orad = (this.orientation / 180) * Math.PI;
        var r = Number(radius);

        // old turtle point
        ox = this.turtles.screenX2turtleX(this.container.x);
        oy = this.turtles.screenY2turtleY(this.container.y);

        var anticlockwise;
        var cx;
        var cy;
        var nx;
        var ny;
        if( adeg < 0 ) {
            anticlockwise = true;
            adeg = -adeg;
            // center point for arc
            cx = ox - Math.cos(orad) * r;
            cy = oy + Math.sin(orad) * r;
            // new position of turtle
            nx = cx + Math.cos(orad + arad) * r;
            ny = cy - Math.sin(orad + arad) * r;
        } else {
            anticlockwise = false;
            // center point for arc
            cx = ox + Math.cos(orad) * r;
            cy = oy - Math.sin(orad) * r;
            // new position of turtle
            nx = cx - Math.cos(orad + arad) * r;
            ny = cy + Math.sin(orad + arad) * r;
        }
        this.arc(cx, cy, ox, oy, nx, ny, r, orad, orad + arad, anticlockwise, true);

        if (anticlockwise) {
            this.doRight(-adeg);
        } else {
            this.doRight(adeg);
        }
        this.turtles.refreshCanvas();
    };

    //don't port to three at the moment.
    this.doShowImage = function(size, myImage) {
        // Add an image object to the canvas
        // Is there a JS test for a valid image path?

        // There is no such test as the image is sent by the server,
        // we need to configure an ajax request to the server which can send
        // us the validation if the image exists. All other methods will load
        // the image hence nullifying the purpose of the test.

        if (myImage === null) {
            return;
        }
        var image = new Image();
        var me = this;
        image.onload = function() {
            var bitmap = new createjs.Bitmap(image);
            me.turtles.stage.addChild(bitmap);
            me.media.push(bitmap);
            bitmap.scaleX = Number(size) / image.width;
            bitmap.scaleY = bitmap.scaleX;
            bitmap.scale = bitmap.scaleX;
            bitmap.x = me.container.x;
            bitmap.y = me.container.y;
            bitmap.regX = image.width / 2;
            bitmap.regY = image.height / 2;
            bitmap.rotation = me.orientation;
            me.turtles.refreshCanvas();
        };
        image.src = myImage;
    };



    //don't port to three at the moment.
    this.doShowURL = function(size, myURL) {
        // Add an image object from a URL to the canvas
        if (myURL === null) {
            return;
        }
        var image = new Image();
        image.src = myURL;
        var me = this;
        image.onload = function() {
            var bitmap = new createjs.Bitmap(image);
            me.turtles.stage.addChild(bitmap);
            me.media.push(bitmap);
            bitmap.scaleX = Number(size) / image.width;
            bitmap.scaleY = bitmap.scaleX;
            bitmap.scale = bitmap.scaleX;
            bitmap.x = me.container.x;
            bitmap.y = me.container.y;
            bitmap.regX = image.width / 2;
            bitmap.regY = image.height / 2;
            bitmap.rotation = me.orientation;
            me.turtles.refreshCanvas();
        };
    };

    //did not understand this function, read again.
    this.doTurtleShell = function(size, myImage) {
        // Add image to turtle
        if (myImage === null) {
            return;
        }
        var image = new Image();
        image.src = myImage;
        var me = this;
        image.onload = function() {
            me.container.removeChild(me.bitmap);
            me.bitmap = new createjs.Bitmap(image);
            me.container.addChild(me.bitmap);
            me.bitmap.scaleX = Number(size) / image.width;
            me.bitmap.scaleY = me.bitmap.scaleX;
            me.bitmap.scale = me.bitmap.scaleX;
            me.bitmap.x = 0;
            me.bitmap.y = 0;
            me.bitmap.regX = image.width / 2;
            me.bitmap.regY = image.height / 2;
            me.bitmap.rotation = me.orientation;
            me.skinChanged = true;

            me.container.uncache();
            var bounds = me.container.getBounds();
            me.container.cache(bounds.x, bounds.y, bounds.width, bounds.height);

            // Recalculate the hit area as well.
            var hitArea = new createjs.Shape();
            hitArea.graphics.beginFill('#FFF').drawRect(0, 0, bounds.width, bounds.height);
            hitArea.x = -bounds.width / 2;
            hitArea.y = -bounds.height / 2;
            me.container.hitArea = hitArea;

            if (me.startBlock !== null) {
                me.startBlock.container.removeChild(me.decorationBitmap);
                me.decorationBitmap = new createjs.Bitmap(myImage);
                me.startBlock.container.addChild(me.decorationBitmap);
                me.decorationBitmap.name = 'decoration';
                bounds = me.startBlock.container.getBounds();
                // FIXME: Why is the position off? Does it need a scale factor?
                // try to fix this
                me.decorationBitmap.x = bounds.width - 50 * me.startBlock.protoblock.scale / 2;
                me.decorationBitmap.y = 20 * me.startBlock.protoblock.scale / 2;
                me.decorationBitmap.scaleX = (27.5 / image.width) * me.startBlock.protoblock.scale / 2;
                me.decorationBitmap.scaleY = (27.5 / image.height) * me.startBlock.protoblock.scale / 2;
                me.decorationBitmap.scale = (27.5 / image.width) * me.startBlock.protoblock.scale / 2;
                me.startBlock.container.updateCache();
            }
            me.turtles.refreshCanvas();
        };
    };

    this.resizeDecoration = function(scale, width) {
        this.decorationBitmap.x = width - 30 * scale / 2;
        this.decorationBitmap.y = 35 * scale / 2;
        this.decorationBitmap.scaleX = this.decorationBitmap.scaleY = this.decorationBitmap.scale = 0.5 * scale / 2;
    };

    //do not port to three currently.
    this.doShowText = function(size, myText) {
        // Add a text or image object to the canvas

        var textSize = size.toString() + 'px ' + this.font;
        var text = new createjs.Text(myText.toString(), textSize, this.canvasColor);
        text.textAlign = 'left';
        text.textBaseline = 'alphabetic';
        this.turtles.stage.addChild(text);
        this.media.push(text);
        text.x = this.container.x;
        text.y = this.container.y;
        text.rotation = this.orientation;
        var xScaled = text.x * this.turtles.scale;
        var yScaled = text.y * this.turtles.scale;
        var sizeScaled = size * this.turtles.scale;
        this.svgOutput += '<text x="' + xScaled + '" y = "' + yScaled + '" fill="' + this.canvasColor + '" font-family = "' + this.font + '" font-size = "' + sizeScaled + '">' + myText + '</text>';
        this.turtles.refreshCanvas();
    };

    this.doRight = function(degrees) {
        // Turn right and display corresponding turtle graphic.
        this.orientation += Number(degrees);
        this.orientation %= 360;
        this.bitmap.rotation = this.orientation;
        this.container.updateCache();
        this.turtles.refreshCanvas();
    };

    this.doSetHeading = function(degrees) {
        this.orientation = Number(degrees);
        this.orientation %= 360;
        this.bitmap.rotation = this.orientation;
        this.turtles.refreshCanvas();
        this.container.updateCache();
    };

    this.doSetFont = function(font) {
        this.font = font;
        this.turtles.refreshCanvas();
        this.container.updateCache();
    };


    this.doSetColor = function(color) {
        // Color sets hue but also selects maximum chroma.
        this.closeSVG();
        this.color = Number(color);
        var results = getcolor(this.color);
        this.canvasValue = results[0];
        this.canvasChroma = results[1];
        this.canvasColor = results[2];
        this.drawingCanvas.graphics.beginStroke(this.canvasColor);
    };

    this.doSetHue = function(hue) {
        this.closeSVG();
        this.color = Number(hue);
        this.canvasColor = getMunsellColor(this.color, this.value, this.chroma);
        this.drawingCanvas.graphics.beginStroke(this.canvasColor);
    };

    this.doSetValue = function(shade) {
        this.closeSVG();
        this.value = Number(shade);
        this.canvasColor = getMunsellColor(this.color, this.value, this.chroma);
        this.drawingCanvas.graphics.beginStroke(this.canvasColor);
    };

    this.doSetChroma = function(chroma) {
        this.closeSVG();
        this.chroma = Number(chroma);
        this.canvasColor = getMunsellColor(this.color, this.value, this.chroma);
        this.drawingCanvas.graphics.beginStroke(this.canvasColor);
    };

    this.doSetPensize = function(size) {
        this.closeSVG();
        this.stroke = size;
        this.drawingCanvas.graphics.setStrokeStyle(this.stroke, 'round', 'round');
    };

    this.doPenUp = function() {
        this.closeSVG();
        this.penState = false;
    };

    this.doPenDown = function() {
        this.penState = true;
    };

    this.doStartFill = function() {
        /// start tracking points here
        this.drawingCanvas.graphics.beginFill(this.canvasColor);
        this.fillState = true;
    };

    this.doEndFill = function() {
        /// redraw the points with fill enabled
        this.drawingCanvas.graphics.endFill();
        this.closeSVG();
        this.fillState = false;
    };

    this.closeSVG = function() {
        if (this.svgPath) {
            this.svgOutput += '" style="stroke-linecap:round;fill:';
            if (this.fillState) {
                this.svgOutput += this.canvasColor + ';';
            } else {
                this.svgOutput += 'none;';
            }
            this.svgOutput += 'stroke:' + this.canvasColor + ';';
            var strokeScaled = this.stroke * this.turtles.scale;
            this.svgOutput += 'stroke-width:' + strokeScaled + 'pt;" />';
            this.svgPath = false;
        }
    };
}


function Turtles(canvas, stage, refreshCanvas) {
    this.canvas = canvas;
    this.stage = stage;
    this.refreshCanvas = refreshCanvas;
    this.scale = 1.0;
    this.rotating = false;

    this.setScale = function(scale) {
        this.scale = scale;
    };

    this.setBlocks = function(blocks) {
        this.blocks = blocks;
    };

    // The list of all of our turtles, one for each start block.
    this.turtleList = [];

    this.add = function(startBlock, infoDict) {
        // Add a new turtle for each start block
        if (startBlock !== null) {
            console.log('adding a new turtle ' + startBlock.name);
        } else {
            console.log('adding a new turtle startBlock is null');
        }

        var blkInfoAvailable = false;

        if (typeof(infoDict) == 'object') {
          if (Object.keys(infoDict).length == 8) {
            blkInfoAvailable = true;
          }
        }

        var i = this.turtleList.length;
        var turtleName = i.toString();
        var myTurtle = new Turtle(turtleName, this);

        if (blkInfoAvailable) {
            myTurtle.x = infoDict.xcor;
            myTurtle.y = infoDict.ycor;
        }

        this.turtleList.push(myTurtle);

        // Each turtle needs its own canvas.
        myTurtle.drawingCanvas = new createjs.Shape();
        this.stage.addChild(myTurtle.drawingCanvas);
        // In theory, this prevents some unnecessary refresh of the
        // canvas.
        myTurtle.drawingCanvas.tickEnabled = false;

        var turtleImage = new Image();
        i %= 10;
        myTurtle.container = new createjs.Container();
        this.stage.addChild(myTurtle.container);
        myTurtle.container.x = this.turtleX2screenX(myTurtle.x);
        myTurtle.container.y = this.turtleY2screenY(myTurtle.y);

        var hitArea = new createjs.Shape();
        hitArea.graphics.beginFill('#FFF').drawEllipse(-27, -27, 55, 55);
        hitArea.x = 0;
        hitArea.y = 0;
        myTurtle.container.hitArea = hitArea;

        function processTurtleBitmap(me, name, bitmap, startBlock) {
            myTurtle.bitmap = bitmap;
            myTurtle.bitmap.regX = 27 | 0;
            myTurtle.bitmap.regY = 27 | 0;
            myTurtle.bitmap.cursor = 'pointer';
            myTurtle.container.addChild(myTurtle.bitmap);

            var bounds = myTurtle.container.getBounds();
            myTurtle.container.cache(bounds.x, bounds.y, bounds.width, bounds.height);

            myTurtle.startBlock = startBlock;
            if (startBlock !== null) {
                myTurtle.decorationBitmap = myTurtle.bitmap.clone();
                startBlock.container.addChild(myTurtle.decorationBitmap);
                myTurtle.decorationBitmap.name = 'decoration';
                bounds = startBlock.container.getBounds();
                myTurtle.decorationBitmap.x = bounds.width - 30 * startBlock.protoblock.scale / 2;
                myTurtle.decorationBitmap.y = 35 * startBlock.protoblock.scale / 2;
                myTurtle.decorationBitmap.scaleX = myTurtle.decorationBitmap.scaleY = myTurtle.decorationBitmap.scale = 0.5 * startBlock.protoblock.scale / 2;
                startBlock.container.updateCache();
            }

            me.refreshCanvas();
        }

        makeTurtleBitmap(this, TURTLESVG.replace(/fill_color/g, FILLCOLORS[i]).replace(/stroke_color/g, STROKECOLORS[i]), 'turtle', processTurtleBitmap, startBlock);

        myTurtle.color = i * 10;
        myTurtle.canvasColor = getMunsellColor(myTurtle.color, DEFAULTVALUE, DEFAULTCHROMA);

        var turtles = this;

        myTurtle.container.on('mousedown', function(event) {
            if (turtles.rotating) {
                return;
            }

            var offset = {
                x: myTurtle.container.x - event.stageX,
                y: myTurtle.container.y - event.stageY
            };

            myTurtle.container.on('pressup', function(event) {
                myTurtle.bitmap.scaleX = 1;
                myTurtle.bitmap.scaleY = 1;
                myTurtle.bitmap.scale = 1;
                turtles.refreshCanvas();
            });

            myTurtle.container.on('pressmove', function(event) {
                if (turtles.rotating) {
                    return;
                }
                myTurtle.container.x = event.stageX + offset.x;
                myTurtle.container.y = event.stageY + offset.y;
                myTurtle.x = turtles.screenX2turtleX(myTurtle.container.x);
                myTurtle.y = turtles.screenY2turtleY(myTurtle.container.y);
                turtles.refreshCanvas();
            });
        });

        myTurtle.container.on('click', function(event) {
            var fromX, fromY;

            // If turtles listen for clicks then they can be used as buttons.
            turtles.stage.dispatchEvent('click' + myTurtle.name);

            myTurtle.container.on('mousedown', function(event) {
                // Rotation interferes with button click events.
                // turtles.rotating = true;
                fromX = event.stageX;
                fromY = event.stageY;
            }, null, true);  // once = true

            myTurtle.container.on('pressmove', function(event) {
                if (turtles.rotating && fromX !== undefined) {
                    var rad = Math.atan2(fromY - event.stageY, fromX - event.stageX);
                    var deg = rad * 180 / Math.PI - 90;
                    deg %= 360;

                    // Only rotate if there is a more than 1/2 deg difference
                    if (Math.abs(deg - myTurtle.orientation) > 0.5) {
                        myTurtle.doSetHeading(deg);
                        turtles.refreshCanvas();
                    }
                }
            });

            myTurtle.container.on('pressup', function(event) {
                turtles.rotating = false;
            });
        });

        myTurtle.container.on('mouseover', function(event) {
            myTurtle.bitmap.scaleX = 1.2;
            myTurtle.bitmap.scaleY = 1.2;
            myTurtle.bitmap.scale = 1.2;
            turtles.refreshCanvas();
        });

        myTurtle.container.on('mouseout', function(event) {
            myTurtle.bitmap.scaleX = 1;
            myTurtle.bitmap.scaleY = 1;
            myTurtle.bitmap.scale = 1;
            turtles.refreshCanvas();
        });

        document.getElementById('loader').className = '';
        setTimeout(function() {
            if (blkInfoAvailable) {
                myTurtle.doSetHeading(infoDict.heading);
                myTurtle.doSetPensize(infoDict.pensize);
                myTurtle.doSetChroma(infoDict.grey);
                myTurtle.doSetValue(infoDict.shade);
                myTurtle.doSetColor(infoDict.color);
            }
        }, 1000);
        this.refreshCanvas();
    };

    this.screenX2turtleX = function(x) {
        return x - (this.canvas.width / (2.0 * this.scale));
    };

    this.screenY2turtleY = function(y) {
        return this.invertY(y);
    };

    this.turtleX2screenX = function(x) {
        return (this.canvas.width / (2.0 * this.scale)) + x;
    };

    this.turtleY2screenY = function(y) {
        return this.invertY(y);
    };

    this.invertY = function(y) {
        return this.canvas.height / (2.0 * this.scale) - y;
    };

    this.markAsStopped = function() {
        for (var turtle in this.turtleList) {
            this.turtleList[turtle].running = false;
        }
    };

    this.running = function() {
        for (var turtle in this.turtleList) {
            if (this.turtleList[turtle].running) {
                return true;
            }
        }
        return false;
    };
}

// Queue entry for managing running blocks.
function Queue (blk, count, parentBlk) {
    this.blk = blk;
    this.count = count;
    this.parentBlk = parentBlk;
}


function makeTurtleBitmap(me, data, name, callback, extras) {
    // Async creation of bitmap from SVG data
    // Works with Chrome, Safari, Firefox (untested on IE)
    var img = new Image();
    img.onload = function () {
        complete = true;
        bitmap = new createjs.Bitmap(img);
        callback(me, name, bitmap, extras);
    };
    img.src = 'data:image/svg+xml;base64,' + window.btoa(
        unescape(encodeURIComponent(data)));
}



/*Helper Functions*/

//Put these functions in the utils directory 
//Rotation about the arbitary axis
var rotObjectMatrix;
function rotateAroundObjectAxis(object, axis, radians) {
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
    object.matrix.multiply(rotObjectMatrix);
    object.rotation.setFromRotationMatrix(object.matrix);
}

//rotation about world axis
var rotWorldMatrix;
function rotateAroundWorldAxis(object, axis, radians) {
    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(object.matrix); 
    object.matrix = rotWorldMatrix;
    object.rotation.setFromRotationMatrix(object.matrix);
}
