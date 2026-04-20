import { createSlice } from "@reduxjs/toolkit";

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState: { positions: [] },
  reducers: {
    setPortfolio: (state, action) => {
      state.positions = action.payload;
    },
    clearPortfolio: (state) => {
      state.positions = [];
    }
  }
});

export const { setPortfolio, clearPortfolio } = portfolioSlice.actions;
export default portfolioSlice.reducer;
