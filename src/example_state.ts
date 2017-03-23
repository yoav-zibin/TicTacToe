// using shortcuts
var Engine = Matter.Engine,
    Render = <any>Matter.Render,
    Runner = Matter.Runner,
    Composites = Matter.Composites,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Query = Matter.Query,
    Svg = Matter.Svg,
    Bodies = Matter.Bodies;

// Globals
var _engine = Engine.create(),
    _world = _engine.world;
var _render = Render.create({
    element: document.getElementById("canvas-container"),
    engine: _engine,
    options: {
        height: 550,
        width: 410,
    }
});
var _renderLength = 0.0; // the guideline length
var _didMakeMove = false;
var _didSendMove = false;

function shootClick(cueBall : Matter.Body) {
    //if (!isHumanTurn()) return;
    if (_didMakeMove) return;
    _didMakeMove = true;
    let forcePosition : Matter.Vector = {
        x: cueBall.position.x + 1.0 * Math.cos(cueBall.angle),
        y: cueBall.position.y + 1.0 * Math.sin(cueBall.angle)
    };
    let force : number = _renderLength * 0.0008;

    console.log("force pos: ", forcePosition);
    console.log("render len: ", _renderLength);

    Matter.Body.applyForce(cueBall, forcePosition, 
    {
        x: force * cueBall.mass * Math.cos(cueBall.angle),
        y: force * cueBall.mass * Math.sin(cueBall.angle)
    });

    // reset render len
    _renderLength = 0.0;
    _engine.enableSleeping = true;
}

function isWorldSleeping(world : Matter.World):boolean {
    let bodies = Matter.Composite.allBodies(world);
    let sleeping = bodies.filter((body) => body.isSleeping);
    let isWorldSleeping = bodies.length === sleeping.length;
    return isWorldSleeping;
}

// helper method to get distance between 2 vectors
function distanceBetweenVectors(vec1 : Matter.Vector, vec2 : Matter.Vector) :number {
    let xsq = Math.pow(vec1.x - vec2.x, 2);
    let ysq = Math.pow(vec1.y - vec2.y, 2);
    return Math.sqrt(xsq + ysq);
}

_engine.world.gravity.y = 0;
let renderOptions = <any>_render.options;
renderOptions.wireframes = false;
renderOptions.background = 'green';

// create terrain (table frames)
World.add(_world, [
    // left
    Bodies.rectangle(30, 150, 5, 210, { isStatic: true, render: <any>{ fillStyle: '#825201', strokeStyle: 'black' } }),
    Bodies.rectangle(30, 400, 5, 210, { isStatic: true, render: <any>{ fillStyle: '#825201', strokeStyle: 'black' } }),
    // top
    Bodies.rectangle(205, 20, 305, 5, { isStatic: true, render: <any>{ fillStyle: '#825201', strokeStyle: 'black' } }),
    // bottom
    Bodies.rectangle(205, 530, 305, 5, { isStatic: true, render: <any>{ fillStyle: '#825201', strokeStyle: 'black' } }),
    // right
    Bodies.rectangle(380, 150, 5, 210, { isStatic: true, render: <any>{ fillStyle: '#825201', strokeStyle: 'black' } }),
    Bodies.rectangle(380, 400, 5, 210, { isStatic: true, render: <any>{ fillStyle: '#825201', strokeStyle: 'black' } }),
]);

// create pockets
World.add(_world, [
    // top-left
    Bodies.circle(20, 15, 31, { isStatic: true, render: <any>{ fillStyle: 'black' } }),
    // top-right
    Bodies.circle(390, 15, 31, { isStatic: true, render: <any>{ fillStyle: 'black' } }),
    // left
    Bodies.circle(5, 275, 31, { isStatic: true, render: <any>{ fillStyle: 'black' } }),
    // right
    Bodies.circle(405, 275, 31, { isStatic: true, render: <any>{ fillStyle: 'black' } }),
    // bottom-left
    Bodies.circle(20, 535, 31, { isStatic: true, render: <any>{ fillStyle: 'black' } }),
    // bottom-right
    Bodies.circle(390, 535, 31, { isStatic: true, render: <any>{ fillStyle: 'black' } }),
]);

// bunch of game play constants
module GameplayConsts {
    export const CollisionCategoryCue = 0x0001;
    export const CollisionCategoryNormalBalls = 0x0002;
    export const CollisionMaskAllBalls = 0x0003;
    export const CollisionMaskCueOnly = 0x0001;

    export const BallRestitution = 0.9;
    export const BallFriction = 0.01;

    export const BallRadius = 10.0;
    export const TextureSize = 256.0; // texture is 256x256
};

// create ball bodies
let textureScale = GameplayConsts.BallRadius * 2 / GameplayConsts.TextureSize;

let cueBall = Bodies.circle(100, 350, 10, <any>{
    isStatic: false,
    collisionFilter: { category: GameplayConsts.CollisionCategoryCue, mask: GameplayConsts.CollisionMaskAllBalls },
    restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
    render: { fillStyle: 'white', strokeStyle: 'black' }
});

World.add(_world, [
    // cue
    cueBall,
    // eight ball
    Bodies.circle(130, 160, 10, <any>{
        isStatic: false,
        collisionFilter: { category: GameplayConsts.CollisionCategoryNormalBalls, mask: GameplayConsts.CollisionMaskAllBalls },
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
        render: { sprite: { texture: 'imgs/8.png', xScale: textureScale, yScale: textureScale } }
    }),
    // a solid ball #4
    Bodies.circle(350, 500, 10, <any>{
        isStatic: false,
        collisionFilter: { category: GameplayConsts.CollisionCategoryNormalBalls, mask: GameplayConsts.CollisionMaskAllBalls },
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
        render: { sprite: { texture: 'imgs/4.png', xScale: textureScale, yScale: textureScale } }
    }),
    // a striped ball #10
    Bodies.circle(100, 200, 10, <any>{
        isStatic: false,
        collisionFilter: { category: GameplayConsts.CollisionCategoryNormalBalls, mask: GameplayConsts.CollisionMaskAllBalls },
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
        render: { sprite: { texture: 'imgs/10.png', xScale: textureScale, yScale: textureScale } }
    }),
]);

let mouse = Mouse.create(_render.canvas),
    mouseConstraint = (<any>MouseConstraint).create(_engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });
mouseConstraint.collisionFilter.mask = 0x0000;

World.add(_world, mouseConstraint);

// EVENT: set angle and _renderLength on mousemove
Matter.Events.on(mouseConstraint, 'mousemove', function (event) {
    // This function sets the angle and _renderLength
    let mousePosition = event.mouse.position;
    let cuePosition = cueBall.position;

    let horizontalDistance = cuePosition.x - mousePosition.x;
    let verticalDistance = cuePosition.y - mousePosition.y;

    let angle = Math.atan2(verticalDistance, horizontalDistance);

    _renderLength = Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance);
    Matter.Body.setAngle(cueBall, angle);
});
// EVENT: shoot cue ball on mouseup
Matter.Events.on(mouseConstraint, 'mouseup', function (event) {
    let mouseUpPosition = <Matter.Vector>event.mouse.mouseupPosition;
    let cuePosition = cueBall.position;
    // only shoot cue ball when the mouse is around the cue ball
    let dist = distanceBetweenVectors(mouseUpPosition, cuePosition);
    let distLimit = GameplayConsts.BallRadius * 10;
    console.log("dist ", dist, " limit ", distLimit);
    if (dist < distLimit) {
        shootClick(cueBall);
    }
});
// EVENT: update
Matter.Events.on(_render, 'afterRender', function() {
    if (_didMakeMove && !_didSendMove && isWorldSleeping(_world)) {
        _didSendMove = true;
        // send the move over network here
        console.log("player's turn is done");
    }
});

Render.run(_render);
Engine.run(_engine);
