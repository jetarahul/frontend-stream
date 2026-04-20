import { useEffect } from "react";

export default function useSSE(getUrlFn, handlers) {
  useEffect(() => {
    let eventSource;
    let isMounted = true;

    const connect = async () => {
      try {
        const url = await getUrlFn();
        eventSource = new EventSource(url);

        eventSource.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const msg = JSON.parse(event.data);
            handlers.onMessage && handlers.onMessage(msg);
          } catch (err) {
            console.error("Bad SSE message:", err);
          }
        };

        eventSource.onopen = () => {
          handlers.onOpen && handlers.onOpen();
        };

        eventSource.onerror = () => {
          handlers.onClose && handlers.onClose();
          if (eventSource) eventSource.close();
          // reconnect after delay
          setTimeout(connect, 3000);
        };
      } catch (err) {
        console.error("Error connecting SSE:", err);
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
    };
  }, [getUrlFn]);
}
