# Notes Adrien

## How to use

  * For a quick demo, visit [This Page](https://ubi.boucaud.dev/)
  * To build the project, you need node/npm (this was tested on v16.14.0 LTS)
  * Quick test: `npm run serve` then visit [localhost:8080](localhost:8080)
  * Build for prod: `npm run build`. Then serve the dist folder with any http server (ex: `python -m http.server`)

## Camera controls

  * Rotate: left click + move the mouse
  * Pan: shift + left click + move the mouse
  * Zoom in/out: Mousewheel in/out

## Short description

### Map

The map is drawn as a flat triangle grid, then elevated in the fragment shader.

### Isolines

You can draw isometric (contour) lines around the map. It is possible to control line frequency, width and color.

### Heatmap

A heatmap is drawn on the map based on how many markers are located within a radius of every sample.

You can control that radius, as well as the colormap range (how many markers for the map to be red).

The heatmap is first drawn into an off-screen texture using additive blending and a point cloud, then that texture is painted onto the map.

### Markers

Markers are instanced quads drawns as billboards. You can control a time window in the gui that will filter out markers based on their timestamps.

The animate button will increment time window values until they are maxed out.

You can also control the marker scale.

### Lighting

The map is shaded using a single (Phong) light, you can control its colors, rotation and distance from the y axis



# Technical Test for 3D Programmer of DNA-Viewer

We would like to further learn about your capability and potentials in 3D rendering. And the best way we believe is to see your work. In this test, you are expected to build a simple web application that visualizes the provided tracking data. You are free to choose the technologies you prefer, but we recommend you to use [three.js](https://threejs.org/), which aligns with our current technical stack the best.

Your work shall be packed in a repository. You may want to attach with a specification of  how to start the application locally. You have 7 days to submit your work.

## What to build

We would like you to build a pure front end web application that plots points on the map using WebGL with **your own shaders**. It **must** contain the following the features:

- A canvas where we will see the visualization.
- A free roaming camera.
  -  Using perspective projection.
  -  Attached control instructions.
- A planar map that represents the venue of the tracking events.
  -  Centered at the origin.
  -  The dimension is 32 by 32.
- Markers that represent the locations of tracked events.
  -  They should always appear in front of the map.
  -  They should occlude the ones behind them based on their distance to the camera.
  -  They should be 'pinned' on their given positions.
  -  They should have different colors that represents which groups they are.
- Necessary widgets to control the visual effects. ([dat-gui](http://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage) may come handy.)

Apart from the essential functionalities, consider the following **optional** features as bonus points and feel free to build something outside of the list, as long as it is graphics related.

- Replaying of the events using their time stamps.
  - The replaying form is not restricted. Examples may be displaying part of markers based on the replay progress, or displaying animated jointed lines.
  - Please include widgets to control the replaying.
- A heat map that indicates the spatial density of the events.
- Improved rendering of the map. Including but not limited to:
  - Rendering of the terrain using the provided height map. (In that case please adjust the marker positions accordingly.)
  - Lighting, e.g. shadows, reflections, scattering.
  - Contour lines to visualize altitude using the height map.

## What you are provided

There are 4 other files attached.
- A color texture for the map.
- A height texture for the map.
- A picture of a pin for the markers.
- A JSON file of the tracked events.
  - Each event has a `x` coordinate, a `y` coordinate, and a `t` for time stamp.
  - Events from the same player are grouped in a array.
  - This JSON is an array of these player event groups.

If you used other data, please make sure to include them in your submission.

## What we value

- Structural solution to the problem.
- Code Readability.
- Attention to details.
- Optimization and performance.

Have fun!
