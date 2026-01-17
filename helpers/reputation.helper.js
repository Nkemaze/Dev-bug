import User from "../models/User.js";

export const updateReputation = async (userId, amount) => {
  await User.findByIdAndUpdate(userId, {
    $inc: { reputation: amount },
  });
};
