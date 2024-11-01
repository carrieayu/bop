import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import PersonnelEntity from '../../entity/personnelEntity';
import { status } from 'nprogress';
import { error } from 'console';


interface PersonnelState {
    personnel: PersonnelEntity[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  }
  const initialState: PersonnelState = {
    personnel: [],
    status: 'idle',
    error: null,
  };

export const fetchPersonnelData = createAsyncThunk('',async () => {
    const response = await fetch('http://127.0.0.1:8000/api/fetch-personnel/');
    // const response = await fetch('http://54.178.202.58:8000/api/fetch-personnel/');
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