import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import themeReducer from "../features/theme/themeSlice";
import interactionsReducer from "../features/interactions/interactionsSlice";
import chatReducer from "../features/chat/chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    interactions: interactionsReducer,
    chat: chatReducer,
  },
});
