Turtle Art 3D Javascript Prototype
==================================

A 3D, javascript/WebGL based implementation of the turtle Blocks Activity.

How to run
----------

### Modes

On running the prototype there is a prompt for the mode of execution. 0 : CUI mode, 1 : Manual Mode. In the CUI mode the code can be written text area which will be excuted. While in the Manual mode keys control the cursor, its rotation and block placement.

### CUI mode

Chose 0 in the initial prompt.

List of Variables that can be modified
---------------------------------------
1. `positionStepX` : Changes the step value for the cursor movement along X axis `(Pixels)`.
1. `positionStepY` : Changes the step value for the cursor movement along Y axis `(Pixels)`.
1. `positionStepZ` : Changes the step value for the cursor movement along Z axis `(Pixels)`.
1. `rotationStepRoll` : Changes the step rotation value of the roll. `(Degrees)` 
1. `rotationStepPitch` : Changes the step rotation value of the pitch. `(Degrees)` 
1. `rotationStepYaw` : Changes the step rotation value of the yaw. `(Degrees)` 


List of Supported Commands
--------------------------

1. `shiftCursorPositionX(direction)` ; Move `positionStepX` distance about its x axis direction. direction `1` would be positive x axis, `-1` would be negative x axis. Similar commands exist for Y & Z axis.
1. `setRoll(degree)` ; Specify the value of roll in `degrees`. Similar commands exist for setting Pitch, Yaw.
1. `rotateRoll(degree)` ; Roll the cursor/object `rotationStepRoll` degree. Similar commands exist for incrementing or decrementing the Pitch and Yaw.
1. `CreateCurrentObjectAtCursor` ; inserts the current block (material & geometry) selected at the centre and in the orientation of the cursor.

Examples
--------

An example is already present in the text area when the website loads.

Screenshots
-----------

Sample Screenshots

![Helix](http://i.imgur.com/5R0QHVw.png)

---

![Circle](http://i.imgur.com/Ckex45l.png)


Problems
--------

1. The script text area is given eval access. This leads to big security concerns. Next iteration would lead to a better implementation without eval.
1. Graphical Scripting is not yet implemented.

### Manual Mode

Chose 1 in the initial prompt.

List of commands that are available
------------------------------------
1. `Arrow keys` to move in the X-Y plane.
1. `]` key to move in the positive z direction & `[` to move in the negative z direction.
1. `r` to set the roll.
1. `p` to set the pitch.
1. `y` to set the yaw.
1. `i` to insert block at the current position.
