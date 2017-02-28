
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

var engine = Engine.create(),
    world = engine.world;

var render = Render.create({
    element: document.getElementById("canvas-container"),
    engine: engine,
    options: {
        height: 550,
        width: 410,
    }
});

engine.world.gravity.y = 0;
let renderOptions = <any>render.options;
renderOptions.wireframes = false;
renderOptions.background = 'green';

// create terrain (table frames)
World.add(world, [
    // left
    Bodies.rectangle(30, 150, 5, 210, {isStatic: true, render: <any>{fillStyle:'#825201', strokeStyle:'black'}}),
    Bodies.rectangle(30, 400, 5, 210, {isStatic: true, render: <any>{fillStyle:'#825201', strokeStyle:'black'}}),
    // top
    Bodies.rectangle(205, 20, 305, 5, {isStatic: true, render: <any>{fillStyle:'#825201', strokeStyle:'black'}}),
    // bottom
    Bodies.rectangle(205, 530, 305, 5, {isStatic: true, render: <any>{fillStyle:'#825201', strokeStyle:'black'}}),
    // right
    Bodies.rectangle(380, 150, 5, 210, {isStatic: true, render: <any>{fillStyle:'#825201', strokeStyle:'black'}}),
    Bodies.rectangle(380, 400, 5, 210, {isStatic: true, render: <any>{fillStyle:'#825201', strokeStyle:'black'}}),
]);

// create pockets
World.add(world, [
    // top-left
    Bodies.circle(20, 15, 31, {isStatic: true, render: <any>{fillStyle:'black'}}),
    // top-right
    Bodies.circle(390, 15, 31, {isStatic: true, render: <any>{fillStyle:'black'}}),
    // left
    Bodies.circle(5, 275, 31, {isStatic: true, render: <any>{fillStyle:'black'}}),
    // right
    Bodies.circle(405, 275, 31, {isStatic: true, render: <any>{fillStyle:'black'}}),
    // bottom-left
    Bodies.circle(20, 535, 31, {isStatic: true, render: <any>{fillStyle:'black'}}),
    // bottom-right
    Bodies.circle(390, 535, 31, {isStatic: true, render: <any>{fillStyle:'black'}}),
]);

// bunch of game play constants
module GameplayConsts {
    export const CollisionCategoryCue = 0x0001;
    export const CollisionCategoryNormalBalls = 0x0002;
    export const CollisionMaskAllBalls = 0x0003;
    export const CollisionMaskCueOnly = 0x0001;

    export const BallRestitution = 0.9;
    export const BallFriction = 0.01;
};

// create ball bodies
World.add(world, [
    // cue
    Bodies.circle(100, 350, 10, <any>{isStatic: false, 
        collisionFilter: { category: GameplayConsts.CollisionCategoryCue, mask: GameplayConsts.CollisionMaskAllBalls }, 
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction, 
        render: {fillStyle:'white', strokeStyle:'black'}}),
    // eight ball
    Bodies.circle(130, 160, 10, <any>{isStatic: false, 
        collisionFilter: { category: GameplayConsts.CollisionCategoryNormalBalls, mask: GameplayConsts.CollisionMaskAllBalls }, 
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction, 
        render: {sprite: {texture: 'assets/8.png', xScale: 0.25, yScale: 0.25}}}),
    // a solid ball #4
    Bodies.circle(350, 500, 10, <any>{isStatic: false, 
        collisionFilter: { category: GameplayConsts.CollisionCategoryNormalBalls, mask: GameplayConsts.CollisionMaskAllBalls }, 
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction, 
        render: {sprite: {texture: 'assets/4.png', xScale: 0.25, yScale: 0.25}}}),
    // a striped ball #10
    Bodies.circle(100, 200, 10, <any>{isStatic: false, 
        collisionFilter: { category: GameplayConsts.CollisionCategoryNormalBalls, mask: GameplayConsts.CollisionMaskAllBalls }, 
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction, 
        render: {sprite: {texture: 'assets/10.png', xScale: 0.25, yScale: 0.25}}}),
]);

let mouse = Mouse.create(render.canvas),
    mouseConstraint = (<any>MouseConstraint).create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: true
            }
        }
    });
mouseConstraint.collisionFilter.mask = GameplayConsts.CollisionMaskCueOnly;

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

Render.run(render);
Engine.run(engine);
