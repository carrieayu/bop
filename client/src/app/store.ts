import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import CounterReducer from "../reducers/counter/counterSlice";
import userReducer from '../reducers/user/userSlice'
import CardReducer from "../reducers/card/cardSlice"
import tableSlice from "../reducers/table/tableSlice";
import graphSlice from "../reducers/graph/graphSlice";
import personnelExpenses from "../reducers/personnel/personnelExpensesSlice";

export const store = configureStore({
  reducer: {
    counter: CounterReducer,
    user: userReducer,
    cards: CardReducer,
    table: tableSlice,
    graph: graphSlice,
    personnel: personnelExpenses
  },
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
