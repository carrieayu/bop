import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { id } from '../../../jest.config'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { getPlanningA } from '../../api/PlanningEndpoint/GetPlanningA'
import { updatePlanning } from '../../api/PlanningEndpoint/UpdatePlanning'

const EditTablePlanning = () => {
  const [data, setData] = useState([])
  const [previousData, setPreviousData] = useState([])
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }

    getPlanningA(token)
      .then((response) => {
        const aggregatedData = response.cost_of_sales.reduce((acc, item) => {
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
        const aggregatedExpensesData = response.expenses.reduce((acc, item) => {
          
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

        const aggregateEmployeeData = (employees) => {
          // Initialize an empty object to store aggregated monthly data
          const aggregatedData = {}
          // Calculate the total annual salary, bonus, and welfare once for all employees
          let totalAnnualExecutive = 0
          let totalAnnualSalary = 0
          let totalBonusAndFuelAllowance = 0
          let totalWelfareExpense = 0
          let totalStatutoryWelfareExpense = 0
          let totalInsurancePremium = 0
          
          employees.forEach((employee) => {
            totalAnnualExecutive += Number(employee.executive_renumeration)
            totalAnnualSalary += Number(employee.salary)
            totalBonusAndFuelAllowance += Number(employee.bonus_and_fuel_allowance)
            totalWelfareExpense += Number(employee.welfare_expense) // Convert string to number if necessary
            totalStatutoryWelfareExpense += Number(employee.statutory_welfare_expense)
            totalInsurancePremium += Number(employee.insurance_premium)
          })

          // Distribute the totals equally across all months by dividing by 12
          const monthlyExecutive = totalAnnualExecutive / 12
          const monthlySalary = totalAnnualSalary / 12
          const yearlyBonusAndFuelAllowance = totalBonusAndFuelAllowance
          const monthlyWelfareExpense = (totalAnnualSalary * 0.0048) / 12
          const monthStatutoryWelfareExpense = (totalAnnualSalary * 0.0048) / 12
          const monthlyInsurancePremium = totalInsurancePremium / 12

          // Fill the aggregatedData for each month with the calculated monthly amounts
          months.forEach((month) => {
            aggregatedData[month] = {
              executive_renumeration: monthlyExecutive,
              salary: monthlySalary,
              bonus_and_fuel_allowance: yearlyBonusAndFuelAllowance,
              welfare_expense: monthlyWelfareExpense,
              statutory_welfare_expense: monthStatutoryWelfareExpense,
              insurance_premium: monthlyInsurancePremium,
            }
          })

          return aggregatedData
        }

        const aggregatedPlanningAssign = response.planning_assign_data.reduce((acc, item) => {
          const { month, employee, project, ...values } = item // Destructure employee and project

          // Initialize month if not already present
          if (!acc[month]) {
            acc[month] = {
              month,
              employees: [employee], // Store employees as an array
              projects: [project], // Store projects as an array
              totalSalary: employee.salary || 0, // Initialize totalSalary with the first employee's salary
              ...values,
            }
          } else {
            // Add the new employee and project objects to the array
            acc[month].employees.push(employee)
            acc[month].projects.push(project)

            // Add the employee's salary to the total
            acc[month].totalSalary += employee.salary || 0

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
        const aggregatedPlanningProjectData = response.planning_project_data.reduce((acc, item) => {
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

        const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]
        // SALES REVENUE
        const salesValues = months.map((month) => aggregatedPlanningProjectData[month]?.sales_revenue || 0)

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
              id: dataEntry.cost_of_sale_id,
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
              id: dataEntry.cost_of_sale_id,
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
              id: dataEntry.cost_of_sale_id,
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
              id: dataEntry.cost_of_sale_id,
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
              id: dataEntry.cost_of_sale_id,
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
              id: dataEntry.cost_of_sale_id,
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
              id: dataEntry.cost_of_sale_id,
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
        const employeeExpensesValues = months.map((month) => {
          const executiveRenumeration = Number(aggregatedExpensesData[month]?.executive_renumeration) || 0
          const salary = Number(aggregatedPlanningAssign[month]?.totalSalary) || 0
          const fuel_allowance = Number(aggregatedExpensesData[month]?.fuel_allowance) || 0
          const statutory_welfare_expense = Number(aggregatedExpensesData[month]?.statutory_welfare_expense) || 0
          const welfare_expense = Number(aggregatedExpensesData[month]?.welfare_expense) || 0
          const insurance_premiums = Number(aggregatedExpensesData[month]?.insurance_premiums) || 0

          return (
            executiveRenumeration +
            salary +
            fuel_allowance +
            statutory_welfare_expense +
            welfare_expense +
            insurance_premiums
          )
        })

        // EMPLOYEES
        const result = aggregateEmployeeData(response.employees)
        const executiveRenumerationValues = months.map((month) => result[month]?.executive_renumeration || 0)
        const salaryValues = months.map((month) => result[month]?.salary || 0)
        const totalBonusAndFuelAllowance = result[12]?.bonus_and_fuel_allowance || 0
        const bonusAndFuelAllowanceValues = months.map((month) => {
          return month === 12 ? totalBonusAndFuelAllowance : 0 // Only display total for December
        })
        const statutoryWelfareExpenseValues = months.map((month) => result[month]?.statutory_welfare_expense || 0)
        const welfareExpenseValues = months.map((month) => result[month]?.welfare_expense || 0)
        const insurancePremiumsValues = months.map((month) => result[month]?.insurance_premium || 0)

        // EXPENSES
        const expenseValues = months.map((month) => {
          const consumables = Number(aggregatedExpensesData[month]?.consumable_expense) || 0
          const rent = Number(aggregatedExpensesData[month]?.rent_expense) || 0
          const taxAndPublicCharge = Number(aggregatedExpensesData[month]?.tax_and_public_charge) || 0
          const depreciation = Number(aggregatedExpensesData[month]?.depreciation_expense) || 0
          const travel_expense = Number(aggregatedExpensesData[month]?.travel_expense) || 0
          const communication_expense = Number(aggregatedExpensesData[month]?.communication_expense) || 0
          const utilities_expense = Number(aggregatedExpensesData[month]?.utilities_expense) || 0
          const transaction_fee = Number(aggregatedExpensesData[month]?.transaction_fee) || 0
          const advertising_expense = Number(aggregatedExpensesData[month]?.advertising_expense) || 0
          const entertainment_expense = Number(aggregatedExpensesData[month]?.entertainment_expense) || 0
          const professional_service_fee = Number(aggregatedExpensesData[month]?.professional_service_fee) || 0
          return (
            consumables +
            rent +
            taxAndPublicCharge +
            depreciation +
            travel_expense +
            communication_expense +
            utilities_expense +
            transaction_fee +
            advertising_expense +
            entertainment_expense +
            professional_service_fee
          )
        })
        // const consumableValues = months.map((month) => aggregatedExpensesData[month]?.consumable_expense || 0)
        const consumableValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.expense_id,
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
              id: dataEntry.expense_id,
              rent_expense: dataEntry.rent_expense || 0,
            }
          }
          return { id: null, rent_expense: 0 }
        })
        const taxesPublicChargesValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.expense_id,
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
              id: dataEntry.expense_id,
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
              id: dataEntry.expense_id,
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
              id: dataEntry.expense_id,
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
              id: dataEntry.expense_id,
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
              id: dataEntry.expense_id,
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
              id: dataEntry.expense_id,
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
              id: dataEntry.expense_id,
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
              id: dataEntry.expense_id,
              professional_service_fee: dataEntry.professional_service_fee || 0,
            }
          }
          return { id: null, professional_service_fee: 0 }
        })

        // SELLING AND GENERAL ADMIN EXPENSES
        const sellingAndGeneralAdminExpenseValues = months.map((month, index) => {
          const total_employee_expense = employeeExpensesValues[index] // Get the total employee expense for the current month
          const total_expense = expenseValues[index] // Get the total expense for the current month
          const sellingAndGeneralAdminExpense = total_employee_expense + total_expense // Calculation for Selling and General Admin Expense
          return sellingAndGeneralAdminExpense
        })

        // OPERATING INCOME
        const operatingIncomeValues = months.map((month, index) => {
          const gross_profit = grossProfitValues[index] // Get the gross profit for the current month
          const selling_and_general_admin = sellingAndGeneralAdminExpenseValues[index] // Get the Selling and General Admin Expense for the current month
          const operating_income_value = gross_profit - selling_and_general_admin // Calculate operating income value
          return operating_income_value
        })
        //NoN Operating Income & Expense
        const nonOperatingIncomeValues = months.map(
          (month) => aggregatedPlanningProjectData[month]?.non_operating_income || 0,
        )
        const nonOperatingExpensesValues = months.map(
          (month) => aggregatedPlanningProjectData[month]?.non_operating_expense || 0,
        )

        const ordinaryProfitValues = months.map((month, index) => {
          const operating_income = operatingIncomeValues[index]
          const non_operating_income = nonOperatingIncomeValues[index]
          const totalOperating = operating_income + non_operating_income
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
            id: executiveRenumerationValues.map((renumeration) => renumeration.id),
            label: 'executiveRenumeration',
            values: [
              ...executiveRenumerationValues,
              firstHalfTotal(executiveRenumerationValues),
              secondHalfTotal(executiveRenumerationValues),
              total(executiveRenumerationValues),
              // `${(total(executiveRenumerationValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'salary',
            values: [
              ...salaryValues,
              firstHalfTotal(salaryValues),
              secondHalfTotal(salaryValues),
              total(salaryValues),
              // `${(total(salaryValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: bonusAndFuelAllowanceValues.map((fuel) => fuel.id),
            label: 'bonusAndFuelAllowance',
            values: [
              ...bonusAndFuelAllowanceValues,
              firstHalfTotal(bonusAndFuelAllowanceValues),
              secondHalfTotal(bonusAndFuelAllowanceValues),
              total(bonusAndFuelAllowanceValues),
              // `${(total(fuelAllowanceValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: statutoryWelfareExpenseValues.map((statutory) => statutory.id),
            label: 'statutoryWelfareExpenses',
            values: [
              ...statutoryWelfareExpenseValues,
              firstHalfTotal(statutoryWelfareExpenseValues),
              secondHalfTotal(statutoryWelfareExpenseValues),
              total(statutoryWelfareExpenseValues),
              // `${(total(statutoryWelfareExpenseValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: welfareExpenseValues.map((welfare) => welfare.id),
            label: 'welfareExpenses',
            values: [
              ...welfareExpenseValues,
              firstHalfTotal(welfareExpenseValues),
              secondHalfTotal(welfareExpenseValues),
              total(welfareExpenseValues),
              // `${(total(welfareExpenseValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'insurancePremiums',
            values: [
              ...insurancePremiumsValues,
              firstHalfTotal(insurancePremiumsValues),
              secondHalfTotal(insurancePremiumsValues),
              total(insurancePremiumsValues),
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
            id: executiveRenumerationValues.map((renumeration) => renumeration.id),
            label: 'executiveRenumeration',
            values: [
              ...executiveRenumerationValues,
              firstHalfTotal(executiveRenumerationValues),
              secondHalfTotal(executiveRenumerationValues),
              total(executiveRenumerationValues),
              // `${(total(executiveRenumerationValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'salary',
            values: [
              ...salaryValues,
              firstHalfTotal(salaryValues),
              secondHalfTotal(salaryValues),
              total(salaryValues),
              // `${(total(salaryValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: bonusAndFuelAllowanceValues.map((fuel) => fuel.id),
            label: 'bonusAndFuelAllowance',
            values: [
              ...bonusAndFuelAllowanceValues,
              firstHalfTotal(bonusAndFuelAllowanceValues),
              secondHalfTotal(bonusAndFuelAllowanceValues),
              total(bonusAndFuelAllowanceValues),
              // `${(total(fuelAllowanceValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: statutoryWelfareExpenseValues.map((statutory) => statutory.id),
            label: 'statutoryWelfareExpenses',
            values: [
              ...statutoryWelfareExpenseValues,
              firstHalfTotal(statutoryWelfareExpenseValues),
              secondHalfTotal(statutoryWelfareExpenseValues),
              total(statutoryWelfareExpenseValues),
              // `${(total(statutoryWelfareExpenseValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            id: welfareExpenseValues.map((welfare) => welfare.id),
            label: 'welfareExpenses',
            values: [
              ...welfareExpenseValues,
              firstHalfTotal(welfareExpenseValues),
              secondHalfTotal(welfareExpenseValues),
              total(welfareExpenseValues),
              // `${(total(welfareExpenseValues) / total(employeeExpensesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'insurancePremiums',
            values: [
              ...insurancePremiumsValues,
              firstHalfTotal(insurancePremiumsValues),
              secondHalfTotal(insurancePremiumsValues),
              total(insurancePremiumsValues),
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

  const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]
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
    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }

    updatePlanning(changedData, token)
      .then(() => {
        alert('Sucessfully updated')
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login'
        } else {
          console.error('There was an error updating the planning data!', error)
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
    <div className='table-planning-container'>
      <div className='table-planning editScrollable'>
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
                <th key={index}>{translate('planning', language)}</th>
              ))}
              {halfYears.map((_, index) => (
                <th key={index} className=''>
                  {translate('planning', language)}
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
                     {isRowEditable(item.label) && valueIndex < 12 && (
                      Array.isArray(item.id)
                        ? item.id[valueIndex] !== null && item.id[valueIndex] !== undefined // Check each id in the array
                        : item.id !== null && item.id !== undefined // For single id
                     ) ? (
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

export default EditTablePlanning
