import { createSlice } from "@reduxjs/toolkit";

const orderEventsSlice = createSlice({
  name: "orderEvents",
  initialState: [],
  reducers: {
    addEvent: (state, action) => {
      state.unshift(action.payload); // prepend latest event
    },
    clearEvents: () => []
  }
});

export const { addEvent, clearEvents } = orderEventsSlice.actions;
export default orderEventsSlice.reducer;
