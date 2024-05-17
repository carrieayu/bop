import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import CardEntity from "../../entity/cardEntity";
import api from "../../api/api";

const initialState = {
    isLoading: false,
    cardsList: [new CardEntity({})]
} 

export const fetchAllCards = createAsyncThunk(
    "",
    async () => {
      return await api.get<CardEntity[]>(`http://127.0.0.1:8000/api/planningprojects/`).then((res) => {
       
        return res.data.map((data) => new CardEntity(data))
      });

    }
  );

const cardSlice =  createSlice({
    name: 'card',
    initialState,
    reducers: {

    },
    extraReducers(builder) {
        builder
        .addCase(fetchAllCards.fulfilled, (state, action) => {
            console.log(action.payload)
            state.cardsList = action.payload;
            state.isLoading = false;
            console.log("state", state)

        })
        .addCase(fetchAllCards.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(fetchAllCards.rejected, (state) => {
            state.isLoading = false;

        })
    }
})

export const {
    
} = cardSlice.actions

export default cardSlice.reducer