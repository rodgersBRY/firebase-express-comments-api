const { db, admin } = require("../firebase-config");

const getComments = async (req, res, next) => {
  try {
    const { siteId, week } = req.params;

    const commentsSnapshot = await db
      .collection("sites")
      .doc(siteId)
      .collection("pages")
      .doc(week)
      .collection("comments")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const comments = [];

    commentsSnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || null,
      });
    });

    res.json({ success: true, comments, count: comments.length });
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
