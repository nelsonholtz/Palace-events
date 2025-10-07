import fetch from "node-fetch";
import * as functions from "firebase-functions";

// Cloud Function: Ticketmaster proxy
export const ticketmasterProxy = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const { keyword, city, startDateTime, endDateTime } = req.query;
    const apiKey = functions.config().ticketmaster.key;

    const url = new URL(
      "https://app.ticketmaster.com/discovery/v2/events.json"
    );
    if (keyword) url.searchParams.append("keyword", keyword);
    if (city) url.searchParams.append("city", city);
    if (startDateTime) url.searchParams.append("startDateTime", startDateTime);
    if (endDateTime) url.searchParams.append("endDateTime", endDateTime);
    url.searchParams.append("apikey", apiKey);

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching from Ticketmaster:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});
