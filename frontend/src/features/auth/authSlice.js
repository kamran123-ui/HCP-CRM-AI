import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi } from "../../api/authApi";

const TOKEN_KEY = "hcp_crm_token";

export const login = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    return await authApi.login(payload);
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || "Login failed.");
  }
});

export const signup = createAsyncThunk("auth/signup", async (payload, { rejectWithValue }) => {
  try {
    return await authApi.signup(payload);
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || "Sign up failed.");
  }
});

const initialState = {
  user: null,
  token: localStorage.getItem(TOKEN_KEY) || null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem(TOKEN_KEY);
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        localStorage.setItem(TOKEN_KEY, action.payload.access_token);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(signup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        localStorage.setItem(TOKEN_KEY, action.payload.access_token);
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
