import Question from "../models/Question.js";

/**
 * Get popular tags
 */
export const getPopularTags = async (req, res) => {
  try {
    const tags = await Question.aggregate([
      { $unwind: "$tags" },            // Flatten tags array
      { $group: { _id: "$tags", count: { $sum: 1 } } }, // Count each tag
      { $sort: { count: -1 } },        // Sort descending by count
      { $limit: 20 },                  // Optional: limit to top 20 tags
      { $project: { name: "$_id", count: 1, _id: 0 } }, // Format
    ]);

    res.json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch popular tags" });
  }
};
