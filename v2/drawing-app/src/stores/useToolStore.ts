import { create } from "zustand";
import type { ShapeStyle } from "../canvas/CanvasItem";
import { EllipseMode } from "../mode/EllipseMode";
import { LineMode } from "../mode/LineMode";
import type { Mode } from "../mode/Mode";
import { PencilMode } from "../mode/PencilMode";
import { RectangleMode } from "../mode/RectangleMode";
import { SelectMoveMode } from "../mode/SelectMoveMode";
import type { Action } from "./actions";

/** Style of new shapes when the application starts. */
const DEFAULT_STYLE: ShapeStyle = { fillColor: '#0d00ff', strokeColor: '#000000', lineWidth: 2 };

/** State and entry point of the tool store. */
type ToolStore = {
    /** Current interaction mode, which receives the mouse events of the canvas. */
    mode: Mode
    /** Fill color of new shapes, as a hex string. */
    fillColor: string
    /** Outline color of new shapes, as a hex string. */
    strokeColor: string
    /** Outline width of new shapes, in pixels. */
    lineWidth: number
    /**
     * Applies an action to the store. Called by the dispatcher with every
     * action: only the tool actions change the state, the others are ignored.
     * @param action - Action sent by a view
     */
    dispatch: (action: Action) => void
}

/**
 * Store of the tools picked in the toolbar: the current mode and the style
 * applied to new shapes. Starts in select/move mode with the default style.
 */
export const useToolStore = create<ToolStore>()(
    (set) => ({
        mode: new SelectMoveMode(),
        fillColor: DEFAULT_STYLE.fillColor,
        strokeColor: DEFAULT_STYLE.strokeColor,
        lineWidth: DEFAULT_STYLE.lineWidth,
        dispatch: (action) => {
            switch (action.type) {
                case 'changeMode' :
                    // A new instance, so the new mode starts with no drag in progress
                    switch (action.mode) {
                        case 'selectMove' :
                            return set({ mode: new SelectMoveMode() })
                        case 'pencil' :
                            return set({ mode: new PencilMode() })
                        case 'line' :
                            return set({ mode: new LineMode() })
                        case 'rectangle' :
                            return set({ mode: new RectangleMode() })
                        case 'ellipse' :
                            return set({ mode: new EllipseMode() })
                        default:
                            break;
                    }
                    break;
                case 'changeToolFillColor' :
                    return set({ fillColor: action.color })
                case 'changeToolStrokeColor' :
                    return set({ strokeColor: action.color })
                case 'changeToolLineWidth' :
                    return set({ lineWidth: action.lineWidth })
                default:
                    // Item actions: handled by the item store
                    break;
            }
        }
    })
)
