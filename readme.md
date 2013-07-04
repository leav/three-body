To run the demo locally, please refer to this page. Otherwise, the security setting of the browser would not let you load the textures.
https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally

**Title**

Three Body

**Links**

demo https://dl.dropboxusercontent.com/u/69404220/three-body/index.html
source https://github.com/leav/three-body

 **Category**

Best Animation
(could also be Most Entertaining, in the context of the original science fiction)

**Description**

This project idea is from the science fiction [*Three Body*][1]. In this simulation, a planet is orbiting around a [triple star system][2]. Yes, it means the planet has three suns. Because of the unpredictable nature of the three body system, chaos things happen, such as one of the sun getting ejected off, or the planet being consumed by the suns.

Inside the simulation, you can set various initial conditions for the star system. Press and drag the mouse to rotate the camera. Use mouse wheel to zoom. Click on the small screen at the right bottom corner to switch between stellar view and planetary view.

**Postmortem**

== What went well ==

-- Physics

Physics is the core of every star system simulation, and thankfully it didn't go too wrong in this project. 

The most challenging part of Physics is to find a right integrating method for the positions and velocities for the stars. At first instinct, I used the [Euler's method][3]. Basically it is: new position = old position + velocity, new velocity = old velocity + acceleration. It produced some convincing trajectories at first, but its small errors can quickly add up, as two stars cannot even form a stable orbit in a two body system. The problem of Euler's method is that it assumes the acceleration is constant over the delta time step.

After some researching, I found out that [RK4 integration][4] is the norm in computer science. A [great article][5] by Glenn Fiedler explains the implementation details. I implemented RK4 in this project without even understanding how it works mathematically. But in computer graphics, it is right when it looks right. Now the interaction between the stars at close distance is more convincing.

-- Class materials

Thankfully for Eric, this project is adopting from the demos through out the class, from the most basic geometries, textures and materials to the more advanced shader programming and double camera viewports.

-- Corona

To implement an animating corona on the star, I had to do some shader programming from scratch. It uses a noise texture to generate the corona, and you can fine tune the noise texture to control the dynamics of the corona. Shader programming turns out easier than I thought, except the debugging part.

== What went wrong ==

-- Planning

Among these many things that have gone wrong, planning is the worst one. I finished the class 9 days before the contest 2 deadline, and spent 2 days brainstorming ideas for this project. That left me a week to build the project from scratch. At the start, I had some big ambitions, such as a more mesmerizing planetary view with sky, cloud, ocean, rain and etc. But at the middle of the week, I found myself spending 80% of the time debugging some hopeless [JavaScript][6] and [rotation transforming][7] problems. On the last day away from deadline, I still only had the stellar view. Luckily, with the previous debugging experience, I can quickly cram up the basic planetary view without too much trouble.

-- JavaScript

I learned everything I know about JavaScript during this class and this project. That means the code structure in the project is horrible from the start, and I don't have time to deal with it due to the tight schedule. Spoiled by the [Ruby][8], I find many things in JavaScript just itching. Sometimes it is too dynamic, as you can summon up an undefined property without getting any errors, making every typo 20 seconds more to debug. The other times it is too cumbersome, for scattering "prototype" and "this" everywhere. And the vector and matrix operations in THREE.js is a bit anti-intuitive because most of them have side effects on the callee, forcing temporary variables even in some basic calculations (maybe it's just me doing it the wrong way).

-- Same Origin Policy

[SOP][9] just renders local WebGL programs not being able to dynamically load resources such as textures. [This article][10] is super important if you want to run the html page locally.

-- Rotation

Because the project is set in the space, [OrbitAndPanControl][11] would not do the job due to its predefined up and down direction. When I tried to cram up a space camera control, I kept falling into pits of rotation.

The first pit is the rotation axis. And it is the most time consuming to realize. To make a object rotate around an axis for certain angles, no matter you use Matrix4.makeRotationAxis or Object3D.rotateOnAxis, the axis is in terms of local space instead of the world space. This might seem plainly obvious when written out in words. But the intuition is that something outside rotates the object, so it might feel the axis is in terms of world space. At the end I used an alternate solution, by rotating the scene instead of the camera. It is described in [this article][12]. But this approach introduces some difficulties on objects such as lensFlare, which is another topic later.

The other pit is related to the side effects in matrix operations previously mentioned. For an operation as easy as getting the inverse, you need a temporary variable to do it:

> var m1 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 1), Math.PI / 3);
var m2 = new THREE.Matrix4().copy(m1);
m1.getInverse(m1);
var m3 = new THREE.Matrix4();
m3.getInverse(m2);
// m3 is the corrent inverse, m1 is not!



== What could be done ==

-- lens flare

-- sky/atmosphere on planetary view

-- a moon

-- corona on suns

-- drinking bird on planet

**Credits**
sun texture: [NASA][13]
space texture: [NASA][14]
planet texture (Mercury): [NASA][15]


**Screenshots**

![screenshot: star view][16]

![screenshot: planet view][17]


  [1]: http://en.wikipedia.org/wiki/Three_Body_%28science_fiction%29 "wikipedia: Three Body"
  [2]: https://en.wikipedia.org/wiki/Multiple_star#Triple_star_systems
  [3]: https://en.wikipedia.org/wiki/Euler_method
  [4]: http://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods
  [5]: http://gafferongames.com/game-physics/integration-basics/
  [6]: http://stackoverflow.com/questions/387707/whats-the-best-way-to-define-a-class-in-javascript
  [7]: http://threejs.org/docs/58/#Reference/Math/Quaternion
  [8]: http://www.ruby-lang.org/en/
  [9]: http://en.wikipedia.org/wiki/Same_origin_policy
  [10]: https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally
  [11]: https://github.com/udacity/cs291/blob/27488519b3ac41d837d7bde8b11e151af1e3969d/lib/OrbitAndPanControls.js
  [12]: http://www.html5rocks.com/en/tutorials/casestudies/100000stars/
  [13]: http://www.nasa.gov
  [14]: http://www.nasa.gov
  [15]: http://www.nasa.gov
  [16]: https://dl.dropboxusercontent.com/u/69404220/three-body/media/screenshot03.png
  [17]: https://dl.dropboxusercontent.com/u/69404220/three-body/media/screenshot02.png