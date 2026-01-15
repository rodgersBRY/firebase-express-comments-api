const { getSheetRowsCached } = require("../services/sheets");

const getContent = async (req, res) => {
  try {
    const { siteId, weekId } = req.params;

    const rows = await getSheetRowsCached();

    const row = rows.find(
      (row) => row.siteId === siteId && row.weekId === weekId
    );

    if (!row) {
      return res.status(404).json({ success: false, error: "Not found" });
    }

    return res.json({
      success: true,
      giveaway: {
        siteId: row.siteId,
        weekKey: row.weekKey,
        weekLabel: row.weekLabel, // e.g. "Week 47"
        title: row.title,
        postDateText: row.postDateText, // e.g. "Posted on: ..."
        captionHtml: row.content, // HTML string
        bannerUrl: row.bannerUrl,
        question: row.question,
      },
    });
  } catch (e) {
    console.log(e);

    res.status(500).json({ success: false, error: e.message });
  }
};

module.exports = { getContent };
