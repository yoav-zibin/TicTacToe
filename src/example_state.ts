
function resizeCanvas(world : any, render : any) {
    let width = document.body.clientWidth;
    let height = document.body.clientHeight;
    let size = width <= height ? width : height;
    let boundsMax = world.bounds.max,
        renderOptions = render.options,
        canvas = render.canvas;
    boundsMax.x = size;
    boundsMax.y = size;
    canvas.width = renderOptions.width = size;
    canvas.height = renderOptions.height = size;
}

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
    element: document.getElementById("gameArea"),
    engine: engine
});

resizeCanvas(world, render);

engine.world.gravity.y = 0;

// create terrain
World.add(world, [
    Bodies.rectangle(30, 150, 5, 200, {isStatic: true, render: <any>{fillStyle:'black', strokeStyle:'black'}}),
    Bodies.rectangle(30, 400, 5, 200, {isStatic: true, render: <any>{fillStyle:'black', strokeStyle:'black'}}),
    Bodies.rectangle(200, 20, 300, 5, {isStatic: true, render: <any>{fillStyle:'black', strokeStyle:'black'}}),
    Bodies.rectangle(200, 530, 300, 5, {isStatic: true, render: <any>{fillStyle:'black', strokeStyle:'black'}}),
    Bodies.rectangle(380, 150, 5, 200, {isStatic: true, render: <any>{fillStyle:'black', strokeStyle:'black'}}),
    Bodies.rectangle(380, 400, 5, 200, {isStatic: true, render: <any>{fillStyle:'black', strokeStyle:'black'}}),
]);

Render.run(render);
Engine.run(engine);
