import axios from "axios";

export async function requestSseUrl(baseUrl, idToken) {
  try {
    const response = await axios.post(`${baseUrl}/sse-token`, { idToken });
    if (response.data && response.data.url) {
      return response.data.url;
    }
    throw new Error("No SSE URL returned");
  } catch (err) {
    console.error("Error requesting SSE URL:", err);
    throw err;
  }
}
