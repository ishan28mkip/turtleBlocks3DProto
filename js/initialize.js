//Initialize three.js


/*Developer Comment*/
/*
1. Code needs to be organized in separate files.
2. A proper method needs to be found out for graphical scripting.
*/

/*Code to deal with the button*/
expandButton = document.getElementById('expandButton');
collapseButton = document.getElementById('collapseButton');
codeWindow = document.getElementById('codeWindow');
codeArea = document.getElementById('codeArea');
submitCode = document.getElementById('submitCode');
usageGuideBlock = document.getElementById('usageGuideBlock');
usageGuide = document.getElementById('usageGuide');

var mode = window.prompt('Enter into Character input(0) mode OR Enter into Manual keyboard mode(1)');
if(mode===null)
	mode=0;
if(mode==0){
	usageGuide.innerHTML = '<li>Currently this is a very crude implementation of the functionalities using the eval function, would be changed in the next iteration.<li>All the functions and their usages are listed below<li><b>shiftCursorPositionX(direction),Y,Z</b> shifts the cursor, direction specifies positive or negative direction<li><b>createCurrentObjectAtCursor()</b> inserts block at current location<li><b>setRoll(degree), Pitch, Yaw</b> set the rotation attributes<li><b>rotateRoll(direction),Pitch, Yaw</b> rotate in particular direction<li><b>positionStepX ,Y,Z</b> variable values can be modified<li><b>rotationStepRoll, Pitch, Yaw</b> variable values can be modified';
	codeArea.value = 'var blockInterval = setInterval(xyz,50); \n var i = 0; \n function xyz(){ \n i++; \n shiftCursorPositionX(1); \n rotateYaw(1);\n rotatePitch(-1);\n createCurrentObjectAtCursor();\n if(i>200)\n  clearInterval(blockInterval);\n }';
}
else if(mode==1){
	codeArea.style.display = 'none';
	submitCode.style.display = 'none';
	usageGuideBlock.style.top = '10%';
	usageGuide.innerHTML = '<li>Use Arrow Keys to move in the X-Y directions<li>Use "]" to move positive z axis & "[" to move in the negative z<li>"i" to insert Block<li>"r" to set roll<li>"p" to set pitch<li>"y" to set yaw<li>"c" to set color';
	document.onkeydown = function(e) {
	    e = e || window.event;
	    switch(e.which || e.keyCode) {
	    	case 37: // left : move cursor along negative x axis
	    	shiftCursorPositionX(-1);
	        break;

	        case 38: // up : move cursor along positive y axis
	        shiftCursorPositionY(1);
	        break;


	        case 39: // right : move cursor along positive x axis
	        shiftCursorPositionX(1);
	        break;

	        case 40: // down : move cursor along negative y axis
	        shiftCursorPositionY(-1);
	        break;

	        case 221: // ] key : positive z axis
	        shiftCursorPositionZ(1);
	        break;

	        case 219: // [ key : negative z axis
	        shiftCursorPositionZ(-1);
	        break;

	        case 73: // i to insert block
	        createCurrentObjectAtCursor();
	        break;

	        case 82: //rolls r
	        setRoll(window.prompt('Enter Roll(Degrees)','0'));
	        break;

	        case 80: //pitch p
	        setPitch(window.prompt('Enter Pitch(Degrees)','0'));
	        break;

	        case 89: //yaw y
	        setYaw(window.prompt('Enter Yaw(Degrees)','0'));
	        break;

	        case 67: //Color c
	        changeBlockColor(window.prompt('Enter Color(hex)','0x444444'),'hex');
	        break;

	        default: return;
	    }
	    e.preventDefault(); 
	};
}

//Attaching the handler to expand button.
if (expandButton.addEventListener) {
	expandButton.addEventListener("click", clickExpandButton, false);
} 
else {
    expandButton.attachEvent('onclick', clickExpandButton);
}  

//Attaching the handler to collapse button.
if (collapseButton.addEventListener) {
	collapseButton.addEventListener("click", clickCollapseButton, false);
} 
else {
    collapseButton.attachEvent('onclick', clickCollapseButton);
}

//Attaching the handler to codeArea
if (codeArea.addEventListener) {
	codeArea.addEventListener("click", clickCodeArea, false);
} 
else {
    codeArea.attachEvent('onclick', clickCodeArea);
}

//Attaching the handler to submitCode
if (submitCode.addEventListener) {
	submitCode.addEventListener("click", clickSubmitCode, false);
} 
else {
    submitCode.attachEvent('onclick', clickSubmitCode);
}

function clickExpandButton(){
	expandButton.style.display = 'none';
	collapseButton.style.display = 'block';
	codeWindow.style.width = '80%';

}

function clickCollapseButton(){
	expandButton.style.display = 'block';
	collapseButton.style.display = 'none';
	codeWindow.style.width = '20%';
}

function clickCodeArea(){
	codeArea.focus();
}

function clickSubmitCode(){
	eval(codeArea.value);
}



/* Values */

xPosValue = document.getElementById('xPos');
yPosValue = document.getElementById('yPos');
zPosValue = document.getElementById('zPos');
xStepValue = document.getElementById('xStep');
yStepValue = document.getElementById('yStep');
zStepValue = document.getElementById('zStep');
rollValue = document.getElementById('roll');
pitchValue = document.getElementById('pitch');
yawValue = document.getElementById('yaw');
rollStepValue = document.getElementById('rollStep');
pitchStepValue = document.getElementById('pitchStep');
yawStepValue = document.getElementById('yawStep');
blockColorValue = document.getElementById('blockColor');

/*Remove when not required */

/*Initialize the Code



/*Global Setting Variable defined*/
var scene,camera,renderer,controls;

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

var positionStepX = 0.5; //Change with which the position 
var positionStepY = 0.5; //Change with which the position 
var positionStepZ = 0.5; //Change with which the position 

cursorAxisX.multiplyScalar(positionStepX);
cursorAxisY.multiplyScalar(positionStepY);
cursorAxisZ.multiplyScalar(positionStepZ);

var currentRotationRoll = 0;
var currentRotationPitch = 0; 
var currentRotationYaw  = 0;

var rotationStepRoll = 5; //In degrees
var rotationStepPitch = 5;
var rotationStepYaw = 5;

var blockType = 0;
var blockColor = new THREE.Color(0x2244ff);

init();
animate();



function init(){
	//Basic Config Settings
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight, 0.1, 1000);
	renderer = new THREE.WebGLRenderer({ antialias: true });
	//Adds the ability to pan, zoom, rotate
	controls = new THREE.TrackballControls( camera );
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	/*Controls Basic Settings*/
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;

	controls.noZoom = false;
	controls.noPan = false;

	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

	controls.keys = [ 65, 83, 68 ];
	controls.addEventListener( 'change', render );


	//Background box Initialization
	var skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
	var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.BackSide });
	skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
	scene.add(skybox);

	/*Basic Geometry Initializations*/

	//Initialize a basic plane of reference
	var basicPlaneGeometry = new THREE.PlaneBufferGeometry(50,50);
	var basicPlaneMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
	basicPlane = new THREE.Mesh(basicPlaneGeometry,basicPlaneMaterial);
	scene.add(basicPlane);

	//Initialization of current object to be put at place
	basicBlockGeometry = new THREE.BoxGeometry(1,1,1);
	basicBlockMaterial = new THREE.MeshLambertMaterial({color: blockColor.getHex()});

	//axes helper
	
	var axislength = 8;
	axesHelper = new THREE.Object3D();
	axesHelper.add(new THREE.ArrowHelper(axisX, initialCursorPosition, axislength, 0xff0000, 1, 1), new THREE.ArrowHelper(axisY, initialCursorPosition, axislength, 0x00ff00, 1, 1),new THREE.ArrowHelper(axisZ, initialCursorPosition, axislength, 0x0000ff, 1, 1));
	scene.add(axesHelper);

	/*Light Source Initialization*/

	pointLights.push(new THREE.PointLight(0xffffff));
	pointLights[0].position.set(50, 50, 50);
	scene.add(pointLights[0]);

	/*
	pointLights.push(new THREE.PointLight(0xffffff));
	pointLights[1].position.set(100, 100, 100);
	scene.add(pointLights[1]);*/


	//Initialize Camera Position
	camera.position.z=100;
	render();
}

//Request Animation Frame Loop
function animate() {
	requestAnimationFrame( animate );
	controls.update();
}

function render() {
	//Scene Renderer
	renderer.render( scene, camera );
	updateValues();
}

function updateValues(){
xPosValue.innerHTML = currentCursorPosition.x;
yPosValue.innerHTML = currentCursorPosition.y;
zPosValue.innerHTML = currentCursorPosition.z;
xStepValue.innerHTML = positionStepX;
yStepValue.innerHTML = positionStepY;
zStepValue.innerHTML = positionStepZ;
rollValue.innerHTML = currentRotationRoll;
pitchValue.innerHTML = currentRotationPitch;
yawValue.innerHTML = currentRotationYaw;
rollStepValue.innerHTML = rotationStepRoll;
pitchStepValue.innerHTML = rotationStepPitch;
yawStepValue.innerHTML = rotationStepYaw;
blockColorValue.innerHTML = blockColor.getStyle();
}


//Create the current object

function createCurrentObjectAtCursor(){
	switch (blockType){
		case 0: basicBlocks.push(new THREE.Mesh(basicBlockGeometry,basicBlockMaterial)); 
		break;
		default : basicBlocks.push(new THREE.Mesh(basicBlockGeometry,basicBlockMaterial));
	}
	scene.add(basicBlocks[basicBlocks.length-1]);
	basicBlocks[basicBlocks.length-1].position.copy(currentCursorPosition);
	//Rotate the block to match the orientation of the axis
	rotateAroundObjectAxis(basicBlocks[basicBlocks.length-1],cursorAxisX,currentRotationRoll*Math.PI/180);
	rotateAroundObjectAxis(basicBlocks[basicBlocks.length-1],cursorAxisY,currentRotationPitch*Math.PI/180);
	rotateAroundObjectAxis(basicBlocks[basicBlocks.length-1],cursorAxisZ,currentRotationYaw*Math.PI/180);
	render();
}

function changeBlockColor(color,type){
	switch (type){
		case 'hex' : 
			blockColor.setHex(color);
			basicBlockMaterial.color.setHex(color);
			break;
		case 'rgb' : 
			blockColor.setRGB(color.r,color.g,color.b);
			basicBlockMaterial.color.setRGB(color.r,color.g,color.b);
			break;
		case 'hsl' : 
			blockColor.setHSL(color.h,color.s,color.l);
			basicBlockMaterial.color.setHSL(color.h,color.s,color.l);
			break;
		default:
			blockColor.setHex(color);
	}
}


/*Manipulating Cursor Positions*/

function newCursorPostion(x,y,z){
	currentCursorPosition.set(x,y,z);
	axesHelper.position.set(x,y,z);
	render();
}

function newCursorPositionX(x){
	currentCursorPosition.setX(x);
	axesHelper.position.setX(x);
	render();
}

function newCursorPositionY(y){
	currentCursorPosition.setY(y);
	axesHelper.position.setY(y);
	render();
}

function newCursorPositionZ(z){
	currentCursorPosition.setZ(z);
	axesHelper.position.setZ(z);
	render();
}

function shiftCursorPositionX(direction){
	if(direction==1){
		axesHelper.position.addVectors(currentCursorPosition,cursorAxisX);
		currentCursorPosition.addVectors(currentCursorPosition,cursorAxisX);
	}
	else if(direction==-1){
		axesHelper.position.subVectors(currentCursorPosition,cursorAxisX);
		currentCursorPosition.subVectors(currentCursorPosition,cursorAxisX);
	}
	render();
}

function shiftCursorPositionY(direction){
	if(direction==1){
		axesHelper.position.addVectors(currentCursorPosition,cursorAxisY);
		currentCursorPosition.addVectors(currentCursorPosition,cursorAxisY);
	}
	else if(direction==-1){
		axesHelper.position.subVectors(currentCursorPosition,cursorAxisY);
		currentCursorPosition.subVectors(currentCursorPosition,cursorAxisY);
	}
	render();
}

function shiftCursorPositionZ(direction){
	if(direction==1){
		axesHelper.position.addVectors(currentCursorPosition,cursorAxisZ);
		currentCursorPosition.addVectors(currentCursorPosition,cursorAxisZ);
	}
	else if(direction==-1){
		axesHelper.position.subVectors(currentCursorPosition,cursorAxisZ);
		currentCursorPosition.subVectors(currentCursorPosition,cursorAxisZ);
	}
	render();
}

/*Cursor Position Manipulation End*/


/*Rotation Fuctions*/

function setRoll(degrees){
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
	render();
}

function setPitch(degrees){
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
	render();
}

function setYaw(degrees){
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
	render();
}

function rotateRoll(direction){
	if(direction==1){
		rotateAroundObjectAxis(axesHelper,cursorAxisX,rotationStepRoll*Math.PI/180);
		cursorAxisY.applyAxisAngle(cursorAxisX.normalize(),rotationStepRoll*Math.PI/180);
		cursorAxisZ.applyAxisAngle(cursorAxisX.normalize(),rotationStepRoll*Math.PI/180);
		if(currentRotationRoll + rotationStepRoll >= 360)
			currentRotationRoll = currentRotationRoll + rotationStepRoll - 360;
		else
			currentRotationRoll += rotationStepRoll;
	}
	else if(direction==-1){
		rotateAroundObjectAxis(axesHelper,cursorAxisX,-rotationStepRoll*Math.PI/180);
		cursorAxisY.applyAxisAngle(cursorAxisX.normalize(),-rotationStepRoll*Math.PI/180);
		cursorAxisZ.applyAxisAngle(cursorAxisX.normalize(),-rotationStepRoll*Math.PI/180);
		if(currentRotationRoll - rotationStepRoll < 0)
			currentRotationRoll =  currentRotationRoll - rotationStepRoll + 360;
		else
			currentRotationRoll -= rotationStepRoll;
	}
	render();
}

function rotatePitch(direction){
	if(direction==1){
		rotateAroundObjectAxis(axesHelper,cursorAxisY,rotationStepPitch*Math.PI/180);
		cursorAxisX.applyAxisAngle(cursorAxisY.normalize(),rotationStepPitch*Math.PI/180);
		cursorAxisZ.applyAxisAngle(cursorAxisY.normalize(),rotationStepPitch*Math.PI/180);
		if(currentRotationPitch + rotationStepPitch >= 360)
			currentRotationPitch = currentRotationPitch + rotationStepPitch - 360;
		else	
			currentRotationPitch += rotationStepPitch;
	}
	else if(direction==-1){
		rotateAroundObjectAxis(axesHelper,cursorAxisY,-rotationStepPitch*Math.PI/180);
		cursorAxisX.applyAxisAngle(cursorAxisY.normalize(),-rotationStepPitch*Math.PI/180);
		cursorAxisZ.applyAxisAngle(cursorAxisY.normalize(),-rotationStepPitch*Math.PI/180);
		if(currentRotationPitch - rotationStepPitch < 0)
			currentRotationPitch = currentRotationPitch - rotationStepPitch + 360;
		else
			currentRotationPitch -= rotationStepPitch;
	}
	render();
}

function rotateYaw(direction){
	if(direction==1){
		rotateAroundObjectAxis(axesHelper,cursorAxisZ,rotationStepYaw*Math.PI/180);
		cursorAxisX.applyAxisAngle(cursorAxisZ.normalize(),rotationStepYaw*Math.PI/180);
		cursorAxisY.applyAxisAngle(cursorAxisZ.normalize(),rotationStepYaw*Math.PI/180);
		if(currentRotationYaw + rotationStepYaw >= 360)
			currentRotationYaw = currentRotationYaw + rotationStepYaw - 360;
		else
			currentRotationYaw += rotationStepYaw;
	}
	else if(direction==-1){
		rotateAroundObjectAxis(axesHelper,cursorAxisZ,-rotationStepYaw*Math.PI/180);
		cursorAxisX.applyAxisAngle(cursorAxisZ.normalize(),-rotationStepYaw*Math.PI/180);
		cursorAxisY.applyAxisAngle(cursorAxisZ.normalize(),-rotationStepYaw*Math.PI/180);
		if(currentRotationYaw - rotationStepYaw < 0)
			currentRotationYaw = currentRotationYaw - rotationStepYaw + 360;
		else
			currentRotationYaw -= rotationStepYaw;
	}
	render();
}



/*Helper Functions*/

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

