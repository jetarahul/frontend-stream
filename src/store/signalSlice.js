import { createSlice } from "@reduxjs/toolkit";

const signalSlice = createSlice({
  name: "signals",
  initialState: {
    list: []
  },
  reducers: {
    addSignal: (state, action) => {
      // prepend latest signal
      state.list.unshift(action.payload);
    },
    clearSignals: (state) => {
      state.list = [];
    }
  }
});

export const { addSignal, clearSignals } = signalSlice.actions;
export default signalSlice.reducer;
