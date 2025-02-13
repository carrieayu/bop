import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import PersonnelPlanningEntity from "../../entity/personnelplanningEntity";
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { token } from "../../constants";

const initialState = {
    personnelPlanning: [],
    status: 'idle',
    error: null
};

export const fetchPlanning = createAsyncThunk('personnel/fetchPlanning', async () => {
    const response = await fetch(`${getReactActiveEndpoint()}/api/projects/list/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

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
