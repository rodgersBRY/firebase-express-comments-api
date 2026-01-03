const { db, admin } = require("../firebase-config");

const getReactions = async (req, res, next) => {
  try {
    const { siteId, week } = req.params;
    const userId = req.query.userId;

    const pageRef = db
      .collection("sites")
      .doc(siteId)
      .collection("pages")
      .doc(week);

    const pageDoc = await pageRef.get();

    const reactionCounts = {
      like: 0,
      love: 0,
      excited: 0,
      celebrate: 0,
    };

    if (pageDoc.exists) {
      const data = pageDoc.data();

      reactionCounts.like = data.likeCount || 0;
      reactionCounts.love = data.loveCount || 0;
      reactionCounts.excited = data.excitedCount || 0;
      reactionCounts.celebrate = data.celebrateCount || 0;
    }

    let userReaction = null;
    if (userId) {
      const userReactionDoc = await pageRef
        .collection("reactions")
        .doc(userId)
        .get();

      if (userReactionDoc.exists) {
        userReaction = userReactionDoc.data().type;
      }
    }

    const totalReactions = Object.values(reactionCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    res.json({
      success: true,
      reactions: reactionCounts,
      totalReactions,
      userReaction,
    });
  } catch (e) {
    console.error("Error fetching reactions:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateReaction = async (req, res, next) => {
  try {
    const { siteId, week } = req.params;
    const { userId, reactionType } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "userId is required" });
    }

    const validReactions = ["like", "love", "excited", "celebrate"];
    if (!validReactions.includes(reactionType)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid reaction type. Must be: like, love, excited, or celebrate",
      });
    }

    const pageRef = db
      .collection("sites")
      .doc(siteId)
      .collection("pages")
      .doc(week);
    const userReactionRef = pageRef.collection("reactions").doc(userId);

    const pageDoc = await pageRef.get();
    if (!pageDoc.exists) {
      await pageRef.set({
        likeCount: 0,
        loveCount: 0,
        excitedCount: 0,
        celebrateCount: 0,
      });
    }

    const userReactionDoc = await userReactionRef.get();
    const previousReaction = userReactionDoc.exists
      ? userReactionDoc.data().type
      : null;

    // Use batch for atomic updates
    const batch = db.batch();

    // If user had a previous reaction, decrement it
    if (previousReaction) {
      const decrementField = `${previousReaction}Count`;
      batch.update(pageRef, {
        [decrementField]: admin.firestore.FieldValue.increment(-1),
      });
    }

    // If clicking the same reaction, remove it (toggle off)
    if (previousReaction === reactionType) {
      batch.delete(userReactionRef);
      await batch.commit();

      return res.json({
        success: true,
        action: "removed",
        reactionType,
      });
    }

    // Add/update the new reaction
    batch.set(userReactionRef, {
      type: reactionType,
      reactedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const incrementField = `${reactionType}Count`;
    batch.update(pageRef, {
      [incrementField]: admin.firestore.FieldValue.increment(1),
    });

    await batch.commit();

    res.json({
      success: true,
      action: previousReaction ? "changed" : "added",
      reactionType,
      previousReaction,
    });
  } catch (e) {
    console.error("Error updating reaction:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getReactions,
  updateReaction,
};
