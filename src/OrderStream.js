// src/OrderStream.js
import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

function OrderStream() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("Disconnected");

  useEffect(() => {
    let eventSource;

    async function fetchHistory() {
      try {
        console.log("Fetching from collection: order_events");

        // Fetch all past events
        const querySnapshot = await getDocs(collection(db, "order_events"));
        const pastEvents = [];
        querySnapshot.forEach((docSnap) => {
          pastEvents.push({ id: docSnap.id, ...docSnap.data() });
        });
        console.log("Fetched past events:", pastEvents);

        // Direct document fetch test (optional)
        const testDocRef = doc(db, "order_events", "Rk87YTjm5hios4qOvSTG");
        const testDocSnap = await getDoc(testDocRef);
        if (testDocSnap.exists()) {
          console.log("Direct fetch testDoc:", testDocSnap.data());
        } else {
          console.log("Direct fetch testDoc: Not found");
        }

        // Deduplicate by id + symbol + status
        setEvents((prev) => {
          const combined = [...pastEvents, ...prev];
          const unique = combined.filter(
            (event, index, self) =>
              index ===
              self.findIndex(
                (e) =>
                  e.id === event.id ||
                  (e.symbol === event.symbol && e.status === event.status)
              )
          );
          return unique;
        });
      } catch (err) {
        console.error("Error loading Firestore history:", err);
      }
    }

    fetchHistory();

    const connect = () => {
      setStatus("Connecting...");
      eventSource = new EventSource(
        "https://stream-service-820892686232.us-central1.run.app/events"
      );

      eventSource.onopen = () => {
        setStatus("Connected");
      };

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.heartbeat) return;

          // Deduplicate SSE events
          setEvents((prev) => {
            const combined = [...prev, data];
            const unique = combined.filter(
              (event, index, self) =>
                index ===
                self.findIndex(
                  (e) =>
                    e.symbol === event.symbol && e.status === event.status
                )
            );
            return unique;
          });
        } catch (err) {
          console.error("Error parsing SSE message", err);
        }
      };

      eventSource.onerror = () => {
        setStatus("Disconnected. Reconnecting...");
        eventSource.close();
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  return (
    <div>
      <h1>Live Order Events</h1>
      <p>Status: {status}</p>
      <ul>
        {events.map((event, idx) => (
          <li key={idx}>
            {event.symbol} - {event.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OrderStream;
