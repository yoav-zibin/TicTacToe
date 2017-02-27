var Engine = Matter.Engine, Render = Matter.Render, Runner = Matter.Runner, Composites = Matter.Composites, MouseConstraint = Matter.MouseConstraint, Mouse = Matter.Mouse, World = Matter.World, Query = Matter.Query, Svg = Matter.Svg, Bodies = Matter.Bodies;
var engine = Engine.create(), world = engine.world;
var render = Render.create({
    element: document.getElementById("canvas-container"),
    engine: engine,
    options: {
        height: 600,
        width: 420,
    }
});
engine.world.gravity.y = 0;
var renderOptions = render.options;
renderOptions.wireframes = false;
renderOptions.background = 'green';
// create terrain (table frames)
World.add(world, [
    // left
    Bodies.rectangle(30, 150, 5, 210, { isStatic: true, render: { fillStyle: '#825201', strokeStyle: 'black' } }),
    Bodies.rectangle(30, 400, 5, 210, { isStatic: true, render: { fillStyle: '#825201', strokeStyle: 'black' } }),
    // top
    Bodies.rectangle(205, 20, 305, 5, { isStatic: true, render: { fillStyle: '#825201', strokeStyle: 'black' } }),
    // bottom
    Bodies.rectangle(205, 530, 305, 5, { isStatic: true, render: { fillStyle: '#825201', strokeStyle: 'black' } }),
    // right
    Bodies.rectangle(380, 150, 5, 210, { isStatic: true, render: { fillStyle: '#825201', strokeStyle: 'black' } }),
    Bodies.rectangle(380, 400, 5, 210, { isStatic: true, render: { fillStyle: '#825201', strokeStyle: 'black' } }),
]);
// create pockets
World.add(world, [
    // top-left
    Bodies.circle(30, 20, 25, { isStatic: true, render: { fillStyle: 'black' } }),
    // top-right
    Bodies.circle(380, 20, 25, { isStatic: true, render: { fillStyle: 'black' } }),
    // left
    Bodies.circle(5, 275, 31, { isStatic: true, render: { fillStyle: 'black' } }),
    // right
    Bodies.circle(405, 275, 31, { isStatic: true, render: { fillStyle: 'black' } }),
    // bottom-left
    Bodies.circle(30, 530, 25, { isStatic: true, render: { fillStyle: 'black' } }),
    // bottom-right
    Bodies.circle(380, 530, 25, { isStatic: true, render: { fillStyle: 'black' } }),
]);
var collisionCategoryCue = 0x0001;
var collisionCategoryNormalBalls = 0x0002;
var collisionMaskAllBalls = 0x0003;
var collisionMaskCueOnly = 0x0001;
// create ball bodies
World.add(world, [
    // cue
    Bodies.circle(100, 350, 10, { isStatic: false, collisionFilter: { category: collisionCategoryCue, mask: collisionMaskAllBalls }, restitution: 0.9, friction: 0.2, render: { fillStyle: 'white', strokeStyle: 'black' } }),
    // eight ball
    Bodies.circle(130, 160, 10, { isStatic: false, collisionFilter: { category: collisionCategoryNormalBalls, mask: collisionMaskAllBalls }, restitution: 0.9, friction: 0.2, render: { fillStyle: 'black', strokeStyle: 'black' } }),
    // a solid ball
    Bodies.circle(350, 500, 10, { isStatic: false, collisionFilter: { category: collisionCategoryNormalBalls, mask: collisionMaskAllBalls }, restitution: 0.9, friction: 0.2, render: { fillStyle: 'pink', strokeStyle: 'black' } }),
]);
var mouse = Mouse.create(render.canvas), mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: true
        }
    }
});
mouseConstraint.collisionFilter.mask = collisionMaskCueOnly;
World.add(world, mouseConstraint);
// keep the mouse in sync with rendering
render.mouse = mouse;
Render.run(render);
Engine.run(engine);
//# sourceMappingURL=example_state.js.map