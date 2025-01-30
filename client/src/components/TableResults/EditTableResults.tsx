import React, { useEffect, useState } from 'react'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { getResultsA } from '../../api/ResultsEndpoint/GetResultsA'
import { updateResults } from '../../api/ResultsEndpoint/UpdateResults'
import { months, token } from '../../constants'

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
              totalExecutiveRenumeration: Number(employee.executive_renumeration) || 0,
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
            acc[month].totalExecutiveRenumeration += Number(employee.executive_renumeration) || 0
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

        //COST OF SALES
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
        const employeeExpenseExecutiveRenumerationValues = months.map(
          (month) => aggregatedEmployeeExpensesResults[month]?.totalExecutiveRenumeration || 0,
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
          const executiveRenumeration =
            Number(aggregatedEmployeeExpensesResults[month]?.totalExecutiveRenumeration) || 0
          const salary = Number(aggregatedEmployeeExpensesResults[month]?.totalSalary) || 0
          const bonusAndFuelAllowance = Number(aggregatedEmployeeExpensesResults[month]?.totalBonusAndFuel) || 0
          const statutoryWelfareExpense = Number(aggregatedEmployeeExpensesResults[month]?.totalStatutoryWelfare) || 0
          const welfareExpense = Number(aggregatedEmployeeExpensesResults[month]?.totalWelfare) || 0
          const insurancePremium = Number(aggregatedEmployeeExpensesResults[month]?.totalInsurancePremium) || 0
          return (
            executiveRenumeration +
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
          //start for sales revenue section
          {
            label: 'salesRevenue',
            values: [
              ...salesValues,

              firstHalfTotal(salesValues),
              secondHalfTotal(salesValues),
              total(salesValues),
              // `${(total(salesValues) / total(salesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'sales',
            values: [
              ...salesValues,
              firstHalfTotal(salesValues),
              secondHalfTotal(salesValues),
              total(salesValues),
              // `${(total(salesValues) / total(salesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          //start of cost of sales portion
          {
            label: 'costOfSales',
            values: [
              ...costOfSalesValues,
              firstHalfTotal(costOfSalesValues),
              secondHalfTotal(costOfSalesValues),
              total(costOfSalesValues),
              // `${(total(costOfSalesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: purchasesValues.map((entry) => entry.id),
            label: 'purchases',
            values: [
              ...purchasesValues.map((entry) => entry.purchase), // Extract purchase values
              firstHalfTotal(purchasesValues.map((entry) => entry.purchase)), // First half total
              secondHalfTotal(purchasesValues.map((entry) => entry.purchase)), // Second half total
              total(purchasesValues.map((entry) => entry.purchase)), // Total purchases
              // `${(total(purchasesValues.map((entry) => entry.purchase)) / total(costOfSalesValues) * 100).toFixed(2)}%`, // Optional calculation
              '0', // Placeholder value or additional logic
            ],
          },
          {
            id: outsourcingExpenseValues.map((outsource) => outsource.id), // Extract ids from the entries
            label: 'outsourcingExpenses',
            values: [
              ...outsourcingExpenseValues.map((outsource) => outsource.outsourcing_expense), // Extract the `outsourcing_expense` values
              firstHalfTotal(outsourcingExpenseValues.map((outsource) => outsource.outsourcing_expense)), // First half total
              secondHalfTotal(outsourcingExpenseValues.map((outsource) => outsource.outsourcing_expense)), // Second half total
              total(outsourcingExpenseValues.map((outsource) => outsource.outsourcing_expense)), // Total outsourcing expense
              '0', // Placeholder value
            ],
          },
          {
            id: productPurchaseValues.map((product) => product.id),
            label: 'productPurchases',
            values: [
              ...productPurchaseValues.map((product) => product.product_purchase),
              firstHalfTotal(productPurchaseValues.map((product) => product.product_purchase)),
              secondHalfTotal(productPurchaseValues.map((product) => product.product_purchase)),
              total(productPurchaseValues.map((product) => product.product_purchase)),
              // `${(total(productPurchaseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: dispatchLaborExpenseValues.map((dispatch) => dispatch.id),
            label: 'dispatchLaborExpenses',
            values: [
              ...dispatchLaborExpenseValues.map((dispatch) => dispatch.dispatch_labor_expense),
              firstHalfTotal(dispatchLaborExpenseValues.map((dispatch) => dispatch.dispatch_labor_expense)),
              secondHalfTotal(dispatchLaborExpenseValues.map((dispatch) => dispatch.dispatch_labor_expense)),
              total(dispatchLaborExpenseValues.map((dispatch) => dispatch.dispatch_labor_expense)),
              // `${(total(dispatchLaborExpenseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: communicationCostValues.map((communication) => communication.id),
            label: 'communicationExpenses',
            values: [
              ...communicationCostValues.map((communication) => communication.communication_expense),
              firstHalfTotal(communicationCostValues.map((communication) => communication.communication_expense)),
              secondHalfTotal(communicationCostValues.map((communication) => communication.communication_expense)),
              total(communicationCostValues.map((communication) => communication.communication_expense)),
              // `${(total(communicationCostValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: workInProgressValues.map((wip) => wip.id),
            label: 'workInProgressExpenses',
            values: [
              ...workInProgressValues.map((wip) => wip.work_in_progress_expense),
              firstHalfTotal(workInProgressValues.map((wip) => wip.work_in_progress_expense)),
              secondHalfTotal(workInProgressValues.map((wip) => wip.work_in_progress_expense)),
              total(workInProgressValues.map((wip) => wip.work_in_progress_expense)),
              // `${(total(workInProgressValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: amortizationValues.map((amortization) => amortization.id),
            label: 'amortizationExpenses',
            values: [
              ...amortizationValues.map((amortization) => amortization.amortization_expense),
              firstHalfTotal(amortizationValues.map((amortization) => amortization.amortization_expense)),
              secondHalfTotal(amortizationValues.map((amortization) => amortization.amortization_expense)),
              total(amortizationValues.map((amortization) => amortization.amortization_expense)),
              // `${(total(amortizationValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          // end for cost of sales section
          {
            label: 'grossProfit',
            values: [
              ...grossProfitValues,
              firstHalfTotal(grossProfitValues),
              secondHalfTotal(grossProfitValues),
              total(grossProfitValues),
              '',
            ],
          },
          // start for employee expense section
          {
            label: 'employeeExpenses',
            values: [
              ...employeeExpensesValues,
              firstHalfTotal(employeeExpensesValues),
              secondHalfTotal(employeeExpensesValues),
              total(employeeExpensesValues),
              '0',
            ],
          },
          {
            id: employeeExpenseExecutiveRenumerationValues.map((renumeration) => renumeration.id),
            label: 'executiveRenumeration',
            values: [
              ...employeeExpenseExecutiveRenumerationValues,
              firstHalfTotal(employeeExpenseExecutiveRenumerationValues),
              secondHalfTotal(employeeExpenseExecutiveRenumerationValues),
              total(employeeExpenseExecutiveRenumerationValues),
              // `${(total(executiveRenumerationValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'salary',
            values: [
              ...employeeExpenseSalaryValues,
              firstHalfTotal(employeeExpenseSalaryValues),
              secondHalfTotal(employeeExpenseSalaryValues),
              total(employeeExpenseSalaryValues),
              // `${(total(salaryValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: employeeExpenseBonusAndFuelAllowanceValues.map((fuel) => fuel.id),
            label: 'bonusAndFuelAllowance',
            values: [
              ...employeeExpenseBonusAndFuelAllowanceValues,
              firstHalfTotal(employeeExpenseBonusAndFuelAllowanceValues),
              secondHalfTotal(employeeExpenseBonusAndFuelAllowanceValues),
              total(employeeExpenseBonusAndFuelAllowanceValues),
              // `${(total(fuelAllowanceValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: employeeExpenseStatutoryWelfareExpenseValues.map((statutory) => statutory.id),
            label: 'statutoryWelfareExpenses',
            values: [
              ...employeeExpenseStatutoryWelfareExpenseValues,
              firstHalfTotal(employeeExpenseStatutoryWelfareExpenseValues),
              secondHalfTotal(employeeExpenseStatutoryWelfareExpenseValues),
              total(employeeExpenseStatutoryWelfareExpenseValues),
              // `${(total(statutoryWelfareExpenseValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: employeeExpenseWelfareExpenseValues.map((welfare) => welfare.id),
            label: 'welfareExpenses',
            values: [
              ...employeeExpenseWelfareExpenseValues,
              firstHalfTotal(employeeExpenseWelfareExpenseValues),
              secondHalfTotal(employeeExpenseWelfareExpenseValues),
              total(employeeExpenseWelfareExpenseValues),
              // `${(total(welfareExpenseValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'insurancePremiums',
            values: [
              ...employeeExpenseInsurancePremiumValues,
              firstHalfTotal(employeeExpenseInsurancePremiumValues),
              secondHalfTotal(employeeExpenseInsurancePremiumValues),
              total(employeeExpenseInsurancePremiumValues),
              // `${(total(insurancePremiumsValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          //end for employee expense section
          //start for expenses section
          {
            label: 'expenses',
            values: [
              ...expenseValues,
              firstHalfTotal(expenseValues),
              secondHalfTotal(expenseValues),
              total(expenseValues),
              '0',
            ],
          },
          {
            //same value to " 給与手当 " ?
            id: consumableValues.map((consumable) => consumable.id),
            label: 'consumableExpenses',
            values: [
              ...consumableValues.map((consumable) => consumable.consumable_expense),
              firstHalfTotal(consumableValues.map((consumable) => consumable.consumable_expense)),
              secondHalfTotal(consumableValues.map((consumable) => consumable.consumable_expense)),
              total(consumableValues.map((consumable) => consumable.consumable_expense)),
              // `${(total(consumableValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: rentValues.map((rent) => rent.id),
            label: 'rentExpenses',
            values: [
              ...rentValues.map((rent) => rent.rent_expense),
              firstHalfTotal(rentValues.map((rent) => rent.rent_expense)),
              secondHalfTotal(rentValues.map((rent) => rent.rent_expense)),
              total(rentValues.map((rent) => rent.rent_expense)),
              // `${(total(rentValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: taxesPublicChargesValues.map((taxes) => taxes.id),
            label: 'taxesAndPublicCharges',
            values: [
              ...taxesPublicChargesValues.map((taxes) => taxes.tax_and_public_charge),
              firstHalfTotal(taxesPublicChargesValues.map((taxes) => taxes.tax_and_public_charge)),
              secondHalfTotal(taxesPublicChargesValues.map((taxes) => taxes.tax_and_public_charge)),
              total(taxesPublicChargesValues.map((taxes) => taxes.tax_and_public_charge)),
              // `${(total(taxesPublicChargesValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: depreciationExpensesValues.map((depreciation) => depreciation.id),
            label: 'depreciationExpenses',
            values: [
              ...depreciationExpensesValues.map((depreciation) => depreciation.depreciation_expense),
              firstHalfTotal(depreciationExpensesValues.map((depreciation) => depreciation.depreciation_expense)),
              secondHalfTotal(depreciationExpensesValues.map((depreciation) => depreciation.depreciation_expense)),
              total(depreciationExpensesValues.map((depreciation) => depreciation.depreciation_expense)),
              // `${(total(depreciationExpensesValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: travelExpenseValues.map((travel) => travel.id),
            label: 'travelExpenses',
            values: [
              ...travelExpenseValues.map((travel) => travel.travel_expense),
              firstHalfTotal(travelExpenseValues.map((travel) => travel.travel_expense)),
              secondHalfTotal(travelExpenseValues.map((travel) => travel.travel_expense)),
              total(travelExpenseValues.map((travel) => travel.travel_expense)),
              // `${(total(travelExpenseValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: communicationExpenseValues.map((communicationExpense) => communicationExpense.id),
            label: 'communicationExpenses',
            values: [
              ...communicationExpenseValues.map((communicationExpense) => communicationExpense.communication_expense),
              firstHalfTotal(
                communicationExpenseValues.map((communicationExpense) => communicationExpense.communication_expense),
              ),
              secondHalfTotal(
                communicationExpenseValues.map((communicationExpense) => communicationExpense.communication_expense),
              ),
              total(
                communicationExpenseValues.map((communicationExpense) => communicationExpense.communication_expense),
              ),
              // `${(total(communicationExpenseValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: utilitiesValues.map((utils) => utils.id),
            label: 'utilitiesExpenses',
            values: [
              ...utilitiesValues.map((utils) => utils.utilities_expense),
              firstHalfTotal(utilitiesValues.map((utils) => utils.utilities_expense)),
              secondHalfTotal(utilitiesValues.map((utils) => utils.utilities_expense)),
              total(utilitiesValues.map((utils) => utils.utilities_expense)),
              // `${(total(utilitiesValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: transactionFeeValues.map((transaction) => transaction.id),
            label: 'transactionFees',
            values: [
              ...transactionFeeValues.map((transaction) => transaction.transaction_fee),
              firstHalfTotal(transactionFeeValues.map((transaction) => transaction.transaction_fee)),
              secondHalfTotal(transactionFeeValues.map((transaction) => transaction.transaction_fee)),
              total(transactionFeeValues.map((transaction) => transaction.transaction_fee)),
              // `${(total(transactionFeeValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: advertisingExpenseValues.map((advertising) => advertising.id),
            label: 'advertisingExpenses',
            values: [
              ...advertisingExpenseValues.map((advertising) => advertising.advertising_expense),
              firstHalfTotal(advertisingExpenseValues.map((advertising) => advertising.advertising_expense)),
              secondHalfTotal(advertisingExpenseValues.map((advertising) => advertising.advertising_expense)),
              total(advertisingExpenseValues.map((advertising) => advertising.advertising_expense)),
              // `${(total(advertisingExpenseValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: entertainmentExpenseValues.map((entertainment) => entertainment.id),
            label: 'entertainmentExpenses',
            values: [
              ...entertainmentExpenseValues.map((entertainment) => entertainment.entertainment_expense),
              firstHalfTotal(entertainmentExpenseValues.map((entertainment) => entertainment.entertainment_expense)),
              secondHalfTotal(entertainmentExpenseValues.map((entertainment) => entertainment.entertainment_expense)),
              total(entertainmentExpenseValues.map((entertainment) => entertainment.entertainment_expense)),
              // `${(total(entertainmentExpenseValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: professionalServiceFeeValues.map((professional) => professional.id),
            label: 'professionalServicesFees',
            values: [
              ...professionalServiceFeeValues.map((professional) => professional.professional_service_fee),
              firstHalfTotal(professionalServiceFeeValues.map((professional) => professional.professional_service_fee)),
              secondHalfTotal(
                professionalServiceFeeValues.map((professional) => professional.professional_service_fee),
              ),
              total(professionalServiceFeeValues.map((professional) => professional.professional_service_fee)),
              // `${(total(professionalServiceFeeValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          // end for expense section
          {
            //add 人件費 + 経費 field
            label: 'sellingAndGeneralAdminExpensesShort',
            values: [
              ...sellingAndGeneralAdminExpenseValues,
              firstHalfTotal(sellingAndGeneralAdminExpenseValues),
              secondHalfTotal(sellingAndGeneralAdminExpenseValues),
              total(sellingAndGeneralAdminExpenseValues),
              '0',
            ],
          },
          //Operating income 営業利益 ①
          {
            label: 'operatingIncome',
            values: [
              ...operatingIncomeValues,
              firstHalfTotal(operatingIncomeValues),
              secondHalfTotal(operatingIncomeValues),
              total(operatingIncomeValues),
              '0',
            ],
          },
          {
            label: 'nonOperatingIncome',
            values: [
              ...nonOperatingIncomeValues,
              firstHalfTotal(nonOperatingIncomeValues),
              secondHalfTotal(nonOperatingIncomeValues),
              total(nonOperatingIncomeValues),
              '0',
            ],
          },
          {
            label: 'nonOperatingExpenses',
            values: [
              ...nonOperatingExpensesValues,
              firstHalfTotal(nonOperatingExpensesValues),
              secondHalfTotal(nonOperatingExpensesValues),
              total(nonOperatingExpensesValues),
              '0',
            ],
          },
          {
            label: 'ordinaryIncome',
            values: [
              ...ordinaryProfitValues,
              firstHalfTotal(ordinaryProfitValues),
              secondHalfTotal(ordinaryProfitValues),
              total(ordinaryProfitValues),
              '0',
            ],
          },
          {
            label: 'cumulativeOrdinaryIncome',
            values: [
              ...cumulativeOrdinaryProfitValues,
              firstHalfTotal(cumulativeOrdinaryProfitValues),
              secondHalfTotal(cumulativeOrdinaryProfitValues),
              total(cumulativeOrdinaryProfitValues),
              '0',
            ],
          },
        ]

        const previousData = [
          //start for sales revenue section
          {
            label: 'salesRevenue',
            values: [
              ...salesValues,

              firstHalfTotal(salesValues),
              secondHalfTotal(salesValues),
              total(salesValues),
              // `${(total(salesValues) / total(salesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'sales',
            values: [
              ...salesValues,
              firstHalfTotal(salesValues),
              secondHalfTotal(salesValues),
              total(salesValues),
              // `${(total(salesValues) / total(salesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          //start of cost of sales portion
          {
            label: 'costOfSales',
            values: [
              ...costOfSalesValues,
              firstHalfTotal(costOfSalesValues),
              secondHalfTotal(costOfSalesValues),
              total(costOfSalesValues),
              // `${(total(costOfSalesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: purchasesValues.map((entry) => entry.id),
            label: 'purchases',
            values: [
              ...purchasesValues.map((entry) => entry.purchase), // Extract purchase values
              firstHalfTotal(purchasesValues.map((entry) => entry.purchase)), // First half total
              secondHalfTotal(purchasesValues.map((entry) => entry.purchase)), // Second half total
              total(purchasesValues.map((entry) => entry.purchase)), // Total purchases
              // `${(total(purchasesValues.map((entry) => entry.purchase)) / total(costOfSalesValues) * 100).toFixed(2)}%`, // Optional calculation
              '0', // Placeholder value or additional logic
            ],
          },
          {
            id: outsourcingExpenseValues.map((outsource) => outsource.id), // Extract ids from the entries
            label: 'outsourcingExpenses',
            values: [
              ...outsourcingExpenseValues.map((outsource) => outsource.outsourcing_expense), // Extract the `outsourcing_expense` values
              firstHalfTotal(outsourcingExpenseValues.map((outsource) => outsource.outsourcing_expense)), // First half total
              secondHalfTotal(outsourcingExpenseValues.map((outsource) => outsource.outsourcing_expense)), // Second half total
              total(outsourcingExpenseValues.map((outsource) => outsource.outsourcing_expense)), // Total outsourcing expense
              '0', // Placeholder value
            ],
          },
          {
            id: productPurchaseValues.map((product) => product.id),
            label: 'productPurchases',
            values: [
              ...productPurchaseValues.map((product) => product.product_purchase),
              firstHalfTotal(productPurchaseValues.map((product) => product.product_purchase)),
              secondHalfTotal(productPurchaseValues.map((product) => product.product_purchase)),
              total(productPurchaseValues.map((product) => product.product_purchase)),
              // `${(total(productPurchaseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: dispatchLaborExpenseValues.map((dispatch) => dispatch.id),
            label: 'dispatchLaborExpenses',
            values: [
              ...dispatchLaborExpenseValues.map((dispatch) => dispatch.dispatch_labor_expense),
              firstHalfTotal(dispatchLaborExpenseValues.map((dispatch) => dispatch.dispatch_labor_expense)),
              secondHalfTotal(dispatchLaborExpenseValues.map((dispatch) => dispatch.dispatch_labor_expense)),
              total(dispatchLaborExpenseValues.map((dispatch) => dispatch.dispatch_labor_expense)),
              // `${(total(dispatchLaborExpenseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: communicationCostValues.map((communication) => communication.id),
            label: 'communicationCost',
            values: [
              ...communicationCostValues.map((communication) => communication.communication_expense),
              firstHalfTotal(communicationCostValues.map((communication) => communication.communication_expense)),
              secondHalfTotal(communicationCostValues.map((communication) => communication.communication_expense)),
              total(communicationCostValues.map((communication) => communication.communication_expense)),
              // `${(total(communicationCostValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: workInProgressValues.map((wip) => wip.id),
            label: 'workInProgressExpenses',
            values: [
              ...workInProgressValues.map((wip) => wip.work_in_progress_expense),
              firstHalfTotal(workInProgressValues.map((wip) => wip.work_in_progress_expense)),
              secondHalfTotal(workInProgressValues.map((wip) => wip.work_in_progress_expense)),
              total(workInProgressValues.map((wip) => wip.work_in_progress_expense)),
              // `${(total(workInProgressValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: amortizationValues.map((amortization) => amortization.id),
            label: 'amortizationExpenses',
            values: [
              ...amortizationValues.map((amortization) => amortization.amortization_expense),
              firstHalfTotal(amortizationValues.map((amortization) => amortization.amortization_expense)),
              secondHalfTotal(amortizationValues.map((amortization) => amortization.amortization_expense)),
              total(amortizationValues.map((amortization) => amortization.amortization_expense)),
              // `${(total(amortizationValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          // end for cost of sales section
          {
            label: 'grossProfit',
            values: [
              ...grossProfitValues,
              firstHalfTotal(grossProfitValues),
              secondHalfTotal(grossProfitValues),
              total(grossProfitValues),
              '',
            ],
          },
          // start for employee expense section
          {
            label: 'employeeExpenses',
            values: [
              ...employeeExpensesValues,
              firstHalfTotal(employeeExpensesValues),
              secondHalfTotal(employeeExpensesValues),
              total(employeeExpensesValues),
              '0',
            ],
          },
          {
            id: employeeExpenseExecutiveRenumerationValues.map((renumeration) => renumeration.id),
            label: 'executiveRenumeration',
            values: [
              ...employeeExpenseExecutiveRenumerationValues,
              firstHalfTotal(employeeExpenseExecutiveRenumerationValues),
              secondHalfTotal(employeeExpenseExecutiveRenumerationValues),
              total(employeeExpenseExecutiveRenumerationValues),
              // `${(total(executiveRenumerationValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'salary',
            values: [
              ...employeeExpenseSalaryValues,
              firstHalfTotal(employeeExpenseSalaryValues),
              secondHalfTotal(employeeExpenseSalaryValues),
              total(employeeExpenseSalaryValues),
              // `${(total(salaryValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: employeeExpenseBonusAndFuelAllowanceValues.map((fuel) => fuel.id),
            label: 'bonusAndFuelAllowance',
            values: [
              ...employeeExpenseBonusAndFuelAllowanceValues,
              firstHalfTotal(employeeExpenseBonusAndFuelAllowanceValues),
              secondHalfTotal(employeeExpenseBonusAndFuelAllowanceValues),
              total(employeeExpenseBonusAndFuelAllowanceValues),
              // `${(total(fuelAllowanceValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: employeeExpenseStatutoryWelfareExpenseValues.map((statutory) => statutory.id),
            label: 'statutoryWelfareExpenses',
            values: [
              ...employeeExpenseStatutoryWelfareExpenseValues,
              firstHalfTotal(employeeExpenseStatutoryWelfareExpenseValues),
              secondHalfTotal(employeeExpenseStatutoryWelfareExpenseValues),
              total(employeeExpenseStatutoryWelfareExpenseValues),
              // `${(total(statutoryWelfareExpenseValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: employeeExpenseWelfareExpenseValues.map((welfare) => welfare.id),
            label: 'welfareExpenses',
            values: [
              ...employeeExpenseWelfareExpenseValues,
              firstHalfTotal(employeeExpenseWelfareExpenseValues),
              secondHalfTotal(employeeExpenseWelfareExpenseValues),
              total(employeeExpenseWelfareExpenseValues),
              // `${(total(welfareExpenseValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'insurancePremiums',
            values: [
              ...employeeExpenseInsurancePremiumValues,
              firstHalfTotal(employeeExpenseInsurancePremiumValues),
              secondHalfTotal(employeeExpenseInsurancePremiumValues),
              total(employeeExpenseInsurancePremiumValues),
              // `${(total(insurancePremiumsValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          //end for employee expense section
          //start for expenses section
          {
            label: 'expenses',
            values: [
              ...expenseValues,
              firstHalfTotal(expenseValues),
              secondHalfTotal(expenseValues),
              total(expenseValues),
              '0',
            ],
          },
          {
            //same value to " 給与手当 " ?
            id: consumableValues.map((consumable) => consumable.id),
            label: 'consumableExpenses',
            values: [
              ...consumableValues.map((consumable) => consumable.consumable_expense),
              firstHalfTotal(consumableValues.map((consumable) => consumable.consumable_expense)),
              secondHalfTotal(consumableValues.map((consumable) => consumable.consumable_expense)),
              total(consumableValues.map((consumable) => consumable.consumable_expense)),
              // `${(total(consumableValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: rentValues.map((rent) => rent.id),
            label: 'rentExpenses',
            values: [
              ...rentValues.map((rent) => rent.rent_expense),
              firstHalfTotal(rentValues.map((rent) => rent.rent_expense)),
              secondHalfTotal(rentValues.map((rent) => rent.rent_expense)),
              total(rentValues.map((rent) => rent.rent_expense)),
              // `${(total(rentValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: taxesPublicChargesValues.map((taxes) => taxes.id),
            label: 'taxesAndPublicCharges',
            values: [
              ...taxesPublicChargesValues.map((taxes) => taxes.tax_and_public_charge),
              firstHalfTotal(taxesPublicChargesValues.map((taxes) => taxes.tax_and_public_charge)),
              secondHalfTotal(taxesPublicChargesValues.map((taxes) => taxes.tax_and_public_charge)),
              total(taxesPublicChargesValues.map((taxes) => taxes.tax_and_public_charge)),
              // `${(total(taxesPublicChargesValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: depreciationExpensesValues.map((depreciation) => depreciation.id),
            label: 'depreciationExpenses',
            values: [
              ...depreciationExpensesValues.map((depreciation) => depreciation.depreciation_expense),
              firstHalfTotal(depreciationExpensesValues.map((depreciation) => depreciation.depreciation_expense)),
              secondHalfTotal(depreciationExpensesValues.map((depreciation) => depreciation.depreciation_expense)),
              total(depreciationExpensesValues.map((depreciation) => depreciation.depreciation_expense)),
              // `${(total(depreciationExpensesValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: travelExpenseValues.map((travel) => travel.id),
            label: 'travelExpenses',
            values: [
              ...travelExpenseValues.map((travel) => travel.travel_expense),
              firstHalfTotal(travelExpenseValues.map((travel) => travel.travel_expense)),
              secondHalfTotal(travelExpenseValues.map((travel) => travel.travel_expense)),
              total(travelExpenseValues.map((travel) => travel.travel_expense)),
              // `${(total(travelExpenseValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: communicationExpenseValues.map((communicationExpense) => communicationExpense.id),
            label: 'communicationExpenses',
            values: [
              ...communicationExpenseValues.map((communicationExpense) => communicationExpense.communication_expense),
              firstHalfTotal(
                communicationExpenseValues.map((communicationExpense) => communicationExpense.communication_expense),
              ),
              secondHalfTotal(
                communicationExpenseValues.map((communicationExpense) => communicationExpense.communication_expense),
              ),
              total(
                communicationExpenseValues.map((communicationExpense) => communicationExpense.communication_expense),
              ),
              // `${(total(communicationExpenseValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: utilitiesValues.map((utils) => utils.id),
            label: 'utilitiesExpenses',
            values: [
              ...utilitiesValues.map((utils) => utils.utilities_expense),
              firstHalfTotal(utilitiesValues.map((utils) => utils.utilities_expense)),
              secondHalfTotal(utilitiesValues.map((utils) => utils.utilities_expense)),
              total(utilitiesValues.map((utils) => utils.utilities_expense)),
              // `${(total(utilitiesValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: transactionFeeValues.map((transaction) => transaction.id),
            label: 'transactionFees',
            values: [
              ...transactionFeeValues.map((transaction) => transaction.transaction_fee),
              firstHalfTotal(transactionFeeValues.map((transaction) => transaction.transaction_fee)),
              secondHalfTotal(transactionFeeValues.map((transaction) => transaction.transaction_fee)),
              total(transactionFeeValues.map((transaction) => transaction.transaction_fee)),
              // `${(total(transactionFeeValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: advertisingExpenseValues.map((advertising) => advertising.id),
            label: 'advertisingExpenses',
            values: [
              ...advertisingExpenseValues.map((advertising) => advertising.advertising_expense),
              firstHalfTotal(advertisingExpenseValues.map((advertising) => advertising.advertising_expense)),
              secondHalfTotal(advertisingExpenseValues.map((advertising) => advertising.advertising_expense)),
              total(advertisingExpenseValues.map((advertising) => advertising.advertising_expense)),
              // `${(total(advertisingExpenseValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: entertainmentExpenseValues.map((entertainment) => entertainment.id),
            label: 'entertainmentExpenses',
            values: [
              ...entertainmentExpenseValues.map((entertainment) => entertainment.entertainment_expense),
              firstHalfTotal(entertainmentExpenseValues.map((entertainment) => entertainment.entertainment_expense)),
              secondHalfTotal(entertainmentExpenseValues.map((entertainment) => entertainment.entertainment_expense)),
              total(entertainmentExpenseValues.map((entertainment) => entertainment.entertainment_expense)),
              // `${(total(entertainmentExpenseValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: professionalServiceFeeValues.map((professional) => professional.id),
            label: 'professionalServicesFees',
            values: [
              ...professionalServiceFeeValues.map((professional) => professional.professional_service_fee),
              firstHalfTotal(professionalServiceFeeValues.map((professional) => professional.professional_service_fee)),
              secondHalfTotal(
                professionalServiceFeeValues.map((professional) => professional.professional_service_fee),
              ),
              total(professionalServiceFeeValues.map((professional) => professional.professional_service_fee)),
              // `${(total(professionalServiceFeeValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          // end for expense section
          {
            //add 人件費 + 経費 field
            label: 'sellingAndGeneralAdminExpenses',
            values: [
              ...sellingAndGeneralAdminExpenseValues,
              firstHalfTotal(sellingAndGeneralAdminExpenseValues),
              secondHalfTotal(sellingAndGeneralAdminExpenseValues),
              total(sellingAndGeneralAdminExpenseValues),
              '0',
            ],
          },
          //Operating income 営業利益 ①
          {
            label: 'operatingIncome',
            values: [
              ...operatingIncomeValues,
              firstHalfTotal(operatingIncomeValues),
              secondHalfTotal(operatingIncomeValues),
              total(operatingIncomeValues),
              '0',
            ],
          },
          {
            label: 'nonOperatingIncome',
            values: [
              ...nonOperatingIncomeValues,
              firstHalfTotal(nonOperatingIncomeValues),
              secondHalfTotal(nonOperatingIncomeValues),
              total(nonOperatingIncomeValues),
              '0',
            ],
          },
          {
            label: 'nonOperatingExpenses',
            values: [
              ...nonOperatingExpensesValues,
              firstHalfTotal(nonOperatingExpensesValues),
              secondHalfTotal(nonOperatingExpensesValues),
              total(nonOperatingExpensesValues),
              '0',
            ],
          },
          {
            label: 'ordinaryIncome',
            values: [
              ...ordinaryProfitValues,
              firstHalfTotal(ordinaryProfitValues),
              secondHalfTotal(ordinaryProfitValues),
              total(ordinaryProfitValues),
              '0',
            ],
          },
          {
            label: 'cumulativeOrdinaryIncome',
            values: [
              ...cumulativeOrdinaryProfitValues,
              firstHalfTotal(cumulativeOrdinaryProfitValues),
              secondHalfTotal(cumulativeOrdinaryProfitValues),
              total(cumulativeOrdinaryProfitValues),
              '0',
            ],
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
