import { configureStore } from "@reduxjs/toolkit";
import strategyReducer from "./strategySlice";
import orderReducer from "./orderSlice";
import signalReducer from "./signalSlice"; // ✅ existing
import orderEventsReducer from "./orderEventsSlice"; // ✅ new
import portfolioReducer from "./portfolioSlice";     // ✅ new

export const store = configureStore({
  reducer: {
    strategy: strategyReducer,
    order: orderReducer,
    signals: signalReducer,
    orderEvents: orderEventsReducer,   // ✅ new slice added
    portfolio: portfolioReducer        // ✅ new slice added
  }
});
