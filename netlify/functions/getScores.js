const Airtable = require("airtable");

exports.handler = async (event) => {
  const { game } = event.queryStringParameters;

  // Initialize Airtable with token and base ID
  const base = new Airtable({
    apiKey: process.env.AIRTABLE_TOKEN, // Use token here
  }).base(process.env.AIRTABLE_BASE_ID);

  try {
    const records = await base(`Leaderboard_${game}`)
      .select({
        maxRecords: 10,
        sort: [{ field: "Score", direction: "desc" }],
      })
      .firstPage();

    const scores = records.map((record) => ({
      name: record.get("Name"),
      score: record.get("Score"),
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(scores),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch scores" }),
    };
  }
};
