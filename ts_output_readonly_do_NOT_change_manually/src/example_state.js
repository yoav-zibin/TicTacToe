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
// create ball bodies
World.add(world, [
    // cue
    Bodies.circle(100, 350, 10, { isStatic: false, render: { fillStyle: 'white', strokeStyle: 'black' } }),
    // eight ball
    Bodies.circle(130, 160, 10, { isStatic: false, render: { fillStyle: 'black', strokeStyle: 'black' } }),
    // a solid ball
    Bodies.circle(350, 500, 10, { isStatic: false, render: { fillStyle: 'pink', strokeStyle: 'black' } }),
]);
Render.run(render);
Engine.run(engine);
//# sourceMappingURL=example_state.js.map