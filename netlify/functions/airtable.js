exports.handler = async function (event) {
  const token  = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!token || !baseId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing server configuration." }),
    };
  }

  const table  = event.queryStringParameters?.table;
  const offset = event.queryStringParameters?.offset || "";

  if (!table) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing 'table' query parameter." }),
    };
  }

  // Allowlist — only tables the resume actually needs
  const ALLOWED_TABLES = [
    "Headings_Titles",
    "Employers",
    "Positions",
    "Projects",
    "Skills",
    "Technologies",
    "Collaborations",
  ];

  if (!ALLOWED_TABLES.includes(table)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Table not permitted." }),
    };
  }

  try {
    const url = new URL(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`
    );
    if (offset) url.searchParams.set("offset", offset);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
