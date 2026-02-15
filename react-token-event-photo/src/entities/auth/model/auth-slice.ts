import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type AuthUser = {
  id: string;
  email?: string;
  role?: string;
};

type AuthState = {
  initialized: boolean;
  authenticated: boolean;
  user: AuthUser | null;
  csrfToken: string | null;
};

const initialState: AuthState = {
  initialized: false,
  authenticated: false,
  user: null,
  csrfToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<AuthState>) {
      state.initialized = action.payload.initialized;
      state.authenticated = action.payload.authenticated;
      state.user = action.payload.user;
      state.csrfToken = action.payload.csrfToken;
    },
    setAuthInitialized(state, action: PayloadAction<boolean>) {
      state.initialized = action.payload;
    },
    setCsrfToken(state, action: PayloadAction<string | null>) {
      state.csrfToken = action.payload;
    },
    logoutSession(state) {
      state.authenticated = false;
      state.user = null;
      state.csrfToken = null;
    },
  },
});

export const { setSession, setAuthInitialized, setCsrfToken, logoutSession } =
  authSlice.actions;
export const authReducer = authSlice.reducer;

