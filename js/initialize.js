//Initialize three.js



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
var cursorRotationAxis = new THREE.Vector3();
cursorRotationAxis.addVectors(initialCursorPosition,currentCursorPosition); //Cursor Rotation axis is always the sum of initial cursor position
var cursorRotationAngle = 0; //Set in Radians
var positionStep = 0.5; //Change with which the position 
var rotationStep = 5; //In degrees
var blockColor = 0x444444;

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
	var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.BackSide });
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
	basicBlockMaterial = new THREE.MeshLambertMaterial({color: blockColor});

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
	//rotateAroundObjectAxis(axesHelper,cursorRotationAxis,Math.PI*1/180);
	requestAnimationFrame( animate );
	controls.update();
}

function render() {
	//Scene Renderer
	renderer.render( scene, camera );
}


function createCurrentObjectAtCursor(){
	basicBlocks.push(new THREE.Mesh(basicBlockGeometry,basicBlockMaterial));
	scene.add(basicBlocks[basicBlocks.length-1]);
	basicBlocks[basicBlocks.length-1].position.copy(currentCursorPosition);
	rotateAroundObjectAxis(basicBlocks[basicBlocks.length-1],cursorRotationAxis,cursorRotationAngle);
	render();
}

/*Manipulating Cursor Positions, Needs refactoring very repetitive*/

function newCursorPostion(x,y,z){
	currentCursorPosition.set(x,y,z);
	axesHelper.position.set(x,y,z);
	cursorRotationAxis.addVectors(initialCursorPosition,currentCursorPosition);
	render();
}

function newCursorPositionX(x){
	currentCursorPosition.setX(x);
	axesHelper.position.setX(x);
	cursorRotationAxis.addVectors(initialCursorPosition,currentCursorPosition);
	render();
}

function newCursorPositionY(y){
	currentCursorPosition.setY(y);
	axesHelper.position.setY(y);
	cursorRotationAxis.addVectors(initialCursorPosition,currentCursorPosition);
	render();
}

function newCursorPositionZ(z){
	currentCursorPosition.setZ(z);
	axesHelper.position.setZ(z);
	cursorRotationAxis.addVectors(initialCursorPosition,currentCursorPosition);
	render();
}

function shiftCursorPositionX(x){
	axesHelper.position.setX(x+currentCursorPosition.x);
	currentCursorPosition.setX(x+currentCursorPosition.x);
	cursorRotationAxis.addVectors(initialCursorPosition,currentCursorPosition);
	render();
}

function shiftCursorPositionY(y){
	axesHelper.position.setY(y+currentCursorPosition.y);
	currentCursorPosition.setY(y+currentCursorPosition.y);
	cursorRotationAxis.addVectors(initialCursorPosition,currentCursorPosition);
	render();
}

function shiftCursorPositionZ(z){
	axesHelper.position.setZ(z+currentCursorPosition.z);
	currentCursorPosition.setZ(z+currentCursorPosition.z);
	cursorRotationAxis.addVectors(initialCursorPosition,currentCursorPosition);
	render();
}

/*Cursor Position Manipulation End*/


//Angle specified in degrees  
function changeRotationAngle(angle){ 
	currentRotationAngle = angle*Math.PI/180;
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


//Keys to add a object
document.onkeydown = function(e) {
    e = e || window.event;
    switch(e.which || e.keyCode) {
    	case 37: // left : move cursor along negative x axis
    	shiftCursorPositionX(-positionStep);
        break;

        case 38: // up : move cursor along positive y axis
        shiftCursorPositionY(positionStep);
        break;


        case 39: // right : move cursor along positive x axis
        shiftCursorPositionX(positionStep);
        break;

        case 40: // down : move cursor along negative y axis
        shiftCursorPositionY(-positionStep);
        break;

        case 221: // ] key : positive z axis
        shiftCursorPositionZ(positionStep);
        break;

        case 219: // [ key : negative z axis
        shiftCursorPositionZ(-positionStep);
        break;

        case 73: // i to insert block
        createCurrentObjectAtCursor();
        break;

        default: return;
    }
    e.preventDefault(); 
};
