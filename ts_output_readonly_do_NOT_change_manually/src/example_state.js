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
// create terrain
World.add(world, [
    Bodies.rectangle(30, 150, 5, 200, { isStatic: true, render: { fillStyle: 'black', strokeStyle: 'black' } }),
    Bodies.rectangle(30, 400, 5, 200, { isStatic: true, render: { fillStyle: 'black', strokeStyle: 'black' } }),
    Bodies.rectangle(200, 20, 300, 5, { isStatic: true, render: { fillStyle: 'black', strokeStyle: 'black' } }),
    Bodies.rectangle(200, 530, 300, 5, { isStatic: true, render: { fillStyle: 'black', strokeStyle: 'black' } }),
    Bodies.rectangle(380, 150, 5, 200, { isStatic: true, render: { fillStyle: 'black', strokeStyle: 'black' } }),
    Bodies.rectangle(380, 400, 5, 200, { isStatic: true, render: { fillStyle: 'black', strokeStyle: 'black' } }),
]);
Render.run(render);
Engine.run(engine);
//# sourceMappingURL=example_state.js.map