const Airtable = require("airtable");

exports.handler = async (event) => {
  const { game, name, score } = JSON.parse(event.body);

  // Initialize Airtable with token and base ID
  const base = new Airtable({
    apiKey: process.env.AIRTABLE_TOKEN, // Use token here
  }).base(process.env.AIRTABLE_BASE_ID);

  try {
    await base(`Leaderboard_${game}`).create([
      {
        fields: { Name: name, Score: score, Timestamp: new Date() },
      },
    ]);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Submission failed" }),
    };
  }
};
