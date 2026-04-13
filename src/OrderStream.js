import React, { useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

function OrderStream() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    let eventSource;

    // Step 1: Load past events from Firestore
    async function fetchHistory() {
      try {
        const querySnapshot = await getDocs(collection(db, "order_events"));
        const pastEvents = [];
        querySnapshot.forEach((doc) => {
          pastEvents.push(doc.data());
        });
        setEvents((prev) => [...pastEvents, ...prev]);
      } catch (err) {
        console.error("Error loading Firestore history:", err);
      }
    }
    fetchHistory();

    // Step 2: Connect to SSE for live events
    const connect = () => {
      setStatus('Connecting...');
      eventSource = new EventSource(
        'https://stream-service-820892686232.us-central1.run.app/events'
      );

      eventSource.onopen = () => {
        setStatus('Connected');
      };

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.heartbeat) return; // ignore heartbeat
          setEvents((prev) => [...prev, data]);
        } catch (err) {
          console.error('Error parsing SSE message', err);
        }
      };

      eventSource.onerror = () => {
        setStatus('Disconnected. Reconnecting...');
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
      <h2>Order Events</h2>
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
