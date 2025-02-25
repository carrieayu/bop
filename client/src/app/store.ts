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
import clientMasterSlice from "../reducers/client/clientSlice";
import costOfSaleSlice from "../reducers/costOfSale/costOfSaleSlice";
import costOfSaleResultSlice from '../reducers/costOfSale/costOfSaleResultSlice'
import expensesSlice from "../reducers/expenses/expensesSlice";
import expensesResultsSlice from '../reducers/expenses/expensesResultsSlice'
import planningAndResultTotalsSlice from '../reducers/planningAndResultTotals/planningAndResultTotalsSlice'
import projectResultSlice from '../reducers/project/projectResultSlice'
import employeeExpenseSlice from '../reducers/employeeExpense/employeeExpenseSlice'
import employeeExpenseResultSlice from '../reducers/employeeExpense/employeeExpenseResultSlice'
import projectSlice from '../reducers/project/projectSlice'
import newGraphSlice from '../reducers/graph/newGraphSlice'

export const store = configureStore({
  reducer: {
    counter: CounterReducer,
    user: userReducer,
    // cards is actually projects?
    cards: CardReducer,
    table: tableSlice,
    graph: graphSlice,
    newGraph: newGraphSlice,
    // personnel is employee ??
    personnel: personnelExpensesSlice,
    personnelData: personnelSlice,
    // personnelPlanning is employee expenses??
    personnelPlanning: personnelPlanningSlice,
    
    businessDivisionsSlice: businessDivisionsSlice,
    masterCompanySlice: masterCompanySlice,
    clientMasterSlice: clientMasterSlice,
    
    totals: planningAndResultTotalsSlice,
    
    employeeExpense: employeeExpenseSlice,
    expenses: expensesSlice,
    costOfSale: costOfSaleSlice,
    project: projectSlice,
    // RESULTS
    costOfSaleResult: costOfSaleResultSlice,
    expensesResults: expensesResultsSlice,
    projectResult: projectResultSlice,
    employeeExpenseResult: employeeExpenseResultSlice
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
