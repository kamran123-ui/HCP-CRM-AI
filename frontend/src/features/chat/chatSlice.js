import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { chatApi } from "../../api/crmApi";

export const sendChatMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ message, hcpId, history, conversationId }, { rejectWithValue }) => {
    try {
      return await chatApi.sendMessage({
        message,
        hcp_id: hcpId,
        history,
        conversation_id: conversationId,
      });
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "The assistant could not respond.");
    }
  }
);

const initialState = {
  messages: [], // { role: 'user' | 'assistant', content, toolCalls? }
  conversationId: null,
  status: "idle",
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    pushUserMessage(state, action) {
      state.messages.push({ role: "user", content: action.payload });
    },
    resetChat(state) {
      state.messages = [];
      state.conversationId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.conversationId = action.payload.conversation_id;
        state.messages.push({
          role: "assistant",
          content: action.payload.reply,
          toolCalls: action.payload.tool_calls,
        });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.messages.push({
          role: "assistant",
          content: "Sorry, I ran into an issue processing that. Please try again.",
          isError: true,
        });
      });
  },
});

export const { pushUserMessage, resetChat } = chatSlice.actions;
export default chatSlice.reducer;
