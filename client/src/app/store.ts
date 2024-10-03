import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import CounterReducer from "../reducers/counter/counterSlice";
import userReducer from '../reducers/user/userSlice'
import CardReducer from "../reducers/card/cardSlice"
import tableSlice from "../reducers/table/tableSlice";
import graphSlice from "../reducers/graph/graphSlice";
import personnelExpensesSlice from "../reducers/personnel/personnelExpensesSlice";
import personnelSlice from "../reducers/personnel/personnelSlice";
import businessDivisionsSlice from '../reducers/businessDivisions/businessDivisionsSlice'
import masterCompanySlice from '../reducers/company/companySlice';
import personnelPlanningSlice from "../reducers/personnel/personnelPlanningSlice";
export const store = configureStore({
  reducer: {
    counter: CounterReducer,
    user: userReducer,
    cards: CardReducer,
    table: tableSlice,
    graph: graphSlice,
    personnel: personnelExpensesSlice,
    personnelData: personnelSlice,
    personnelPlanning: personnelPlanningSlice,
    businessDivisionsSlice: businessDivisionsSlice,
    masterCompanySlice: masterCompanySlice,
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
