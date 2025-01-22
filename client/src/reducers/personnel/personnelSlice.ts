import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { PersonnelEntity } from '../../entity/personnelEntity';

interface PersonnelState {
    personnel: PersonnelEntity[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  }
  const initialState: PersonnelState = {
    personnel: [] as PersonnelEntity[],
    status: 'idle',
    error: null,
  };

export const fetchPersonnelData = createAsyncThunk('',async () => {
    const response = await fetch(`${getReactActiveEndpoint()}/api/fetch-personnel/`)
    const data = await response.json();
    return data;
});

const personnelSlice = createSlice({
    name: 'personnel',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchPersonnelData.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(fetchPersonnelData.fulfilled, (state,action) => {
            state.status = 'succeeded';
            state.personnel = action.payload;
        })
        .addCase(fetchPersonnelData.rejected, (state,action) => {
            state.status = 'failed';
            state.error = action.error.message;
        });
    },
})

export default personnelSlice.reducer;