import React, { useEffect, useState } from "react";

function OrderStream() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const events = new EventSource(
      "https://stream-service-820892686232.us-central1.run.app/events"
    );

    events.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOrders((prev) => [...prev, data]);
    };

    events.onerror = (err) => {
      console.error("EventSource failed:", err);
      events.close();
    };

    return () => events.close();
  }, []);

  return (
    <div>
      <h2>Live Order Events</h2>
      <ul>
        {orders.map((order, index) => (
          <li key={index}>
            {order.symbol} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OrderStream;
