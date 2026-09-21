const TABLE_FIELDS = Object.freeze({
  Headings_Titles: [
    "Name",
    "Location",
    "Phone Number",
    "Email",
    "URL1",
    "Title1",
    "Title2",
    "Title 3",
  ],
  Employers: [
    "Employer",
    "Start Date",
    "End Date",
    "Industry",
    "Location",
    "Key Legacy",
    "Projects",
    "Positions",
    "Skills",
    "Collaborations",
    "Technologies",
  ],
  Positions: [
    "Position",
    "Employer",
    "Employer Short Name",
    "Focus",
    "Team",
    "PositionID",
    "Projects",
  ],
  Projects: [
    "Project",
    "Practice Area",
    "Primary Skill",
    "Project Type",
    "Setting",
    "Project Summary",
    "Problem Statement",
    "Execution Path",
    "Outcome / Impact",
    "Employers",
    "Skills",
    "Technologies",
    "Collaborations",
    "Positions",
  ],
  Skills: [
    "Skill",
    "Skill Summary",
    "Skill Type",
    "Skill Proficiency",
    "Strategic Tier",
    "Projects",
    "Employers",
    "Positions",
    "Collaborations",
    "Technologies",
  ],
  Technologies: [
    "Technology",
    "Tech Category",
    "Employers",
    "Projects",
    "Role (Multiselect)",
    "Collaborations",
    "Positions",
  ],
  Collaborations: [
    "Partner Team",
    "Representative Collaboration",
    "Partner Type",
    "Projects",
    "Employers",
    "Environment",
    "Technologies",
    "Skills",
    "Positions",
  ],
});

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    "X-Content-Type-Options": "nosniff",
  },
  body: JSON.stringify(body),
});

exports.handler = async function (event) {
  if (event.httpMethod && event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed." });
  }

  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!token || !baseId) {
    return json(500, { error: "Missing server configuration." });
  }

  const table = event.queryStringParameters?.table;
  const offset = event.queryStringParameters?.offset || "";
  const fields = TABLE_FIELDS[table];

  if (!table) {
    return json(400, { error: "Missing 'table' query parameter." });
  }

  if (!fields) {
    return json(403, { error: "Table not permitted." });
  }

  try {
    const url = new URL(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`
    );
    fields.forEach((field) => url.searchParams.append("fields[]", field));
    if (offset) url.searchParams.set("offset", offset);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Airtable request failed", response.status, data?.error?.type);
      return json(response.status, { error: "Unable to load resume data." });
    }

    return json(200, {
      records: (data.records || []).map(({ id, fields: recordFields }) => ({
        id,
        fields: recordFields,
      })),
      ...(data.offset ? { offset: data.offset } : {}),
    });
  } catch (error) {
    console.error("Airtable proxy error", error);
    return json(500, { error: "Unable to load resume data." });
  }
};
