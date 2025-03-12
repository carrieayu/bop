import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import CounterReducer from "../reducers/counter/counterSlice";
import userReducer from '../reducers/user/userSlice'
import tableSlice from "../reducers/table/tableSlice";
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
import projectResultSlice from '../reducers/project/projectResultSlice'
import employeeExpenseSlice from '../reducers/employeeExpense/employeeExpenseSlice'
import employeeExpenseResultSlice from '../reducers/employeeExpense/employeeExpenseResultSlice'
import projectSlice from '../reducers/project/projectSlice'

export const store = configureStore({
  reducer: {
    counter: CounterReducer,
    user: userReducer,
    // 修正必要: 削除?
    table: tableSlice,
    // 修正必要: personnel is employee ??
    employee: personnelExpensesSlice,
    personnelData: personnelSlice,
    // 修正必要: personnelPlanning is employee expenses??
    personnelPlanning: personnelPlanningSlice,

    businessDivisions: businessDivisionsSlice,
    masterCompany: masterCompanySlice,
    clientMaster: clientMasterSlice,

    employeeExpense: employeeExpenseSlice,
    expenses: expensesSlice,
    costOfSale: costOfSaleSlice,
    project: projectSlice,
    // RESULTS
    costOfSaleResult: costOfSaleResultSlice,
    expensesResults: expensesResultsSlice,
    projectResult: projectResultSlice,
    employeeExpenseResult: employeeExpenseResultSlice,
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
