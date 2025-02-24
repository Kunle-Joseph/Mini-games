const Airtable = require("airtable");

exports.handler = async (event) => {
  const { game } = event.queryStringParameters;
  const base = new Airtable({
    apiKey: process.env.AIRTABLE_TOKEN,
  }).base(process.env.AIRTABLE_BASE_ID);

  try {
    const records = await base(`Leaderboard_${game}`)
      .select({
        maxRecords: 10,
        sort: [{ field: "Score", direction: "desc" }],
      })
      .all();

    const scores = records.map((record) => ({
      name: record.get("Name") || "Anonymous",
      score: record.get("Score"),
      timestamp: record.get("Timestamp"),
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(scores),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch leaderboard" }),
    };
  }
};
