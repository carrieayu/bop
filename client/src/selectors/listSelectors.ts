import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../app/store";

// Select project data
export const selectProjects = (state: RootState) => state.project;

// Select expenses data
export const selectExpenses = (state: RootState) => state.expenses;

// Select cost of sales data
export const selectCostOfSales = (state: RootState) => state.costOfSale;

// Select employee expenses
export const selectEmployeeExpenses = (state: RootState) => state.employeeExpense;