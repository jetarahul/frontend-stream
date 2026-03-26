import React, { useEffect, useState } from "react";

function OrderStream() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const sse = new EventSource("https://stream-service-820892686232.us-central1.run.app/events");

    sse.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setEvents((prev) => [...prev, data]);
    };

    sse.onerror = (err) => {
      console.error("SSE error:", err);
      sse.close();
    };

    return () => {
      sse.close();
    };
  }, []);

  return (
    <div>
      <h2>Live Order Events</h2>
      <ul>
        {events.map((e, idx) => (
          <li key={idx}>{JSON.stringify(e)}</li>
        ))}
      </ul>
    </div>
  );
}

export default OrderStream;
