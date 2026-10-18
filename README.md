# Drawing App

React + TypeScript application to draw and edit simple shapes on an HTML canvas: rectangles, ellipses, lines and free-hand paths. Shapes can be selected, moved, recolored, cloned, deleted and reordered in depth.

Lab 4 of the UE ISI (IMT Atlantique, 2026–2027): *React application with advanced interaction*.

## Author

**Alexis Baret**, FISE A2, IMT Atlantique

---

## Getting started

Requirements: Node.js and npm.

```bash
cd drawing-app
npm install      # install dependencies
npm run dev      # start the dev server, then open the printed URL
```
---

## Features

| Feature | How to use it |
|---|---|
| **Select & Move** | Click a shape to select it, drag it to move it. Click on an empty area to clear the selection. |
| **Rectangle / Ellipse / Line** | Press the mouse, drag to size the shape, release to fix it. |
| **Pencil** | Press the mouse and drag to draw a free-hand path. |
| **Fill color, outline color, line width** | With a shape selected: edits that shape. With nothing selected: sets the style of the next shapes. |
| **Delete** | Removes the selected shape. |
| **Clone** | Duplicates the selected shape with a 10px offset and selects the copy. Clicking again creates a "staircase" of copies. |
| **Depth order** (bonus) | Mouse wheel over the canvas: scroll up brings the selected shape forward, scroll down sends it backward. |
| **Deformation** (bonus) | The selected shape shows its dashed bounding box and 8 handles. Drag a corner to resize both axes, or a side handle to resize one axis; the opposite handle stays fixed. Dragging past it flips the shape. |

---

## Project structure

```
src/
├── main.tsx                 Entry point: mounts <App /> into #root
├── App.tsx                  Root component: shared state, canvas initialization and resizing
├── Toolbar.tsx              Left panel: mode selection, style inputs, Delete / Clone buttons
├── PersistentElement.ts     Drawing model: shapes, selection, default style, rendering
├── canvas/
│   ├── Canvas.tsx           Canvas element: forwards mouse events to the current mode, handles the wheel
│   ├── CanvasItem.ts        Interface implemented by every shape, Point and BoundingBox types
│   ├── handles.ts           The 8 resize handles of the selection, positioned generically on the bounding box
│   ├── RectangleItem.ts     Rectangle shape
│   ├── EllipseItem.ts       Ellipse shape
│   ├── LineItem.ts          Straight line
│   └── PathItem.ts          Free-hand path (Pencil)
└── mode/
    ├── Mode.ts              Interface implemented by every interaction mode
    ├── SelectMoveMode.ts    Select and move shapes
    ├── RectangleMode.ts     Draw rectangles
    ├── EllipseMode.ts       Draw ellipses
    ├── LineMode.ts          Draw lines
    └── PencilMode.ts        Draw free-hand paths
```

Each component has its own CSS file next to it (`App.css`, `Toolbar.css`, `Canvas.css`).

### Data flow

```
                         App
        state: mode, persistentElements
        ref:   canvasRef
          │                          │
          ▼                          ▼
       Toolbar                     Canvas
  picks a mode (onModeChange)   mouse events ──► current Mode
  edits style / Delete / Clone                      │
          │                                         │
          └──────────────►  PersistentElements  ◄───┘
                            items[], selectedItem,
                            default style, redraw()
                                     │
                                     ▼
                             CanvasItem.draw()  ──►  <canvas>
```

---

## Design choices

### Selection and style
The style inputs show the style of the selected shape, and editing them changes only that shape. When nothing is selected, the inputs show and edit the default style used for new shapes, so clearing the selection restores the previous settings. Each `CanvasItem` keeps its own `fillColor`, `strokeColor` and `lineWidth`.

### Deformation
Each shape computes its own bounding box (`getBoundingBox()`), and the 8 handles are positioned generically on it in `handles.ts`, with fractions of the box (0, 0.5 or 1 on each axis), so the same code works for every type of shape.

Dragging a handle scales the shape relative to the opposite handle, which stays fixed. Instead of `ctx.scale()`, which would only change the rendering, each shape transforms its own points (`scale()`): picking, moving, cloning and the bounding box keep working without any change, and the line width is not stretched. A negative scale factor flips the shape. At each mouse move, the resize starts again from a copy of the shape taken when the drag started, so errors do not accumulate.

### Conventions
- `PascalCase` for components, classes, interfaces and types; `camelCase` for variables and functions.
- Event handlers defined in a component are named `handleXxx`; callback props are named `onXxx`.
- Model methods are named after the action, not the event that triggers it (`bringSelectedItemForward`, not `onWheelUp`).
- Public classes, methods, attributes and props are documented with TSDoc (`/** */`); `//` is used for section titles and internal explanations.

---

## Inspirations

- **Figma**: the properties panel shows the style of the selected shape and edits it directly. With nothing selected, it shows the defaults for new shapes.
- **Figma / PowerPoint / Google Slides**: duplicating a shape selects the copy, so repeated clones form a staircase.
- **PowerPoint / Illustrator**: the *Bring Forward* / *Send Backward* vocabulary for depth ordering.

---

## Resources

- [MDN: `CanvasRenderingContext2D.moveTo()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/moveTo), used to start lines and free-hand paths
- [MDN: `CanvasRenderingContext2D.lineTo()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo), used to draw lines and free-hand paths
- [MDN: `CanvasRenderingContext2D.rect()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rect), used to build rectangle paths
- [MDN: `CanvasRenderingContext2D.ellipse()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/ellipse), used to build ellipse paths
- [MDN: `CanvasRenderingContext2D.isPointInPath()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/isPointInPath), used to pick rectangles and ellipses
- [MDN: `CanvasRenderingContext2D.isPointInStroke()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/isPointInStroke), used to pick lines

---

## Use of AI

This project was developed with the help of **Claude** (Anthropic), used through Claude Code as a tutor and reviewer:

- **Explanations**: role of each file of the template, React concepts (state vs. ref, lifting state up, controlled vs. uncontrolled inputs, `useEffect` timing), TypeScript features (union types, optional chaining, interfaces vs. abstract classes), and the State design pattern.
- **Documentation**: writing TSDoc comments for the components, the drawing model, the shapes and the modes, and drafting this README.
- **Review**: pointing out inconsistencies and bugs, which I then fixed myself.
- **Code formatting and completion of repetitive code**: once I had written the first shape and mode myself, the following ones mostly repeated the same structure. Claude removed redundant null checks and fixed the indentation in the drawing modes, renamed `fillStyle`/`strokeStyle` to `fillColor`/`strokeColor` in the shapes, fixed the type errors in `PathItem.ts` (adapting `move`, `update` and `duplicate` from `LineItem` to a list of points), and adapted `PencilMode.ts` from `LineMode.ts`.
- **Bounding box and handles (bonus)**: Claude added the `Point` / `BoundingBox` types and the documented `getBoundingBox()`, `scale()` and `replaceItem()` signatures (their implementation is mine), and wrote `handles.ts` (generic handle positions and picking). Claude helped me draw the selection feedback: the dashed bounding box with `strokeRect`, and the code drawing the 8 handle squares in `drawSelection`. Claude also showed me the spread syntax `Math.min(...array)` used for free-hand paths, and pointed out that the box of rectangles and ellipses had to be normalized (negative width and height when drawn to the left or upward); I did the fix.
- **Understanding the resize (bonus)**: Claude explained how to scale a shape from a handle: the opposite handle as the fixed point, the scale factor `(mouse - fixed) / (handle - fixed)`, the formula `fixed + (p - fixed) * scale` for positions (and a plain multiplication for sizes such as `wh`), negative factors to flip the shape, and starting again from a copy of the original shape at each mouse move.

The rest of the application code was written by me.
