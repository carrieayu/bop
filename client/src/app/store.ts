import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import CounterReducer from "../reducers/counter/counterSlice";
import userReducer from '../reducers/user/userSlice'
import CardReducer from "../reducers/card/cardSlice"
import tableSlice from "../reducers/table/tableSlice";
import graphSlice from "../reducers/graph/graphSlice";
import personnelExpensesSlice from "../reducers/personnel/personnelExpensesSlice";
import personnelSlice from "../reducers/personnel/personnelSlice";
import businessDivisionsSlice from '../reducers/businessdivisions/businessdivisionsSlice'
import masterCompanySlice from '../reducers/company/companySlice';
import personnelPlanningSlice from "../reducers/personnel/personnelPlanningSlice";
import clientMasterSlice from "../reducers/client/clientSlice";

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
    clientMasterSlice: clientMasterSlice,
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
