import React, { useEffect, useState } from 'react'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { getResultsA } from '../../api/ResultsEndpoint/GetResultsA'
import { updateResults } from '../../api/ResultsEndpoint/UpdateResults'
import { months, token } from '../../constants'
import { organiseTotals } from '../../utils/helperFunctionsUtil'

const EditTableResults = () => {
  const [data, setData] = useState([])
  const [previousData, setPreviousData] = useState([])
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  useEffect(() => {
    getResultsA(token)
      .then((response) => {
        const aggregatedData = response.cost_of_sales_results.reduce((acc, item) => {
          const { month, ...values } = item
          if (!acc[month]) {
            acc[month] = { ...values }
          } else {
            Object.keys(values).forEach((key) => {
              acc[month][key] += values[key]
            })
          }
          return acc
        }, {})
        const aggregatedExpensesData = response.expenses_results.reduce((acc, item) => {
          const { month, ...values } = item
          if (!acc[month]) {
            acc[month] = { month, ...values } // Include month in the object
          } else {
            Object.keys(values).forEach((key) => {
              acc[month][key] += values[key]
            })
          }
          return acc
        }, {})

        const aggregatedEmployeeExpensesResults = response.employee_expenses_results.reduce((acc, item) => {
          const { month, employee, project, ...values } = item // Destructure employee and project

          // Initialize month if not already present
          if (!acc[month]) {
            acc[month] = {
              month,
              employees: [employee], // Store employees as an array
              projects: [project], // Store projects as an array
              totalSalary: Number(employee.salary) || 0, // Initialize totalSalary with the first employee's salary
              totalExecutiveRemuneration: Number(employee.executive_remuneration) || 0,
              totalBonusAndFuel: Number(employee.bonus_and_fuel_allowance) || 0,
              totalStatutoryWelfare: Number(employee.statutory_welfare_expense) || 0,
              totalWelfare: Number(employee.welfare_expense) || 0,
              totalInsurancePremium: Number(employee.insurance_premium) || 0,
              ...values,
            }
          } else {
            // Add the new employee and project objects to the array
            acc[month].employees.push(employee)
            acc[month].projects.push(project)

            // Add the employee's salary to the total
            acc[month].totalSalary += Number(employee.salary) || 0
            acc[month].totalExecutiveRemuneration += Number(employee.executive_remuneration) || 0
            acc[month].totalBonusAndFuel += Number(employee.bonus_and_fuel_allowance) || 0
            acc[month].totalStatutoryWelfare += Number(employee.statutory_welfare_expense) || 0
            acc[month].totalWelfare += Number(employee.welfare_expense) || 0
            acc[month].totalInsurancePremium += Number(employee.insurance_premium) || 0

            // Aggregate other numeric fields
            Object.keys(values).forEach((key) => {
              if (typeof values[key] === 'number') {
                acc[month][key] += values[key]
              } else if (typeof values[key] === 'string') {
                // Handle strings like `created_at`, `updated_at`, and other concatenation-sensitive fields
                acc[month][key] = values[key] // Keep the latest value or handle as needed
              }
            })
          }
          return acc
        }, {})
        const aggregatedProjectSalesResultsData = response.project_sales_results.reduce((acc, item) => {
          const { project, ...values } = item
          const month = project?.month
          if (!month) {
            return acc
          }
          if (!acc[month]) {
            acc[month] = { month }
          }
          Object.keys(values).forEach((key) => {
            const value = parseFloat(values[key])
            if (!isNaN(value)) {
              acc[month][key] = (acc[month][key] || 0) + value
            }
          })

          return acc
        }, {})

        // SALES REVENUE
        const salesValues = months.map((month) => aggregatedProjectSalesResultsData[month]?.sales_revenue || 0)

        // COST OF SALES
        const costOfSalesValues = months.map((month) => {
          const purchases = Number(aggregatedData[month]?.purchase) || 0
          const outsourcing = Number(aggregatedData[month]?.outsourcing_expense) || 0
          const productPurchase = Number(aggregatedData[month]?.product_purchase) || 0
          const dispatchLabor = Number(aggregatedData[month]?.dispatch_labor_expense) || 0
          const communicationCost = Number(aggregatedData[month]?.communication_expense) || 0
          const workInProgress = Number(aggregatedData[month]?.work_in_progress_expense) || 0
          const amortization = Number(aggregatedData[month]?.amortization_expense) || 0
          return (
            purchases +
            outsourcing +
            productPurchase +
            dispatchLabor +
            communicationCost +
            workInProgress +
            amortization
          )
        })
        const purchasesValues = months.map((month) => {
          const dataEntry = aggregatedData[month]
          if (dataEntry) {
            return {
              id: dataEntry.cost_of_sale_result_id,
              purchase: dataEntry.purchase || 0, // Ensure we have a purchase value or fallback to 0
            }
          }
          return { id: null, purchase: 0 } // Default case if dataEntry is missing
        })

        // const outsourcingExpenseValues = months.map((month) => aggregatedData[month]?.outsourcing_expense || 0)
        const outsourcingExpenseValues = months.map((month) => {
          const dataEntry = aggregatedData[month]
          if (dataEntry) {
            return {
              id: dataEntry.cost_of_sale_result_id,
              outsourcing_expense: dataEntry.outsourcing_expense || 0,
            }
          }
          return { id: null, outsourcing_expense: 0 }
        })
        // const productPurchaseValues = months.map((month) => aggregatedData[month]?.product_purchase || 0)
        const productPurchaseValues = months.map((month) => {
          const dataEntry = aggregatedData[month]
          if (dataEntry) {
            return {
              id: dataEntry.cost_of_sale_result_id,
              product_purchase: dataEntry.product_purchase || 0,
            }
          }
          return { id: null, product_purchase: 0 }
        })
        // const dispatchLaborExpenseValues = months.map((month) => aggregatedData[month]?.dispatch_labor_expense || 0)
        const dispatchLaborExpenseValues = months.map((month) => {
          const dataEntry = aggregatedData[month]
          if (dataEntry) {
            return {
              id: dataEntry.cost_of_sale_result_id,
              dispatch_labor_expense: dataEntry.dispatch_labor_expense || 0,
            }
          }
          return { id: null, dispatch_labor_expense: 0 }
        })
        // const communicationCostValues = months.map((month) => aggregatedData[month]?.communication_expense || 0)
        const communicationCostValues = months.map((month) => {
          const dataEntry = aggregatedData[month]
          if (dataEntry) {
            return {
              id: dataEntry.cost_of_sale_result_id,
              communication_expense: dataEntry.communication_expense || 0,
            }
          }
          return { id: null, communication_expense: 0 }
        })
        // const workInProgressValues = months.map((month) => aggregatedData[month]?.work_in_progress_expense || 0)
        const workInProgressValues = months.map((month) => {
          const dataEntry = aggregatedData[month]
          if (dataEntry) {
            return {
              id: dataEntry.cost_of_sale_result_id,
              work_in_progress_expense: dataEntry.work_in_progress_expense || 0,
            }
          }
          return { id: null, work_in_progress_expense: 0 }
        })
        // const amortizationValues = months.map((month) => aggregatedData[month]?.amortization_expense || 0)
        const amortizationValues = months.map((month) => {
          const dataEntry = aggregatedData[month]
          if (dataEntry) {
            return {
              id: dataEntry.cost_of_sale_result_id,
              amortization_expense: dataEntry.amortization_expense || 0,
            }
          }
          return { id: null, amortization_expense: 0 }
        })

        // GROSS PROFIT
        const grossProfitValues = months.map((month, index) => {
          const totalSales = salesValues[index] // Get the sales revenue for the current month
          const totalCostOfSales = costOfSalesValues[index] // Get the cost of sales for the current month
          const grossProfit = totalSales - totalCostOfSales // Calculate gross profit
          return grossProfit
        })

        // EMPLOYEE EXPENSE
        const employeeExpenseExecutiveRemunerationValues = months.map(
          (month) => aggregatedEmployeeExpensesResults[month]?.totalExecutiveRemuneration || 0,
        )
        const employeeExpenseSalaryValues = months.map(
          (month) => aggregatedEmployeeExpensesResults[month]?.totalSalary || 0,
        )
        const employeeExpenseBonusAndFuelAllowanceValues = months.map(
          (month) => aggregatedEmployeeExpensesResults[month]?.totalBonusAndFuel || 0,
        )
        const employeeExpenseStatutoryWelfareExpenseValues = months.map(
          (month) => aggregatedEmployeeExpensesResults[month]?.totalStatutoryWelfare || 0,
        )
        const employeeExpenseWelfareExpenseValues = months.map(
          (month) => aggregatedEmployeeExpensesResults[month]?.totalWelfare || 0,
        )
        const employeeExpenseInsurancePremiumValues = months.map(
          (month) => aggregatedEmployeeExpensesResults[month]?.totalInsurancePremium || 0,
        )

        // EMPLOYEE EXPENSE TOTALS
        const employeeExpensesValues = months.map((month) => {
          const executiveRemuneration =
            Number(aggregatedEmployeeExpensesResults[month]?.totalExecutiveRemuneration) || 0
          const salary = Number(aggregatedEmployeeExpensesResults[month]?.totalSalary) || 0
          const bonusAndFuelAllowance = Number(aggregatedEmployeeExpensesResults[month]?.totalBonusAndFuel) || 0
          const statutoryWelfareExpense = Number(aggregatedEmployeeExpensesResults[month]?.totalStatutoryWelfare) || 0
          const welfareExpense = Number(aggregatedEmployeeExpensesResults[month]?.totalWelfare) || 0
          const insurancePremium = Number(aggregatedEmployeeExpensesResults[month]?.totalInsurancePremium) || 0
          return (
            executiveRemuneration +
            salary +
            bonusAndFuelAllowance +
            statutoryWelfareExpense +
            welfareExpense +
            insurancePremium
          )
        })

        // EXPENSES
        const expenseValues = months.map((month) => {
          const consumables = Number(aggregatedExpensesData[month]?.consumable_expense) || 0
          const rent = Number(aggregatedExpensesData[month]?.rent_expense) || 0
          const taxAndPublicCharge = Number(aggregatedExpensesData[month]?.tax_and_public_charge) || 0
          const depreciation = Number(aggregatedExpensesData[month]?.depreciation_expense) || 0
          const travelExpense = Number(aggregatedExpensesData[month]?.travel_expense) || 0
          const communicationExpense = Number(aggregatedExpensesData[month]?.communication_expense) || 0
          const utilitiesExpense = Number(aggregatedExpensesData[month]?.utilities_expense) || 0
          const transactionFee = Number(aggregatedExpensesData[month]?.transaction_fee) || 0
          const advertisingExpense = Number(aggregatedExpensesData[month]?.advertising_expense) || 0
          const entertainmentExpense = Number(aggregatedExpensesData[month]?.entertainment_expense) || 0
          const professionalServiceFee = Number(aggregatedExpensesData[month]?.professional_service_fee) || 0
          return (
            consumables +
            rent +
            taxAndPublicCharge +
            depreciation +
            travelExpense +
            communicationExpense +
            utilitiesExpense +
            transactionFee +
            advertisingExpense +
            entertainmentExpense +
            professionalServiceFee
          )
        })
        // const consumableValues = months.map((month) => aggregatedExpensesData[month]?.consumable_expense || 0)
        const consumableValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.expense_result_id,
              consumable_expense: dataEntry.consumable_expense || 0,
            }
          }
          return { id: null, consumable_expense: 0 }
        })

        // const rentValues = months.map((month) => aggregatedExpensesData[month]?.rent_expense || 0)
        const rentValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.expense_result_id,
              rent_expense: dataEntry.rent_expense || 0,
            }
          }
          return { id: null, rent_expense: 0 }
        })

        const taxesPublicChargesValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.expense_result_id,
              tax_and_public_charge: dataEntry.tax_and_public_charge || 0,
            }
          }
          return { id: null, tax_and_public_charge: 0 }
        })
        // const depreciationExpensesValues = months.map(
        //   (month) => aggregatedExpensesData[month]?.depreciation_expense || 0,
        // )
        const depreciationExpensesValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.expense_result_id,
              depreciation_expense: dataEntry.depreciation_expense || 0,
            }
          }
          return { id: null, depreciation_expense: 0 }
        })

        // const travelExpenseValues = months.map((month) => aggregatedExpensesData[month]?.travel_expense || 0)
        const travelExpenseValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.expense_result_id,
              travel_expense: dataEntry.travel_expense || 0,
            }
          }
          return { id: null, travel_expense: 0 }
        })
        // const communicationExpenseValues = months.map(
        //   (month) => aggregatedExpensesData[month]?.communication_expense || 0,
        // )
        const communicationExpenseValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.expense_result_id,
              communication_expense: dataEntry.communication_expense || 0,
            }
          }
          return { id: null, communication_expense: 0 }
        })
        // const utilitiesValues = months.map((month) => aggregatedExpensesData[month]?.utilities_expense || 0)
        const utilitiesValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.expense_result_id,
              utilities_expense: dataEntry.utilities_expense || 0,
            }
          }
          return { id: null, utilities_expense: 0 }
        })
        // const transactionFeeValues = months.map((month) => aggregatedExpensesData[month]?.transaction_fee || 0)
        const transactionFeeValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.expense_result_id,
              transaction_fee: dataEntry.transaction_fee || 0,
            }
          }
          return { id: null, transaction_fee: 0 }
        })
        // const advertisingExpenseValues = months.map((month) => aggregatedExpensesData[month]?.advertising_expense || 0)
        const advertisingExpenseValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.expense_result_id,
              advertising_expense: dataEntry.advertising_expense || 0,
            }
          }
          return { id: null, advertising_expense: 0 }
        })
        // const entertainmentExpenseValues = months.map(
        //   (month) => aggregatedExpensesData[month]?.entertainment_expense || 0,
        // )
        const entertainmentExpenseValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.expense_result_id,
              entertainment_expense: dataEntry.entertainment_expense || 0,
            }
          }
          return { id: null, entertainment_expense: 0 }
        })

        // const professionalServiceFeeValues = months.map(
        //   (month) => aggregatedExpensesData[month]?.professional_service_fee || 0,
        // )
        const professionalServiceFeeValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.expense_result_id,
              professional_service_fee: dataEntry.professional_service_fee || 0,
            }
          }
          return { id: null, professional_service_fee: 0 }
        })

        // SELLING AND GENERAL ADMIN EXPENSES
        const sellingAndGeneralAdminExpenseValues = months.map((month, index) => {
          const totalEmployeeExpense = employeeExpensesValues[index] // Get the total employee expense for the current month
          const totalExpense = expenseValues[index] // Get the total expense for the current month
          const sellingAndGeneralAdminExpense = totalEmployeeExpense + totalExpense // Calculation for Selling and General Admin Expense
          return sellingAndGeneralAdminExpense
        })

        // OPERATING INCOME
        const operatingIncomeValues = months.map((month, index) => {
          const grossProfit = grossProfitValues[index] // Get the gross profit for the current month
          const sellingAndGeneralAdmin = sellingAndGeneralAdminExpenseValues[index] // Get the Selling and General Admin Expense for the current month
          const operatingIncomeValue = grossProfit - sellingAndGeneralAdmin // Calculate operating income value
          return operatingIncomeValue
        })
        //NoN Operating Income & Expense
        const nonOperatingIncomeValues = months.map(
          (month) => aggregatedProjectSalesResultsData[month]?.non_operating_income || 0,
        )
        const nonOperatingExpensesValues = months.map(
          (month) => aggregatedProjectSalesResultsData[month]?.non_operating_expense || 0,
        )

        const ordinaryProfitValues = months.map((month, index) => {
          const operatingIncome = operatingIncomeValues[index]
          const nonOperatingIncome = nonOperatingIncomeValues[index]
          const totalOperating = operatingIncome + nonOperatingIncome
          const totalOrdinaryIncome = totalOperating - nonOperatingExpensesValues[index]
          return totalOrdinaryIncome
        })

        const cumulativeSum = (arr) => {
          let sum = 0
          return arr.map((value) => (sum += value))
        }
        const cumulativeOrdinaryProfitValues = cumulativeSum(ordinaryProfitValues)

        const firstHalfTotal = (arr) => arr.slice(0, 6).reduce((acc, value) => acc + parseFloat(value), 0)
        const secondHalfTotal = (arr) => arr.slice(6).reduce((acc, value) => acc + parseFloat(value), 0)
        const total = (arr) => arr.reduce((acc, value) => acc + parseFloat(value), 0)

        const data = [
          // Sales revenue section
          {
            label: 'salesRevenue',
            values: organiseTotals(salesValues),
          },
          {
            label: 'sales',
            values: organiseTotals(salesValues),
          },
          // Cost of sales section
          {
            label: 'costOfSales',
            values: organiseTotals(costOfSalesValues),
          },
          {
            id: purchasesValues.map((entry) => entry.id),
            label: 'purchases',
            values: organiseTotals(purchasesValues.map((entry) => entry.purchase)),
          },
          {
            id: outsourcingExpenseValues.map((outsource) => outsource.id), // Extract ids from the entries
            label: 'outsourcingExpenses',
            values: organiseTotals(outsourcingExpenseValues.map((outsource) => outsource.outsourcing_expense)),
          },
          {
            id: productPurchaseValues.map((product) => product.id),
            label: 'productPurchases',
            values: organiseTotals(productPurchaseValues.map((product) => product.product_purchase)),
          },
          {
            id: dispatchLaborExpenseValues.map((dispatch) => dispatch.id),
            label: 'dispatchLaborExpenses',
            values: organiseTotals(dispatchLaborExpenseValues.map((dispatch) => dispatch.dispatch_labor_expense)),
          },
          {
            id: communicationCostValues.map((communication) => communication.id),
            label: 'communicationExpenses',
            values: organiseTotals(communicationCostValues.map((communication) => communication.communication_expense)),
          },
          {
            id: workInProgressValues.map((wip) => wip.id),
            label: 'workInProgressExpenses',
            values: organiseTotals(workInProgressValues.map((wip) => wip.work_in_progress_expense)),
          },
          {
            id: amortizationValues.map((amortization) => amortization.id),
            label: 'amortizationExpenses',
            values: organiseTotals(amortizationValues.map((amortization) => amortization.amortization_expense)),
          },
          // Gross profit
          {
            label: 'grossProfit',
            values: organiseTotals(grossProfitValues),
          },
          // Employee expense section
          {
            label: 'employeeExpenses',
            values: organiseTotals(employeeExpensesValues),
          },
          {
            id: employeeExpenseExecutiveRemunerationValues.map((remuneration) => remuneration.id),
            label: 'executiveRemuneration',
            values: organiseTotals(employeeExpenseExecutiveRemunerationValues),
          },
          {
            label: 'salary',
            values: organiseTotals(employeeExpenseSalaryValues),
          },
          {
            id: employeeExpenseBonusAndFuelAllowanceValues.map((fuel) => fuel.id),
            label: 'bonusAndFuelAllowance',
            values: organiseTotals(employeeExpenseBonusAndFuelAllowanceValues),
          },
          {
            id: employeeExpenseStatutoryWelfareExpenseValues.map((statutory) => statutory.id),
            label: 'statutoryWelfareExpenses',
            values: organiseTotals(employeeExpenseStatutoryWelfareExpenseValues),
          },
          {
            id: employeeExpenseWelfareExpenseValues.map((welfare) => welfare.id),
            label: 'welfareExpenses',
            values: organiseTotals(employeeExpenseWelfareExpenseValues),
          },
          {
            label: 'insurancePremiums',
            values: organiseTotals(employeeExpenseInsurancePremiumValues),
          },
          // Expenses section
          {
            label: 'expenses',
            values: organiseTotals(expenseValues),
          },
          {
            //same value to " 給与手当 " ?
            id: consumableValues.map((consumable) => consumable.id),
            label: 'consumableExpenses',
            values: organiseTotals(consumableValues.map((consumable) => consumable.consumable_expense)),
          },
          {
            id: rentValues.map((rent) => rent.id),
            label: 'rentExpenses',
            values: organiseTotals(rentValues.map((rent) => rent.rent_expense)),
          },
          {
            id: taxesPublicChargesValues.map((taxes) => taxes.id),
            label: 'taxesAndPublicCharges',
            values: organiseTotals(taxesPublicChargesValues.map((taxes) => taxes.tax_and_public_charge)),
          },
          {
            id: depreciationExpensesValues.map((depreciation) => depreciation.id),
            label: 'depreciationExpenses',
            values: organiseTotals(depreciationExpensesValues.map((depreciation) => depreciation.depreciation_expense)),
          },
          {
            id: travelExpenseValues.map((travel) => travel.id),
            label: 'travelExpenses',
            values: organiseTotals(travelExpenseValues.map((travel) => travel.travel_expense)),
          },
          {
            id: communicationExpenseValues.map((communicationExpense) => communicationExpense.id),
            label: 'communicationExpenses',
            values: organiseTotals(
              communicationExpenseValues.map((communicationExpense) => communicationExpense.communication_expense),
            ),
          },
          {
            id: utilitiesValues.map((utils) => utils.id),
            label: 'utilitiesExpenses',
            values: organiseTotals(utilitiesValues.map((utils) => utils.utilities_expense)),
          },
          {
            id: transactionFeeValues.map((transaction) => transaction.id),
            label: 'transactionFees',
            values: organiseTotals(transactionFeeValues.map((transaction) => transaction.transaction_fee)),
          },
          {
            id: advertisingExpenseValues.map((advertising) => advertising.id),
            label: 'advertisingExpenses',
            values: organiseTotals(advertisingExpenseValues.map((advertising) => advertising.advertising_expense)),
          },
          {
            id: entertainmentExpenseValues.map((entertainment) => entertainment.id),
            label: 'entertainmentExpenses',
            values: organiseTotals(
              entertainmentExpenseValues.map((entertainment) => entertainment.entertainment_expense),
            ),
          },
          {
            id: professionalServiceFeeValues.map((professional) => professional.id),
            label: 'professionalServicesFees',
            values: organiseTotals(
              professionalServiceFeeValues.map((professional) => professional.professional_service_fee),
            ),
          },
          // Selling and general admin expenses
          {
            label: 'sellingAndGeneralAdminExpensesShort',
            values: organiseTotals(sellingAndGeneralAdminExpenseValues),
          },
          // Operating income section
          {
            label: 'operatingIncome',
            values: organiseTotals(operatingIncomeValues),
          },
          {
            label: 'nonOperatingIncome',
            values: organiseTotals(nonOperatingIncomeValues),
          },
          {
            label: 'nonOperatingExpenses',
            values: organiseTotals(nonOperatingExpensesValues),
          },
          {
            label: 'ordinaryIncome',
            values: organiseTotals(ordinaryProfitValues),
          },
          {
            label: 'cumulativeOrdinaryIncome',
            values: organiseTotals(cumulativeOrdinaryProfitValues),
          },
        ]


        const previousData = [
          // Sales revenue section
          {
            label: 'salesRevenue',
            values: organiseTotals(salesValues),
          },
          {
            label: 'sales',
            values: organiseTotals(salesValues),
          },
          // Cost of sales section
          {
            label: 'costOfSales',
            values: organiseTotals(costOfSalesValues),
          },
          {
            id: purchasesValues.map((entry) => entry.id),
            label: 'purchases',
            values: organiseTotals(purchasesValues.map((entry) => entry.purchase)),
          },
          {
            id: outsourcingExpenseValues.map((outsource) => outsource.id), // Extract ids from the entries
            label: 'outsourcingExpenses',
            values: organiseTotals(outsourcingExpenseValues.map((outsource) => outsource.outsourcing_expense)),
          },
          {
            id: productPurchaseValues.map((product) => product.id),
            label: 'productPurchases',
            values: organiseTotals(productPurchaseValues.map((product) => product.product_purchase)),
          },
          {
            id: dispatchLaborExpenseValues.map((dispatch) => dispatch.id),
            label: 'dispatchLaborExpenses',
            values: organiseTotals(dispatchLaborExpenseValues.map((dispatch) => dispatch.dispatch_labor_expense)),
          },
          {
            id: communicationCostValues.map((communication) => communication.id),
            label: 'communicationCost',
            values: organiseTotals(communicationCostValues.map((communication) => communication.communication_expense)),
          },
          {
            id: workInProgressValues.map((wip) => wip.id),
            label: 'workInProgressExpenses',
            values: organiseTotals(workInProgressValues.map((wip) => wip.work_in_progress_expense)),
          },
          {
            id: amortizationValues.map((amortization) => amortization.id),
            label: 'amortizationExpenses',
            values: organiseTotals(amortizationValues.map((amortization) => amortization.amortization_expense)),
          },
          // Gross profit
          {
            label: 'grossProfit',
            values: organiseTotals(grossProfitValues),
          },
          // Employee expense section
          {
            label: 'employeeExpenses',
            values: organiseTotals(employeeExpensesValues),
          },
          {
            id: employeeExpenseExecutiveRemunerationValues.map((remuneration) => remuneration.id),
            label: 'executiveRemuneration',
            values: organiseTotals(employeeExpenseExecutiveRemunerationValues),
          },
          {
            label: 'salary',
            values: organiseTotals(employeeExpenseSalaryValues),
          },
          {
            id: employeeExpenseBonusAndFuelAllowanceValues.map((fuel) => fuel.id),
            label: 'bonusAndFuelAllowance',
            values: organiseTotals(employeeExpenseBonusAndFuelAllowanceValues),
          },
          {
            id: employeeExpenseStatutoryWelfareExpenseValues.map((statutory) => statutory.id),
            label: 'statutoryWelfareExpenses',
            values: organiseTotals(employeeExpenseStatutoryWelfareExpenseValues),
          },
          {
            id: employeeExpenseWelfareExpenseValues.map((welfare) => welfare.id),
            label: 'welfareExpenses',
            values: organiseTotals(employeeExpenseWelfareExpenseValues),
          },
          {
            label: 'insurancePremiums',
            values: organiseTotals(employeeExpenseInsurancePremiumValues),
          },
          // Expenses section
          {
            label: 'expenses',
            values: organiseTotals(expenseValues),
          },
          {
            //same value to " 給与手当 " ?
            id: consumableValues.map((consumable) => consumable.id),
            label: 'consumableExpenses',
            values: organiseTotals(consumableValues.map((consumable) => consumable.consumable_expense)),
          },
          {
            id: rentValues.map((rent) => rent.id),
            label: 'rentExpenses',
            values: organiseTotals(rentValues.map((rent) => rent.rent_expense)),
          },
          {
            id: taxesPublicChargesValues.map((taxes) => taxes.id),
            label: 'taxesAndPublicCharges',
            values: organiseTotals(taxesPublicChargesValues.map((taxes) => taxes.tax_and_public_charge)),
          },
          {
            id: depreciationExpensesValues.map((depreciation) => depreciation.id),
            label: 'depreciationExpenses',
            values: organiseTotals(depreciationExpensesValues.map((depreciation) => depreciation.depreciation_expense)),
          },
          {
            id: travelExpenseValues.map((travel) => travel.id),
            label: 'travelExpenses',
            values: organiseTotals(travelExpenseValues.map((travel) => travel.travel_expense)),
          },
          {
            id: communicationExpenseValues.map((communicationExpense) => communicationExpense.id),
            label: 'communicationExpenses',
            values: organiseTotals(
              communicationExpenseValues.map((communicationExpense) => communicationExpense.communication_expense),
            ),
          },
          {
            id: utilitiesValues.map((utils) => utils.id),
            label: 'utilitiesExpenses',
            values: organiseTotals(utilitiesValues.map((utils) => utils.utilities_expense)),
          },
          {
            id: transactionFeeValues.map((transaction) => transaction.id),
            label: 'transactionFees',
            values: organiseTotals(transactionFeeValues.map((transaction) => transaction.transaction_fee)),
          },
          {
            id: advertisingExpenseValues.map((advertising) => advertising.id),
            label: 'advertisingExpenses',
            values: organiseTotals(advertisingExpenseValues.map((advertising) => advertising.advertising_expense)),
          },
          {
            id: entertainmentExpenseValues.map((entertainment) => entertainment.id),
            label: 'entertainmentExpenses',
            values: organiseTotals(
              entertainmentExpenseValues.map((entertainment) => entertainment.entertainment_expense),
            ),
          },
          {
            id: professionalServiceFeeValues.map((professional) => professional.id),
            label: 'professionalServicesFees',
            values: organiseTotals(
              professionalServiceFeeValues.map((professional) => professional.professional_service_fee),
            ),
          },
          // Selling and general admin expenses
          {
            //add 人件費 + 経費 field
            label: 'sellingAndGeneralAdminExpenses',
            values: organiseTotals(sellingAndGeneralAdminExpenseValues),
          },
          // Operating income section
          {
            label: 'operatingIncome',
            values: organiseTotals(operatingIncomeValues),
          },
          {
            label: 'nonOperatingIncome',
            values: organiseTotals(nonOperatingIncomeValues),
          },
          {
            label: 'nonOperatingExpenses',
            values: organiseTotals(nonOperatingExpensesValues),
          },
          {
            label: 'ordinaryIncome',
            values: organiseTotals(ordinaryProfitValues),
          },
          {
            label: 'cumulativeOrdinaryIncome',
            values: organiseTotals(cumulativeOrdinaryProfitValues),
          },
        ]

        setPreviousData(previousData)
        setData(data)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const noIndentLabels = [
    'salesRevenue',
    'costOfSales',
    'grossProfit',
    'employeeExpenses',
    'expenses',
    'sellingAndGeneralAdminExpensesShort', // 'Short' is for English label as it was too long for UI.
    'operatingIncome',
    'ordinaryIncome',
    'cumulativeOrdinaryIncome',
  ]

  const editableLabels = [
    'purchases',
    'outsourcingExpenses',
    'productPurchases',
    'dispatchLaborExpenses',
    'communicationExpenses',
    'workInProgressExpenses',
    'amortizationExpenses',
    'consumableExpenses',
    'rentExpenses',
    'taxesAndPublicCharges',
    'depreciationExpenses',
    'travelExpenses',
    'utilitiesExpenses',
    'transactionFees',
    'advertisingExpenses',
    'entertainmentExpenses',
    'professionalServicesFees',
  ]

  const halfYears = ['firstHalftotal', 'secondHalftotal', 'totalTable']
  const [editableData, setEditableData] = useState(data)
  const isRowEditable = (label) => editableLabels.includes(label)

  const handleInputChange = (rowIndex, valueIndex, e) => {
    const updatedData = [...data]

    if (!updatedData[rowIndex] || !updatedData[rowIndex].values) {
      return
    }

    const newValue = parseFloat(e.target.value) || 0
    if (updatedData[rowIndex].values[valueIndex] !== newValue) {
      updatedData[rowIndex].values[valueIndex] = newValue
      setEditableData(updatedData)
    }
  }

  const saveData = async (changedData) => {
    updateResults(changedData, token)
      .then(() => {
        alert('Sucessfully updated')
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login'
        } else {
          console.error('There was an error updating the results summary data!', error)
        }
      })
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const updatedData = editableData
      .map((row, rowIndex) => {
        const idArray = Array.isArray(row.id) ? row.id : []
        const valuesArray = Array.isArray(row.values) ? row.values : []

        const previousRow = previousData[rowIndex]
        const previousValuesArray = Array.isArray(previousRow?.values) ? previousRow.values : []

        // Filter the ids and values to include only updated ones
        const filteredIds = []
        const filteredValues = []

        valuesArray.forEach((value, index) => {
          if (value !== previousValuesArray[index] && value !== 0) {
            filteredIds.push(idArray[index])
            filteredValues.push(value)
          }
        })

        // Only return the row if there are valid ids and values
        if (filteredIds.length > 0 && filteredValues.length > 0) {
          return {
            id: filteredIds,
            label: row.label,
            values: filteredValues,
          }
        }

        return null
      })
      .filter((row) => row !== null)
    saveData(updatedData)
  }

  return (
    <div className='table-results_summary-container editScrollable'>
      <div className='table-results_summary'>
        <table>
          <thead>
            <tr>
              <th></th>
              {months.map((month, index) => (
                <th key={index} className={month >= 10 || month <= 3 ? 'light-txt' : 'orange-txt'}>
                  {month}月
                </th>
              ))}
              {halfYears.map((halfYear, index) => (
                <th key={index} className='sky-txt'>
                  {translate(`${halfYear}`, language)}
                </th>
              ))}
              <th className='total-txt'>{translate('salesRatio', language)}</th>
            </tr>
            <tr className='scnd-row'>
              <th className='borderless'></th>
              {months.map((month, index) => (
                <th key={index}>{translate('results', language)}</th>
              ))}
              {halfYears.map((_, index) => (
                <th key={index} className=''>
                  {translate('results', language)}
                </th>
              ))}
              <th>{''}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td className={noIndentLabels.includes(item.label) ? 'no-indent' : 'indented-label'}>
                  {translate(item.label, language)}
                </td>
                {item.values.map((value, valueIndex) => (
                  <td key={valueIndex}>
                    {/* if item.id === undefined then the record does not exist so Input should be editable */}
                    {isRowEditable(item.label) &&
                    valueIndex < 12 &&
                    (Array.isArray(item.id)
                      ? item.id[valueIndex] !== null && item.id[valueIndex] !== undefined // Check each id in the array
                      : item.id !== null && item.id !== undefined) ? ( // For single id
                      <input
                        className='input_tag'
                        type='text'
                        value={value}
                        onChange={(e) => handleInputChange(index, valueIndex, e)}
                      />
                    ) : (
                      value.toLocaleString()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className='div_submit'>
          <button className='edit_submit_btn' onClick={handleSubmit}>
            {translate('update', language)}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditTableResults
