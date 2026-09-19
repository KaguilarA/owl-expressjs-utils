import OwlModel from "./../../utils/model/model"

/**
 * Creates a Mongoose model for a state entity.
 * @param {string[]} supported - List of supported entity types.
 * @returns {import("mongoose").Model} Mongoose model for the state entity.
 */
export default (supported: string[]) => OwlModel("State",{
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  entity: {
    type: String,
    enum: supported,
    required: true,
  },
})