import { availableParallelism } from "node:os";

/**
 * Determines the number of CPU cores available for parallel processing.
 */
const cpuCount = availableParallelism();

/**
 *  This function determines the number of worker processes to use based on whether clustering is enabled and the desired number of workers.
 * @param {boolean} isEnabled Whether clustering is enabled.
 * @param {number} workers The desired number of worker processes.
 * @returns {number} The actual number of worker processes to use.
 */
export default function (isEnabled: boolean = false, workers: number = 1): number {
  if (!isEnabled) return 1;

  const desiredWorkers = Number.isInteger(workers) && workers > 0 ? workers : 1;

  return Math.min(desiredWorkers, Math.max(cpuCount, 1));
}
