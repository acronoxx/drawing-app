import type { Action } from "./actions"
import { useItemStore } from "./useItemStore"
import { useToolStore } from "./useToolStore"

/**
 * Sends an action to every store (Flux dispatcher).
 *
 * This is the only way for the views (toolbar, canvas, modes) to change the
 * state. Each store handles the actions about its own state and ignores the
 * others, so the dispatcher does not need to know which store an action is for.
 * @param action - Action describing what the user did
 */
export function dispatch(action: Action) {
    // getState() gives access to a store outside of a React component
    useToolStore.getState().dispatch(action)
    useItemStore.getState().dispatch(action)
}
