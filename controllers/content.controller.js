const { getSheetRowsCached } = require("../services/sheets");
const formatDate = require("../utils/date-format");

const getContent = async (req, res) => {
  try {
    const { siteId, weekId } = req.params;

    const rows = await getSheetRowsCached();

    const tabs = rows
      .filter((r) => r.siteId === siteId)
      .map((r) => ({
        weekId: r.weekId,
        tab: r.tabLabel,
        // isLive: String(r.isLive).toLowerCase() === "true",
        // order: Number(r.order ?? 999),
      }))
      .sort((a, b) => a.order - b.order)
      .slice(0, 5);

    const row = rows.find(
      (row) => row.siteId === siteId && row.weekId === weekId,
    );

    if (!row) {
      return res.status(404).json({ success: false, error: "Not found" });
    }

    return res.json({
      success: true,
      tabs,
      giveaway: {
        siteId: row.siteId,
        weekId: row.weekId,
        tab: row.tabLabel,
        title: row.title,
        postedDate: formatDate(row.postedDate),
        content: row.content,
        bannerUrl: row.bannerUrl,
        question: row.question,
      },
    });
  } catch (e) {
    console.log(e);

    res.status(500).json({ success: false, error: e.message });
  }
};

const getEvents = async (req, res) => {
  const siteId = req.params.siteId;

  const weekId = req.query.weekId;

  try {
    const rows = await getSheetRowsCached();

    const events = rows
      .filter((r) => r.siteId === siteId)
      .sort((a, b) => a.order - b.order);

    if (weekId) {
      const event = events.filter((event) => event.weekId === weekId)[0];

      if (!event) {
        return res.status(404).json({ success: false, error: "Not found" });
      }

      return res.json({
        success: true,
        event,
      });
    }

    return res.json({
      success: true,
      events,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({ success: false, error: e.message });
  }
};

module.exports = { getContent, getEvents };
