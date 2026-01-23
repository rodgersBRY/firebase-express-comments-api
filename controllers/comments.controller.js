const { db, admin } = require("../firebase-config");

const getComments = async (req, res, next) => {
  try {
    const { siteId, week } = req.params;
    const { limit = 20, cursor } = req.query; // Default to 20 comments per page

    // Parse limit to ensure it's a number and within reasonable bounds
    const pageLimit = Math.min(Math.max(parseInt(limit) || 20, 5), 50);

    let query = db
      .collection("sites")
      .doc(siteId)
      .collection("pages")
      .doc(week)
      .collection("comments")
      .orderBy("createdAt", "desc");

    // If cursor is provided, start after that document
    if (cursor) {
      try {
        const cursorDoc = await db
          .collection("sites")
          .doc(siteId)
          .collection("pages")
          .doc(week)
          .collection("comments")
          .doc(cursor)
          .get();

        if (cursorDoc.exists) {
          query = query.startAfter(cursorDoc);
        }
      } catch (cursorError) {
        console.warn("Invalid cursor provided:", cursorError.message);
        // Continue without cursor if invalid
      }
    }

    const commentsSnapshot = await query.limit(pageLimit).get();

    const comments = [];
    commentsSnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || null,
      });
    });

    // Determine if there are more comments by checking if we got the full page
    const hasMore = comments.length === pageLimit;
    const nextCursor = hasMore && comments.length > 0 ? comments[comments.length - 1].id : null;

    res.json({
      success: true,
      comments,
      count: comments.length,
      pagination: {
        hasMore,
        nextCursor,
        limit: pageLimit
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, error: e.message });
  }
};

const newComment = async (req, res, next) => {
  try {
    const { siteId, week } = req.params;

    const { text, username } = req.body;

    if (!text || !text.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "comment text is required" });
    }

    const commentData = {
      text: text.trim(),
      username: username || "Guest",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      uid: req.body.uid || "anonymous",
    };

    const docRef = await db
      .collection("sites")
      .doc(siteId)
      .collection("pages")
      .doc(week)
      .collection("comments")
      .add(commentData);

    res.json({
      success: true,
      commentId: docRef.id,
      message: "comment added successfully",
    });
  } catch (e) {
    console.error("error adding comment", e);

    res.status(500).json({ success: false, error: e.message });
  }
};

module.exports = {
  newComment,
  getComments,
};
