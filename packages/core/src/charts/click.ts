/**
 * @sina-design-system/core — charts/click (internal)
 *
 * Maps a canvas click to the Chart.js elements under it. Mouse-only by nature
 * (the canvas is not keyboard-operable), so `onElementClick` is documented as
 * an enhancement-only affordance — never the sole path to information.
 */

import type { MouseEvent } from "react";
import type { Chart as ChartJS, InteractionItem } from "chart.js";
import { getDatasetAtEvent, getElementAtEvent, getElementsAtEvent } from "react-chartjs-2";

export interface ChartElementClickDetail {
  /** The raw canvas mouse event. */
  event: MouseEvent<HTMLCanvasElement>;
  /** The nearest element under the cursor, if any. */
  element: InteractionItem | undefined;
  /** All elements at the clicked index (one per series). */
  elements: InteractionItem[];
  /** The clicked dataset's elements. */
  dataset: InteractionItem[];
}

export function buildElementClickHandler(
  getChart: () => ChartJS | null,
  onElementClick: ((detail: ChartElementClickDetail) => void) | undefined,
): ((event: MouseEvent<HTMLCanvasElement>) => void) | undefined {
  if (!onElementClick) return undefined;
  return (event) => {
    const chart = getChart();
    if (!chart) return;
    onElementClick({
      event,
      element: getElementAtEvent(chart, event)[0],
      elements: getElementsAtEvent(chart, event),
      dataset: getDatasetAtEvent(chart, event),
    });
  };
}
