import React, { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { token, months, monthNames } from '../../constants'
import { getPlanningAndResultsData } from '../../api/DashboardEndpoint/GetPlanningAndResultsTablesA'
import { organiseTotals } from '../../utils/helperFunctionsUtil'
import { translate } from '../../utils/translationUtil'
import {
  aggregatedCostOfSalesFunction,
  aggregatedExpensesFunction,
  aggregatedEmployeeExpensesFunction,
} from '../../utils/tableAggregationUtil'

interface TableDashboardProps {
  isThousandYenChecked: boolean
}

const TableDashboard: React.FC<TableDashboardProps> = ({ isThousandYenChecked }) => {
  const [planningData, setPlanningData] = useState([])
  const [resultsData, setResultsData] = useState([])
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en') // State for switch in translation

  useEffect(() => {
    if (!token) {
      window.location.href = '/login'
      return
    }

    getPlanningAndResultsData(token)
      .then((response) => {
        console.log('response',response)
        // planning
        const aggregatedCostOfSalesData = aggregatedCostOfSalesFunction(response.planning_data.cost_of_sales)
        // const aggregatedCostOfSalesData = response.planning_data.cost_of_sales.reduce((acc, item) => {
        //   const { month, ...values } = item
        //   if (!acc[month]) {
        //     acc[month] = { ...values }
        //   } else {
        //     Object.keys(values).forEach((key) => {
        //       acc[month][key] += values[key]
        //     })
        //   }
        //   return acc
        // }, {})

        const aggregatedExpensesData = aggregatedExpensesFunction(response.planning_data.expenses)
        // const aggregatedExpensesData = response.planning_data.expenses.reduce((acc, item) => {
        //   const { month, ...values } = item
        //   if (!acc[month]) {
        //     acc[month] = { month, ...values } // Include month in the object
        //   } else {
        //     Object.keys(values).forEach((key) => {
        //       acc[month][key] += values[key]
        //     })
        //   }
        //   return acc
        // }, {})

        // EMPLOYEE EXPENSES
        const aggregatedEmployeeExpensesData = aggregatedEmployeeExpensesFunction(
          response.planning_data.employee_expenses,
        )
        // const aggregatedEmployeeExpensesData = response.planning_data.employee_expenses.reduce((acc, item) => {
          // const { month, employee, project, ...values } = item // Destructure employee and project

          // Initialize month if not already present
        //   if (!acc[month]) {
        //     acc[month] = {
        //       month,
        //       employees: [employee], // Store employees as an array
        //       projects: [project], // Store projects as an array
        //       totalSalary: Number(employee.salary) || 0, // Initialize totalSalary with the first employee's salary
        //       totalExecutiveRemuneration: Number(employee.executive_remuneration) || 0,
        //       totalBonusAndFuel: Number(employee.bonus_and_fuel_allowance) || 0,
        //       totalStatutoryWelfare: Number(employee.statutory_welfare_expense) || 0,
        //       totalWelfare: Number(employee.welfare_expense) || 0,
        //       totalInsurancePremium: Number(employee.insurance_premium) || 0,
        //       ...values,
        //     }
        //   } else {
        //     // Add the new employee and project objects to the array
        //     acc[month].employees.push(employee)
        //     acc[month].projects.push(project)
        //     // Add the employee's salary to the total
        //     acc[month].totalSalary += Number(employee.salary) || 0
        //     acc[month].totalExecutiveRemuneration += Number(employee.executive_remuneration) || 0
        //     acc[month].totalBonusAndFuel += Number(employee.bonus_and_fuel_allowance) || 0
        //     acc[month].totalStatutoryWelfare += Number(employee.statutory_welfare_expense) || 0
        //     acc[month].totalWelfare += Number(employee.welfare_expense) || 0
        //     acc[month].totalInsurancePremium += Number(employee.insurance_premium) || 0

        //     // Aggregate other numeric fields
        //     Object.keys(values).forEach((key) => {
        //       if (typeof values[key] === 'number') {
        //         acc[month][key] += values[key]
        //       } else if (typeof values[key] === 'string') {
        //         // Handle strings like `created_at`, `updated_at`, and other concatenation-sensitive fields
        //         acc[month][key] = values[key] // Keep the latest value or handle as needed
        //       }
        //     })
        //   }
        //   return acc
        // }, {})

        // PROJECTS
        // NOTE: (planningProjectsData is OLD name)
        const aggregatedProjectsData = response.planning_data.projects.reduce((acc, item) => {
          const { month, ...values } = item
          if (!acc[month]) {
            acc[month] = { month }
          }
          Object.keys(values).forEach((key) => {
            // Convert value to a float
            const value = parseFloat(values[key])
            if (!isNaN(value)) {
              acc[month][key] = (acc[month][key] || 0) + value
            }
          })

          return acc
        }, {})

        // SALES REVENUE
        const salesValues = months.map((month) => aggregatedProjectsData[month]?.sales_revenue || 0)
        console.log('salesValues', salesValues, 'aggregatedProjectsData', aggregatedProjectsData)

        // COST OF SALES
        const costOfSalesValues = months.map((month) => {
          const purchases = Number(aggregatedCostOfSalesData[month]?.purchase) || 0
          const outsourcing = Number(aggregatedCostOfSalesData[month]?.outsourcing_expense) || 0
          const productPurchase = Number(aggregatedCostOfSalesData[month]?.product_purchase) || 0
          const dispatchLabor = Number(aggregatedCostOfSalesData[month]?.dispatch_labor_expense) || 0
          const communication = Number(aggregatedCostOfSalesData[month]?.communication_expense) || 0
          const workInProgress = Number(aggregatedCostOfSalesData[month]?.work_in_progress_expense) || 0
          const amortization = Number(aggregatedCostOfSalesData[month]?.amortization_expense) || 0
          return (
            purchases + outsourcing + productPurchase + dispatchLabor + communication + workInProgress + amortization
          )
        })
        const purchasesValues = months.map((month) => aggregatedCostOfSalesData[month]?.purchase || 0)
        const outsourcingExpenseValues = months.map((month) => aggregatedCostOfSalesData[month]?.outsourcing_expense || 0)
        const productPurchaseValues = months.map((month) => aggregatedCostOfSalesData[month]?.product_purchase || 0)
        const dispatchLaborExpenseValues = months.map((month) => aggregatedCostOfSalesData[month]?.dispatch_labor_expense || 0)
        const communicationCostValues = months.map((month) => aggregatedCostOfSalesData[month]?.communication_expense || 0)
        const workInProgressValues = months.map((month) => aggregatedCostOfSalesData[month]?.work_in_progress_expense || 0)
        const amortizationValues = months.map((month) => aggregatedCostOfSalesData[month]?.amortization_expense || 0)

        // GROSS PROFIT
        const grossProfitValues = months.map((month, index) => {
          const totalSales = salesValues[index] // Get the sales revenue for the current month
          const totalCostOfSales = costOfSalesValues[index] // Get the cost of sales for the current month
          const grossProfit = totalSales - totalCostOfSales // Calculate gross profit
          return grossProfit
        })

        // EMPLOYEE EXPENSE
        const employeeExpenseExecutiveRemunerationValues = months.map(
          (month) => aggregatedEmployeeExpensesData[month]?.totalExecutiveRemuneration || 0,
        )
        const employeeExpenseSalaryValues = months.map(
          (month) => aggregatedEmployeeExpensesData[month]?.totalSalary || 0,
        )
        const employeeExpenseBonusAndFuelAllowanceValues = months.map(
          (month) => aggregatedEmployeeExpensesData[month]?.totalBonusAndFuel || 0,
        )
        const employeeExpenseStatutoryWelfareExpenseValues = months.map(
          (month) => aggregatedEmployeeExpensesData[month]?.totalStatutoryWelfare || 0,
        )
        const employeeExpenseWelfareExpenseValues = months.map(
          (month) => aggregatedEmployeeExpensesData[month]?.totalWelfare || 0,
        )
        const employeeExpenseInsurancePremiumValues = months.map(
          (month) => aggregatedEmployeeExpensesData[month]?.totalInsurancePremium || 0,
        )

        // EMPLOYEE EXPENSE TOTALS
        const employeeExpensesValues = months.map((month) => {
          const executiveRemuneration = Number(aggregatedEmployeeExpensesData[month]?.totalExecutiveRemuneration) || 0
          const salary = Number(aggregatedEmployeeExpensesData[month]?.totalSalary) || 0
          const bonusAndFuelAllowance = Number(aggregatedEmployeeExpensesData[month]?.totalBonusAndFuel) || 0
          const statutoryWelfareExpense = Number(aggregatedEmployeeExpensesData[month]?.totalStatutoryWelfare) || 0
          const welfareExpense = Number(aggregatedEmployeeExpensesData[month]?.totalWelfare) || 0
          const insurancePremium = Number(aggregatedEmployeeExpensesData[month]?.totalInsurancePremium) || 0
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
        const consumableValues = months.map((month) => aggregatedExpensesData[month]?.consumable_expense || 0)
        const rentValues = months.map((month) => aggregatedExpensesData[month]?.rent_expense || 0)
        const taxesPublicChargesValues = months.map(
          (month) => aggregatedExpensesData[month]?.tax_and_public_charge || 0,
        )
        const depreciationExpensesValues = months.map(
          (month) => aggregatedExpensesData[month]?.depreciation_expense || 0,
        )
        const travelExpenseValues = months.map((month) => aggregatedExpensesData[month]?.travel_expense || 0)
        const communicationExpenseValues = months.map(
          (month) => aggregatedExpensesData[month]?.communication_expense || 0,
        )
        const utilitiesValues = months.map((month) => aggregatedExpensesData[month]?.utilities_expense || 0)
        const transactionFeeValues = months.map((month) => aggregatedExpensesData[month]?.transaction_fee || 0)
        const advertisingExpenseValues = months.map((month) => aggregatedExpensesData[month]?.advertising_expense || 0)
        const entertainmentExpenseValues = months.map(
          (month) => aggregatedExpensesData[month]?.entertainment_expense || 0,
        )
        const professionalServiceFeeValues = months.map(
          (month) => aggregatedExpensesData[month]?.professional_service_fee || 0,
        )

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
        const nonOperatingIncomeValues = months.map((month) => aggregatedProjectsData[month]?.non_operating_income || 0)
        const nonOperatingExpensesValues = months.map(
          (month) => aggregatedProjectsData[month]?.non_operating_expense || 0,
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

        const labelsAndValues = [
          // Sales revenue section
          { label: 'salesRevenue', values: salesValues },
          { label: 'sales', values: salesValues },

          // Cost of sales section
          { label: 'costOfSales', values: costOfSalesValues },
          { label: 'purchases', values: purchasesValues },
          { label: 'outsourcingExpenses', values: outsourcingExpenseValues },
          { label: 'productPurchases', values: productPurchaseValues },
          { label: 'dispatchLaborExpenses', values: dispatchLaborExpenseValues },
          { label: 'communicationExpenses', values: communicationCostValues },
          { label: 'workInProgressExpenses', values: workInProgressValues },
          { label: 'amortizationExpenses', values: amortizationValues },

          // Gross profit
          { label: 'grossProfit', values: grossProfitValues },

          // Employee expense section
          { label: 'employeeExpenses', values: employeeExpensesValues },
          { label: 'executiveRemuneration', values: employeeExpenseExecutiveRemunerationValues },
          { label: 'salary', values: employeeExpenseSalaryValues },
          { label: 'bonusAndFuelAllowance', values: employeeExpenseBonusAndFuelAllowanceValues },
          { label: 'statutoryWelfareExpenses', values: employeeExpenseStatutoryWelfareExpenseValues },
          { label: 'welfareExpenses', values: employeeExpenseWelfareExpenseValues },
          { label: 'insurancePremiums', values: employeeExpenseInsurancePremiumValues },

          // Expenses section
          { label: 'expenses', values: expenseValues },
          { label: 'consumableExpenses', values: consumableValues },
          { label: 'rentExpenses', values: rentValues },
          { label: 'taxesAndPublicCharges', values: taxesPublicChargesValues },
          { label: 'depreciationExpenses', values: depreciationExpensesValues },
          { label: 'travelExpenses', values: travelExpenseValues },
          { label: 'communicationExpenses', values: communicationExpenseValues },
          { label: 'utilitiesExpenses', values: utilitiesValues },
          { label: 'transactionFees', values: transactionFeeValues },
          { label: 'advertisingExpenses', values: advertisingExpenseValues },
          { label: 'entertainmentExpenses', values: entertainmentExpenseValues },
          { label: 'professionalServicesFees', values: professionalServiceFeeValues },

          // Selling and general admin expenses
          { label: 'sellingAndGeneralAdminExpensesShort', values: sellingAndGeneralAdminExpenseValues },

          // Operating income section
          { label: 'operatingIncome', values: operatingIncomeValues },
          { label: 'nonOperatingIncome', values: nonOperatingIncomeValues },
          { label: 'nonOperatingExpenses', values: nonOperatingExpensesValues },
          { label: 'ordinaryIncome', values: ordinaryProfitValues },
          { label: 'cumulativeOrdinaryIncome', values: cumulativeOrdinaryProfitValues },
        ]

        const data = labelsAndValues.map((item) => ({
          label: item.label,
          values: organiseTotals(item.values),
        }))
        setPlanningData(data)

          
        // results

        const aggregatedResultsCostOfSalesData = response.results_data.cost_of_sales.reduce((acc, item) => {
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
        const aggregatedResultsExpensesData = response.results_data.expenses.reduce((acc, item) => {
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

        // EMPLOYEE EXPENSES
        const aggregatedResultsEmployeeExpensesData = response.results_data.employee_expenses.reduce(
          (acc, item) => {
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
          },
          {},
        )
        
        console.log('aggregatedResultsEmployeeExpensesData', aggregatedResultsEmployeeExpensesData)
        // PROJECTS
        // NOTE: (planningProjectsData is OLD name)
        const aggregatedResultsProjectsData = response.results_data.projects.reduce((acc, item) => {
          const { month, ...values } = item
          if (!acc[month]) {
            acc[month] = { month }
          }
          Object.keys(values).forEach((key) => {
            // Convert value to a float
            const value = parseFloat(values[key])
            if (!isNaN(value)) {
              acc[month][key] = (acc[month][key] || 0) + value
            }
          })

          return acc
        }, {})

        // SALES REVENUE
        const salesResultsValues = months.map((month) => aggregatedResultsProjectsData[month]?.sales_revenue || 0)
        console.log(
          'salesResultsValues',
          salesResultsValues,
          'aggregatedResultsProjectsData',
          aggregatedResultsProjectsData,
        )

        // COST OF SALES
        const costOfSalesResultsValues = months.map((month) => {
          const purchases = Number(aggregatedResultsCostOfSalesData[month]?.purchase) || 0
          const outsourcing = Number(aggregatedResultsCostOfSalesData[month]?.outsourcing_expense) || 0
          const productPurchase = Number(aggregatedResultsCostOfSalesData[month]?.product_purchase) || 0
          const dispatchLabor = Number(aggregatedResultsCostOfSalesData[month]?.dispatch_labor_expense) || 0
          const communication = Number(aggregatedResultsCostOfSalesData[month]?.communication_expense) || 0
          const workInProgress = Number(aggregatedResultsCostOfSalesData[month]?.work_in_progress_expense) || 0
          const amortization = Number(aggregatedResultsCostOfSalesData[month]?.amortization_expense) || 0
          return (
            purchases +
            outsourcing +
            productPurchase +
            dispatchLabor +
            communication +
            workInProgress +
            amortization
          )
        })
        const purchasesResultsValues = months.map((month) => aggregatedResultsCostOfSalesData[month]?.purchase || 0)
        const outsourcingExpenseResultsValues = months.map(
          (month) => aggregatedResultsCostOfSalesData[month]?.outsourcing_expense || 0,
        )
        const productPurchaseResultsValues = months.map(
          (month) => aggregatedResultsCostOfSalesData[month]?.product_purchase || 0,
        )
        const dispatchLaborExpenseResultsValues = months.map(
          (month) => aggregatedResultsCostOfSalesData[month]?.dispatch_labor_expense || 0,
        )
        const communicationCostResultsValues = months.map(
          (month) => aggregatedResultsCostOfSalesData[month]?.communication_expense || 0,
        )
        const workInProgressResultsValues = months.map(
          (month) => aggregatedResultsCostOfSalesData[month]?.work_in_progress_expense || 0,
        )
        const amortizationResultsValues = months.map(
          (month) => aggregatedResultsCostOfSalesData[month]?.amortization_expense || 0,
        )

        // GROSS PROFIT
        const grossProfitResultsValues = months.map((month, index) => {
          const totalSales = salesValues[index] // Get the sales revenue for the current month
          const totalCostOfSales = costOfSalesValues[index] // Get the cost of sales for the current month
          const grossProfit = totalSales - totalCostOfSales // Calculate gross profit
          return grossProfit
        })

        // EMPLOYEE EXPENSE
        const employeeExpenseExecutiveRemunerationResultsValues = months.map(
          (month) => aggregatedResultsEmployeeExpensesData[month]?.totalExecutiveRemuneration || 0,
        )
        const employeeExpenseSalaryResultsValues = months.map(
          (month) => aggregatedResultsEmployeeExpensesData[month]?.totalSalary || 0,
        )
        const employeeExpenseBonusAndFuelAllowanceResultsValues = months.map(
          (month) => aggregatedResultsEmployeeExpensesData[month]?.totalBonusAndFuel || 0,
        )
        const employeeExpenseStatutoryWelfareExpenseResultsValues = months.map(
          (month) => aggregatedResultsEmployeeExpensesData[month]?.totalStatutoryWelfare || 0,
        )
        const employeeExpenseWelfareExpenseResultsValues = months.map(
          (month) => aggregatedResultsEmployeeExpensesData[month]?.totalWelfare || 0,
        )
        const employeeExpenseInsurancePremiumResultsValues = months.map(
          (month) => aggregatedResultsEmployeeExpensesData[month]?.totalInsurancePremium || 0,
        )

        // EMPLOYEE EXPENSE TOTALS
        const employeeExpensesResultsValues = months.map((month) => {
          const executiveRemuneration =
            Number(aggregatedResultsEmployeeExpensesData[month]?.totalExecutiveRemuneration) || 0
          const salary = Number(aggregatedResultsEmployeeExpensesData[month]?.totalSalary) || 0
          const bonusAndFuelAllowance =
            Number(aggregatedResultsEmployeeExpensesData[month]?.totalBonusAndFuel) || 0
          const statutoryWelfareExpense =
            Number(aggregatedResultsEmployeeExpensesData[month]?.totalStatutoryWelfare) || 0
          const welfareExpense = Number(aggregatedResultsEmployeeExpensesData[month]?.totalWelfare) || 0
          const insurancePremium =
            Number(aggregatedResultsEmployeeExpensesData[month]?.totalInsurancePremium) || 0
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
        const expenseResultsValues = months.map((month) => {
          const consumables = Number(aggregatedResultsExpensesData[month]?.consumable_expense) || 0
          const rent = Number(aggregatedResultsExpensesData[month]?.rent_expense) || 0
          const taxAndPublicCharge = Number(aggregatedResultsExpensesData[month]?.tax_and_public_charge) || 0
          const depreciation = Number(aggregatedResultsExpensesData[month]?.depreciation_expense) || 0
          const travelExpense = Number(aggregatedResultsExpensesData[month]?.travel_expense) || 0
          const communicationExpense = Number(aggregatedResultsExpensesData[month]?.communication_expense) || 0
          const utilitiesExpense = Number(aggregatedResultsExpensesData[month]?.utilities_expense) || 0
          const transactionFee = Number(aggregatedResultsExpensesData[month]?.transaction_fee) || 0
          const advertisingExpense = Number(aggregatedResultsExpensesData[month]?.advertising_expense) || 0
          const entertainmentExpense = Number(aggregatedResultsExpensesData[month]?.entertainment_expense) || 0
          const professionalServiceFee = Number(aggregatedResultsExpensesData[month]?.professional_service_fee) || 0
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
        const consumableResultsValues = months.map((month) => aggregatedExpensesData[month]?.consumable_expense || 0)
        const rentResultsValues = months.map((month) => aggregatedExpensesData[month]?.rent_expense || 0)
        const taxesPublicChargesResultsValues = months.map(
          (month) => aggregatedResultsExpensesData[month]?.tax_and_public_charge || 0,
        )
        const depreciationExpensesResultsValues = months.map(
          (month) => aggregatedResultsExpensesData[month]?.depreciation_expense || 0,
        )
        const travelExpenseResultsValues = months.map((month) => aggregatedExpensesData[month]?.travel_expense || 0)
        const communicationExpenseResultsValues = months.map(
          (month) => aggregatedExpensesData[month]?.communication_expense || 0,
        )
        const utilitiesResultsValues = months.map((month) => aggregatedExpensesData[month]?.utilities_expense || 0)
        const transactionFeeResultsValues = months.map(
          (month) => aggregatedResultsExpensesData[month]?.transaction_fee || 0,
        )
        const advertisingExpenseResultsValues = months.map(
          (month) => aggregatedResultsExpensesData[month]?.advertising_expense || 0,
        )
        const entertainmentExpenseResultsValues = months.map(
          (month) => aggregatedResultsExpensesData[month]?.entertainment_expense || 0,
        )
        const professionalServiceFeeResultsValues = months.map(
          (month) => aggregatedResultsExpensesData[month]?.professional_service_fee || 0,
        )

        // SELLING AND GENERAL ADMIN EXPENSES
        const sellingAndGeneralAdminExpenseResultsValues = months.map((month, index) => {
          const totalEmployeeExpense = employeeExpensesResultsValues[index] // Get the total employee expense for the current month
          const totalExpense = expenseResultsValues[index] // Get the total expense for the current month
          const sellingAndGeneralAdminExpense = totalEmployeeExpense + totalExpense // Calculation for Selling and General Admin Expense
          return sellingAndGeneralAdminExpense
        })

        // OPERATING INCOME
        const operatingIncomeResultsValues = months.map((month, index) => {
          const grossProfit = grossProfitResultsValues[index] // Get the gross profit for the current month
          const sellingAndGeneralAdmin = sellingAndGeneralAdminExpenseResultsValues[index] // Get the Selling and General Admin Expense for the current month
          const operatingIncomeValue = grossProfit - sellingAndGeneralAdmin // Calculate operating income value
          return operatingIncomeValue
        })
        //NoN Operating Income & Expense
        const nonOperatingIncomeResultsValues = months.map(
          (month) => aggregatedProjectsData[month]?.non_operating_income || 0,
        )
        const nonOperatingExpensesResultsValues = months.map(
          (month) => aggregatedProjectsData[month]?.non_operating_expense || 0,
        )

        const ordinaryProfitResultsValues = months.map((month, index) => {
          const operatingIncome = operatingIncomeResultsValues[index]
          const nonOperatingIncome = nonOperatingIncomeResultsValues[index]
          const totalOperating = operatingIncome + nonOperatingIncome
          const totalOrdinaryIncome = totalOperating - nonOperatingExpensesResultsValues[index]

          return totalOrdinaryIncome
        })

        const cumulativeSumResults = (arr) => {
          let sum = 0
          return arr.map((value) => (sum += value))
        }
        const cumulativeOrdinaryProfitResultsValues = cumulativeSum(ordinaryProfitValues)

        const labelsAndValuesResults = [
          // Sales revenue section
          { label: 'salesRevenue', values: salesResultsValues },
          { label: 'sales', values: salesResultsValues },

          // Cost of sales section
          { label: 'costOfSales', values: costOfSalesResultsValues },
          { label: 'purchases', values: purchasesResultsValues },
          { label: 'outsourcingExpenses', values: outsourcingExpenseResultsValues },
          { label: 'productPurchases', values: productPurchaseResultsValues },
          { label: 'dispatchLaborExpenses', values: dispatchLaborExpenseResultsValues },
          { label: 'communicationExpenses', values: communicationCostResultsValues },
          { label: 'workInProgressExpenses', values: workInProgressResultsValues },
          { label: 'amortizationExpenses', values: amortizationResultsValues },

          // Gross profit
          { label: 'grossProfit', values: grossProfitResultsValues },

          // Employee expense section
          { label: 'employeeExpenses', values: employeeExpensesResultsValues },
          { label: 'executiveRemuneration', values: employeeExpenseExecutiveRemunerationResultsValues },
          { label: 'salary', values: employeeExpenseSalaryResultsValues },
          { label: 'bonusAndFuelAllowance', values: employeeExpenseBonusAndFuelAllowanceResultsValues },
          { label: 'statutoryWelfareExpenses', values: employeeExpenseStatutoryWelfareExpenseResultsValues },
          { label: 'welfareExpenses', values: employeeExpenseWelfareExpenseResultsValues },
          { label: 'insurancePremiums', values: employeeExpenseInsurancePremiumResultsValues },

          // Expenses section
          { label: 'expenses', values: expenseResultsValues },
          { label: 'consumableExpenses', values: consumableResultsValues },
          { label: 'rentExpenses', values: rentResultsValues },
          { label: 'taxesAndPublicCharges', values: taxesPublicChargesResultsValues },
          { label: 'depreciationExpenses', values: depreciationExpensesResultsValues },
          { label: 'travelExpenses', values: travelExpenseResultsValues },
          { label: 'communicationExpenses', values: communicationExpenseResultsValues },
          { label: 'utilitiesExpenses', values: utilitiesResultsValues },
          { label: 'transactionFees', values: transactionFeeResultsValues },
          { label: 'advertisingExpenses', values: advertisingExpenseResultsValues },
          { label: 'entertainmentExpenses', values: entertainmentExpenseResultsValues },
          { label: 'professionalServicesFees', values: professionalServiceFeeResultsValues },

          // Selling and general admin expenses
          {
            label: 'sellingAndGeneralAdminExpensesShort',
            values: sellingAndGeneralAdminExpenseResultsValues,
          },

          // Operating income section
          { label: 'operatingIncome', values: operatingIncomeResultsValues },
          { label: 'nonOperatingIncome', values: nonOperatingIncomeResultsValues },
          { label: 'nonOperatingExpenses', values: nonOperatingExpensesResultsValues },
          { label: 'ordinaryIncome', values: ordinaryProfitResultsValues },
          { label: 'cumulativeOrdinaryIncome', values: cumulativeOrdinaryProfitResultsValues },
        ]

        const results = labelsAndValuesResults.map((item) => ({
          label: item.label,
          values: organiseTotals(item.values),
        }))
        setResultsData(results)

        const totalsalesResults = salesResultsValues.reduce((arr, item) => arr + item)
        const totalSalesValues = salesValues.reduce((arr, item) => arr + item)
        
        const salesRatio = ((totalsalesResults / totalSalesValues) * 100).toFixed(2)
        console.log(
          'totalsalesResults',
          totalsalesResults,
          'totalSalesValues',
          totalSalesValues,
          'salesRatio',
          salesRatio,
        )
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  useEffect(() => {
    console.log('planning data', planningData)
    console.log('results data', resultsData)
  }, [planningData, resultsData])

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
    setLanguage(newLanguage)
  }

  const noIndentLabels = [
    'salesRevenue',
    'costOfSales',
    'grossProfit',
    'employeeExpenses',
    'expenses',
    'sellingAndGeneralAdminExpensesShort', // Just a shorter version for English Language Mode
    'operatingIncome',
    'ordinaryIncome',
    'cumulativeOrdinaryIncome',
  ]

  const halfYears = ['firstHalftotal', 'secondHalftotal', 'totalTable']

  return (
    <div className='table-planning-container editScrollable'>
      <div className='table-planning'>
        <table>
          <thead>
            <tr className='table-header-sticky'>
              <th className=''>{''}</th>
              {months.map((month, index) => (
                <>
                  <th
                    key={`month-planning-${index}`}
                    className={month >= 10 || month <= 3 ? 'light-txt' : 'orange-txt'}
                    colSpan={2}
                    style={{ textAlign: 'center' }}
                  >
                    {language === 'en' ? monthNames[month].en : monthNames[month].jp}
                  </th>
                  {/* <th style={{backgroundColor:"yellow"}} key={`month-results-${index}`} className={month >= 10 || month <= 3 ? 'light-txt' : 'orange-txt'}>
                    {language === 'en' ? monthNames[month].en : monthNames[month].jp}
                  </th> */}
                </>
              ))}
              {halfYears.map((halfYear, index) => (
                <>
                  <th key={index} className='sky-txt' colSpan={2} style={{ textAlign: 'center' }}>
                    {translate(`${halfYear}`, language)}
                  </th>
                  {/* <th key={index} className='sky-txt'>
                    {translate(`${halfYear}`, language)}
                  </th> */}
                </>
              ))}
              <th className='total-txt'>{translate(language === 'en' ? 'salesRatioShort' : 'salesRatio', language)}</th>
            </tr>
            <tr className='scnd-row'>
              <th className='borderless'>{''}</th>
              {months.map((month, index) => (
                <>
                  <th key={`planning-${index}`} style={{ backgroundColor: '#FCFCCD' }}>
                    {translate('planning', language)}
                  </th>
                  <th key={`results-${index}`} style={{ backgroundColor: '#e3fdf0' }}>
                    {translate('results', language)}
                  </th>
                </>
              ))}
              {halfYears.map((_, index) => (
                <>
                  <th key={index} className=''>
                    {translate('planning', language)}
                  </th>
                  <th key={index} className=''>
                    {translate('results', language)}
                  </th>
                </>
              ))}
              <th>{''}</th>
            </tr>
          </thead>
          <tbody>
            {planningData.map((item, index) => (
              <tr key={index}>
                <td
                  className={`${noIndentLabels.includes(item.label) ? (language !== 'en' ? 'no-indent' : 'no-indent-english-mode') : language !== 'en' ? 'indented-label' : 'indented-label-english-mode'}`}
                >
                  {translate(item.label, language)}
                </td>
                {item.values.map((value, valueIndex) => (
                  <>
                    {/* Planning Column */}
                    <td style={{ backgroundColor: '#fefef0' }} className='month-data' key={`planning-${valueIndex}`}>
                      {isThousandYenChecked
                        ? (Math.round((value / 1000) * 10) / 10).toLocaleString() // Rounds to 1 decimal place
                        : value.toLocaleString()}
                    </td>

                    {/* Results Column - Use resultsData here */}
                    <td style={{ backgroundColor: '#f3fef9' }} className='month-data' key={`results-${valueIndex}`}>
                      {resultsData[index]?.values[valueIndex] !== undefined // Ensure resultsData exists
                        ? isThousandYenChecked
                          ? (Math.round((resultsData[index].values[valueIndex] / 1000) * 10) / 10).toLocaleString() // Rounds to 1 decimal place
                          : resultsData[index].values[valueIndex].toLocaleString()
                        : ''}
                    </td>
                  </>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableDashboard
