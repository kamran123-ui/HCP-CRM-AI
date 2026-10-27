import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { hcpApi, interactionApi } from "../../api/crmApi";

export const fetchHcps = createAsyncThunk("interactions/fetchHcps", async (q) => hcpApi.list(q));

export const fetchInteractions = createAsyncThunk("interactions/fetchInteractions", async (hcpId) =>
  interactionApi.list(hcpId)
);

export const createInteraction = createAsyncThunk(
  "interactions/createInteraction",
  async (payload, { rejectWithValue }) => {
    try {
      return await interactionApi.create(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Could not save interaction.");
    }
  }
);

const initialState = {
  hcps: [],
  items: [],
  status: "idle",
  saveStatus: "idle",
  error: null,
};

const interactionsSlice = createSlice({
  name: "interactions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHcps.fulfilled, (state, action) => {
        state.hcps = action.payload;
      })
      .addCase(fetchInteractions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchInteractions.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(createInteraction.pending, (state) => {
        state.saveStatus = "loading";
      })
      .addCase(createInteraction.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createInteraction.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.payload;
      });
  },
});

export default interactionsSlice.reducer;
