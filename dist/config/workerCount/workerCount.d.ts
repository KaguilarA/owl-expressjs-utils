/**
 *  This function determines the number of worker processes to use based on whether clustering is enabled and the desired number of workers.
 * @param {boolean} isEnabled Whether clustering is enabled.
 * @param {number} workers The desired number of worker processes.
 * @returns {number} The actual number of worker processes to use.
 */
export default function (isEnabled?: boolean, workers?: number): number;
