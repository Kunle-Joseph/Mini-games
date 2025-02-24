const Airtable = require("airtable");

exports.handler = async (event) => {
  const { game, name, score } = JSON.parse(event.body);

  if (typeof score !== "number" || score < 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid score format" }),
    };
  }

  const base = new Airtable({
    apiKey: process.env.AIRTABLE_TOKEN,
  }).base(process.env.AIRTABLE_BASE_ID);

  try {
    await base(`Leaderboard_${game}`).create([
      {
        fields: {
          Name: name,
          Score: score,
          Timestamp: new Date().toISOString(),
        },
      },
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to submit score",
        details: error.message,
      }),
    };
  }
};
