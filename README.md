Poco
==========

Polygon Collision detection and simulation

#Usage
```javascript
// init the world
var wrold = new Poco.World({
    kTimeStep: 1/60, //time step : default 1/60
    kGravity: 25,    //Gravity of world: default: 25
    kFriction: 0.3   // Friction of objects: default: 0.3
});

// add objects
var ployA = new Poco.Polygon({
    pos: [100, 200],      //Array: initial position of poly,
    points: [[-100, -100], [-100, 100], [100, 100], [100, -100]], //Array: initial vertexes of polygon, should be Counterclockwise order
    invMass: 20, // inverse inertia tensor of object, default: the area of poly
    angularVel: 0, // rotate velocity of poly; default: 0
    angle: 0,      // initial rotate angle of poly; default: 0
    vel: [0, 0]    // initial velocity; default: [0,0]
});

var floor = new Poco.Polygon({
    pos: [0, 1000],
    points: [[-500, 0], [-500, -1], [500, 1], [500, 0]],
    invMass: 0
});

world.addObject(polyA);
world.addObject(floor);


function run () {
    ... // sth. like clean();
    world.step();
    ... // sth. like draw();
    
    requestAnimationFrame(run);
}

run();

```

#Examples

    