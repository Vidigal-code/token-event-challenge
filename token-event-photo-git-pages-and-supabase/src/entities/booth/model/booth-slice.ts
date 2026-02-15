import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type BoothState = {
  step: number;
  qrCodeId: string;
};

const initialState: BoothState = {
  step: 1,
  qrCodeId: '',
};

const boothSlice = createSlice({
  name: 'booth',
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<number>) {
      state.step = action.payload;
    },
    setQrCodeId(state, action: PayloadAction<string>) {
      state.qrCodeId = action.payload;
    },
    resetFlow(state) {
      state.step = 1;
      state.qrCodeId = '';
    },
  },
});

export const { setStep, setQrCodeId, resetFlow } = boothSlice.actions;
export const boothReducer = boothSlice.reducer;

