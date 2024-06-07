import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import PersonnelPlanningEntity from "../../entity/personnelplanningEntity";
// import personnelSlice from "./personnelSlice";

const initialState = {
    personnelPlanning: [],
    status: 'idle',
    error: null
};

export const fetchPlanning = createAsyncThunk('personnel/fetchPlanning', async () => {
    const token = localStorage.getItem('accessToken'); // Replace with your actual token
    const response = await fetch('http://127.0.0.1:8000/api/planningprojects/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
});

const personnelPlanningSlice = createSlice({
    name: 'personnelPlanning',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPlanning.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPlanning.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.personnelPlanning = action.payload;
            })
            .addCase(fetchPlanning.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    }
});

export default personnelPlanningSlice.reducer;
