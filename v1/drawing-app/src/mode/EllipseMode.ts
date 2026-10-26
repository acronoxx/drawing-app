import type { PersistentElements } from "../PersistentElement";
import type { CanvasItem } from "../canvas/CanvasItem";
import { EllipseItem } from "../canvas/EllipseItem";
import type { Mode } from "./Mode";

/**
 * Mode to draw ellipses.
 *
 * Pressing the mouse creates an ellipse at the cursor, dragging resizes its
 * bounding box, and releasing fixes its size. The new ellipse uses the current
 * default style of the drawing model and becomes the selected shape.
 */
export class EllipseMode implements Mode {
    /** Drawing model the ellipses are added to. */
    public persistentElements: PersistentElements;
    /** Ellipse being drawn, or null when no drawing is in progress. */
    public item: CanvasItem | null;

    /**
     * @param persistentElements - Drawing model the ellipses are added to
     */
    constructor(persistentElements: PersistentElements){
        this.persistentElements = persistentElements;
        this.item = null;
    }

    /**
     * Creates an empty ellipse at the cursor with the default style,
     * adds it to the drawing model (which selects it) and redraws.
     * @param event - Mouse event on the canvas
     */
    onMouseDown(event: React.MouseEvent){
        const {x, y} = this.persistentElements.getMousePos(event.clientX, event.clientY);
        this.item = new EllipseItem(
            this.persistentElements.ctx,
            {x, y},
            this.persistentElements.fillColor,
            this.persistentElements.strokeColor,
            this.persistentElements.lineWidth
        );
        this.persistentElements.addItem(this.item);
        this.persistentElements.redraw();
    }

    /**
     * Resizes the bounding box of the ellipse being drawn so its opposite
     * corner follows the cursor, then redraws.
     * Does nothing if no ellipse is being drawn.
     * @param event - Mouse event on the canvas
     */
    onMouseMove(event: React.MouseEvent){
        if (!this.item) return;

        const {x, y} = this.persistentElements.getMousePos(event.clientX, event.clientY);
        this.item.update(x, y);
        this.persistentElements.redraw();
    }

    /**
     * Ends the drawing: sets the final size of the ellipse from the
     * cursor position, redraws, and clears the ellipse being drawn.
     * Does nothing if no ellipse is being drawn.
     * @param event - Mouse event on the canvas
     */
    onMouseUp(event: React.MouseEvent){
        if (!this.item) return;

        const {x, y} = this.persistentElements.getMousePos(event.clientX, event.clientY);
        this.item.update(x, y);
        this.persistentElements.redraw();
        this.item = null;
    }
}
