import { create } from "zustand";
import type { CanvasItem, Point, ShapeKind, ShapeStyle } from "../canvas/CanvasItem";
import { EllipseItem } from "../canvas/EllipseItem";
import { LineItem } from "../canvas/LineItem";
import { PathItem } from "../canvas/PathItem";
import { RectangleItem } from "../canvas/RectangleItem";
import type { Handle } from "../canvas/handles";
import type { Action } from "./actions";
import { getHandlePosition } from "../canvas/handles";

/** State and entry point of the item store. */
type ItemStore = {
    /**
     * Shapes on the canvas, in drawing order:
     * the first is drawn first (background), the last is on top.
     */
    items: CanvasItem[]
    /**
     * Currently selected shape, or null if nothing is selected.
     * Always one of the objects of `items`.
     */
    selectedItem: CanvasItem | null
    /** Handle being dragged during a resize, or null outside a resize. */
    handle: Handle | null
    /**
     * Selected shape as it was when the resize started, or null outside a
     * resize. Each `scale` starts again from it, so the resize does not
     * accumulate errors.
     */
    originalItem: CanvasItem | null
    /**
     * Applies an action to the store. Called by the dispatcher with every
     * action: only the item actions change the state, the others are ignored.
     * @param action - Action sent by a view
     */
    dispatch: (action: Action) => void
}

// Each function below computes the part of the state changed by one action.
// They never modify the current state: a changed shape or array is always a
// new object, so Zustand sees the change and notifies the views.

/**
 * Creates a shape of the given kind, adds it on top and selects it.
 * @param state - Current state of the store
 * @param kind - Kind of shape to create
 * @param point - Starting point of the shape, in canvas coordinates
 * @param style - Style of the new shape
 * @returns The new `items` and `selectedItem`
 */
function add(state: ItemStore, kind: ShapeKind, point: Point, style: ShapeStyle) {
    let item: CanvasItem;
    switch (kind) {
        case 'path':
            item = new PathItem(point, style.fillColor, style.strokeColor, style.lineWidth)
            break;
        case 'line':
            item = new LineItem(point, style.fillColor, style.strokeColor, style.lineWidth)
            break;
        case 'rectangle':
            item = new RectangleItem(point, style.fillColor, style.strokeColor, style.lineWidth)
            break;
        case 'ellipse':
            item = new EllipseItem(point, style.fillColor, style.strokeColor, style.lineWidth)
            break;
    }
    return { items: [...state.items, item], selectedItem: item }
}

/**
 * Selects the shape at the given index in `items`, or clears the selection
 * with -1. Does nothing for any other invalid index.
 * @param state - Current state of the store
 * @param id - Index of the shape in `items`, or -1 for no shape
 * @returns The new `selectedItem`, or nothing
 */
function select(state: ItemStore, id: number) {
    if (id == -1) return { selectedItem: null }
    if (id < 0 || id >= state.items.length) return {}
    return { selectedItem: state.items[id] }
}

/**
 * Applies a change to a copy of the selected shape, and puts the copy in
 * place of the selected shape (same depth) as the new selection.
 * Does nothing if no shape is selected.
 * @param state - Current state of the store
 * @param modification - Change to apply; may modify the copy it receives
 * @returns The new `items` and `selectedItem`, or nothing
 */
function modifySelection(state: ItemStore, modification: (copy: CanvasItem) => void) {
    if (!state.selectedItem) return {}
    const copy = state.selectedItem.duplicate()
    modification(copy)
    return { items: state.items.map((i) => i == state.selectedItem ? copy : i), selectedItem: copy }
}

/**
 * Translates the selected shape.
 * @param state - Current state of the store
 * @param dx - Horizontal offset, in pixels
 * @param dy - Vertical offset, in pixels
 */
function move(state: ItemStore, dx: number, dy: number) {
    return modifySelection(state, (copy: CanvasItem) => copy.move(dx, dy))
}

/**
 * Updates the shape being drawn (the selected one) from the cursor position.
 * @param state - Current state of the store
 * @param point - Cursor position, in canvas coordinates
 */
function update(state: ItemStore, point: Point) {
    return modifySelection(state, (copy: CanvasItem) => copy.update(point.x, point.y))
}

/**
 * Sets the fill color of the selected shape.
 * @param state - Current state of the store
 * @param color - New fill color (hex string)
 */
function changeSelectedFillColor(state: ItemStore, color: string) {
    return modifySelection(state, (copy: CanvasItem) => { copy.fillColor = color })
}

/**
 * Sets the outline color of the selected shape.
 * @param state - Current state of the store
 * @param color - New outline color (hex string)
 */
function changeSelectedStrokeColor(state: ItemStore, color: string) {
    return modifySelection(state, (copy: CanvasItem) => { copy.strokeColor = color })
}

/**
 * Sets the outline width of the selected shape.
 * @param state - Current state of the store
 * @param lineWidth - New outline width, in pixels
 */
function changeSelectedLineWidth(state: ItemStore, lineWidth: number) {
    return modifySelection(state, (copy: CanvasItem) => { copy.lineWidth = lineWidth })
}

/**
 * Moves the selected shape one step toward the foreground (swaps it with the
 * next shape in a copy of `items`). Does nothing if no shape is selected or
 * if it is already on top. The shape itself is unchanged, so is the selection.
 * @param state - Current state of the store
 * @returns The new `items`, or nothing
 */
function bringForward(state: ItemStore) {
    if (!state.selectedItem) return {}
    const copyItems = [...state.items]
    const id = state.items.findIndex((item) => item === state.selectedItem);
    if (id == state.items.length - 1 || id == -1) return {}
    const nextItem = copyItems[id + 1]
    copyItems[id + 1] = copyItems[id]
    copyItems[id] = nextItem
    return { items: copyItems }
}

/**
 * Moves the selected shape one step toward the background (swaps it with the
 * previous shape in a copy of `items`). Does nothing if no shape is selected
 * or if it is already at the bottom. The selection is unchanged.
 * @param state - Current state of the store
 * @returns The new `items`, or nothing
 */
function sendBackward(state: ItemStore) {
    if (!state.selectedItem) return {}
    const copyItems = [...state.items]
    const id = state.items.findIndex((item) => item === state.selectedItem);
    if (id == 0 || id == -1) return {}
    const precItem = copyItems[id - 1]
    copyItems[id - 1] = copyItems[id]
    copyItems[id] = precItem
    return { items: copyItems }
}

/**
 * Starts resizing the selected shape: remembers it and the dragged handle.
 * No copy is needed, since shapes in the store are never modified.
 * Does nothing if no shape is selected.
 * @param state - Current state of the store
 * @param handle - Handle being dragged
 * @returns The new `originalItem` and `handle`, or nothing
 */
function beginScale(state: ItemStore, handle: Handle) {
    if (!state.selectedItem) return {}
    return { originalItem: state.selectedItem, handle: handle }
}

/**
 * Resizes the shape so the dragged handle follows the cursor while the
 * opposite handle stays fixed (dragging past the fixed handle flips the
 * shape). Always scales a new copy of `originalItem`, and puts it in place of
 * the current selection. Does nothing outside a resize.
 * @param state - Current state of the store
 * @param point - Cursor position, in canvas coordinates
 * @returns The new `items` and `selectedItem`, or nothing
 */
function scale(state: ItemStore, point: Point) {
    if (!state.originalItem) return {}
    if (!state.handle) return {}
    const box = state.originalItem.getBoundingBox();
    const start = getHandlePosition(box, state.handle);
    const x = point.x
    const y = point.y
    const fixed = getHandlePosition(box, { fx: 1 - state.handle.fx, fy: 1 - state.handle.fy });
    // Factor that brings the handle under the cursor; 1 on an axis where the box is flat
    const scaleFactor = {
        x: (start.x === fixed.x) ? 1 : (x - fixed.x) / (start.x - fixed.x),
        y: (start.y === fixed.y) ? 1 : (y - fixed.y) / (start.y - fixed.y)
    }
    const resizedItem = state.originalItem.duplicate();
    resizedItem.scale(scaleFactor.x, scaleFactor.y, fixed);
    return { items: state.items.map((i) => i == state.selectedItem ? resizedItem : i), selectedItem: resizedItem }
}

/**
 * Ends the resize: forgets the original shape and the handle.
 * The resized shape stays selected.
 * @returns The cleared `originalItem` and `handle`
 */
function endScale() {
    return { originalItem: null, handle: null }
}

/**
 * Removes the selected shape and clears the selection.
 * @param state - Current state of the store
 * @returns The new `items` and `selectedItem`
 */
function deleteItem(state: ItemStore) {
    return { items: state.items.filter((i) => i != state.selectedItem), selectedItem: null }
}

/**
 * Clones the selected shape with a small offset (10px right and down),
 * adds the clone on top and selects it. Does nothing if no shape is selected.
 * @param state - Current state of the store
 * @returns The new `items` and `selectedItem`, or nothing
 */
function clone(state: ItemStore) {
    if (!state.selectedItem) return {}
    const copy = state.selectedItem.duplicate()
    copy.move(10, 10)
    return { items: [...state.items, copy], selectedItem: copy }
}

/**
 * Store of the drawing: every shape on the canvas, the selection, and the
 * resize in progress. Starts empty, with nothing selected.
 *
 * The style shown in the toolbar is not stored here: it is read from
 * `selectedItem`, so it can never be out of sync with the shape.
 */
export const useItemStore = create<ItemStore>()(
    (set) => ({
        items: [],
        selectedItem: null,
        handle: null,
        originalItem: null,
        dispatch: (action) => {
            switch (action.type) {
                case 'add':
                    return set((state) => add(state, action.kind, action.point, action.style))
                case 'select':
                    return set((state) => select(state, action.id))
                case 'move':
                    return set((state) => move(state, action.dx, action.dy))
                case 'update':
                    return set((state) => update(state, action.point))
                case 'bringForward':
                    return set((state) => bringForward(state))
                case 'sendBackward':
                    return set((state) => sendBackward(state))
                case 'beginScale':
                    return set((state) => beginScale(state, action.handle))
                case 'scale':
                    return set((state) => scale(state, action.point))
                case 'endScale':
                    return set(() => endScale())
                case 'delete':
                    return set((state) => deleteItem(state))
                case 'clone':
                    return set((state) => clone(state))
                case 'changeSelectedFillColor':
                    return set((state) => changeSelectedFillColor(state, action.color))
                case 'changeSelectedStrokeColor':
                    return set((state) => changeSelectedStrokeColor(state, action.color))
                case 'changeSelectedLineWidth':
                    return set((state) => changeSelectedLineWidth(state, action.lineWidth))
                default:
                    // Tool actions: handled by the tool store
                    break;
            }
        }
    })
)
