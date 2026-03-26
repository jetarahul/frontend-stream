import React, { useEffect, useState } from 'react';

function OrderStream() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    let eventSource;

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

          // Ignore heartbeat events
          if (data.heartbeat) {
            return;
          }

          setEvents((prev) => [...prev, data]);
        } catch (err) {
          console.error('Error parsing SSE message', err);
        }
      };

      eventSource.onerror = () => {
        setStatus('Disconnected. Reconnecting...');
        eventSource.close();
        // Try reconnect after 3 seconds
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return (
    <div>
      <h2>Live Order Events</h2>
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