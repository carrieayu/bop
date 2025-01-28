import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { getPlanningA } from '../../api/PlanningEndpoint/GetPlanningA'
import { getResultsA } from '../../api/ResultsEndpoint/GetResultsA'
import { monthNames, months, token } from '../../constants'

interface TablePlanningAProps {
  isThousandYenChecked: boolean
}

const TableResultsA: React.FC<TablePlanningAProps> = ({ isThousandYenChecked }) => {
  const [data, setData] = useState([])
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en') // State for switch in translation
  useEffect(() => {
    
    if (!token) {
      window.location.href = '/login'
      return
    }
    // getPlanningA(token)
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

        const aggregateEmployeeResultsData = (employeesResults) => {
          // Initialize an empty object to store aggregated monthly data
          const aggregatedData = {}
          // Calculate the total annual salary, bonus, and welfare once for all employees
          let totalAnnualExecutive = 0
          let totalAnnualSalary = 0
          let totalBonusAndFuelAllowance = 0
          let totalWelfareExpense = 0
          let totalStatutoryWelfareExpense = 0
          let totalInsurancePremium = 0

          employeesResults.forEach((employee) => {
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

        const aggregatedEmployeeExpensesResults = response.employee_expenses_results.reduce((acc, item) => {
          const { month, employee, project, ...values } = item // Destructure employee and project

          // Initialize month if not already present
          if (!acc[month]) {
            acc[month] = {
              month,
              employees: [employee], // Store employees as an array
              projects: [project], // Store projects as an array
              totalSalary: Number(employee.salary) || 0, // Initialize totalSalary with the first employee's salary
              ...values,
            }
          } else {
            // Add the new employee and project objects to the array
            acc[month].employees.push(employee)
            acc[month].projects.push(project)

            // Add the employee's salary to the total
            acc[month].totalSalary += Number(employee.salary) || 0

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
        const purchasesValues = months.map((month) => aggregatedData[month]?.purchase || 0)
        const outsourcingExpenseValues = months.map((month) => aggregatedData[month]?.outsourcing_expense || 0)
        const productPurchaseValues = months.map((month) => aggregatedData[month]?.product_purchase || 0)
        const dispatchLaborExpenseValues = months.map((month) => aggregatedData[month]?.dispatch_labor_expense || 0)
        const communicationCostValues = months.map((month) => aggregatedData[month]?.communication_expense || 0)
        const workInProgressValues = months.map((month) => aggregatedData[month]?.work_in_progress_expense || 0)
        const amortizationValues = months.map((month) => aggregatedData[month]?.amortization_expense || 0)

        // GROSS PROFIT
        const grossProfitValues = months.map((month, index) => {
          const totalSales = salesValues[index] // Get the sales revenue for the current month
          const totalCostOfSales = costOfSalesValues[index] // Get the cost of sales for the current month
          const grossProfit = totalSales - totalCostOfSales // Calculate gross profit
          return grossProfit
        })

        // EMPLOYEE EXPENSE
        const employeeExpensesValues = months.map((month) => {
          const executiveRenumeration = aggregatedExpensesData[month]?.executive_renumeration || 0
          const salary = aggregatedEmployeeExpensesResults[month]?.totalSalary || 0
          const fuel_allowance = aggregatedExpensesData[month]?.fuel_allowance || 0
          const statutory_welfare_expense = aggregatedExpensesData[month]?.statutory_welfare_expense || 0
          const welfare_expense = aggregatedExpensesData[month]?.welfare_expense || 0
          const insurance_premiums = aggregatedExpensesData[month]?.insurance_premiums || 0

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
        const result = aggregateEmployeeResultsData(response.employees_results)
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
          (month) => aggregatedProjectSalesResultsData[month]?.non_operating_income || 0,
        )
        const nonOperatingExpensesValues = months.map(
          (month) => aggregatedProjectSalesResultsData[month]?.non_operating_expense || 0,
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
            label: 'purchases',
            values: [
              ...purchasesValues,
              firstHalfTotal(purchasesValues),
              secondHalfTotal(purchasesValues),
              total(purchasesValues),
              // `${(total(purchasesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'outsourcingExpenses',
            values: [
              ...outsourcingExpenseValues,
              firstHalfTotal(outsourcingExpenseValues),
              secondHalfTotal(outsourcingExpenseValues),
              total(outsourcingExpenseValues),
              // `${(total(outsourcingExpenseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'productPurchases',
            values: [
              ...productPurchaseValues,
              firstHalfTotal(productPurchaseValues),
              secondHalfTotal(productPurchaseValues),
              total(productPurchaseValues),
              // `${(total(productPurchaseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'dispatchLaborExpenses',
            values: [
              ...dispatchLaborExpenseValues,
              firstHalfTotal(dispatchLaborExpenseValues),
              secondHalfTotal(dispatchLaborExpenseValues),
              total(dispatchLaborExpenseValues),
              // `${(total(dispatchLaborExpenseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'communicationExpenses',
            values: [
              ...communicationCostValues,
              firstHalfTotal(communicationCostValues),
              secondHalfTotal(communicationCostValues),
              total(communicationCostValues),
              // `${(total(communicationCostValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'workInProgressExpenses',
            values: [
              ...workInProgressValues,
              firstHalfTotal(workInProgressValues),
              secondHalfTotal(workInProgressValues),
              total(workInProgressValues),
              // `${(total(workInProgressValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'amortizationExpenses',
            values: [
              ...amortizationValues,
              firstHalfTotal(amortizationValues),
              secondHalfTotal(amortizationValues),
              total(amortizationValues),
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
            label: 'consumableExpenses',
            values: [
              ...consumableValues,
              firstHalfTotal(consumableValues),
              secondHalfTotal(consumableValues),
              total(consumableValues),
              // `${(total(consumableValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'rentExpenses',
            values: [
              ...rentValues,
              firstHalfTotal(rentValues),
              secondHalfTotal(rentValues),
              total(rentValues),
              // `${(total(rentValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'taxesAndPublicCharges',
            values: [
              ...taxesPublicChargesValues,
              firstHalfTotal(taxesPublicChargesValues),
              secondHalfTotal(taxesPublicChargesValues),
              total(taxesPublicChargesValues),
              // `${(total(taxesPublicChargesValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'depreciationExpenses',
            values: [
              ...depreciationExpensesValues,
              firstHalfTotal(depreciationExpensesValues),
              secondHalfTotal(depreciationExpensesValues),
              total(depreciationExpensesValues),
              // `${(total(depreciationExpensesValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'travelExpenses',
            values: [
              ...travelExpenseValues,
              firstHalfTotal(travelExpenseValues),
              secondHalfTotal(travelExpenseValues),
              total(travelExpenseValues),
              // `${(total(travelExpenseValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'communicationExpenses',
            values: [
              ...communicationExpenseValues,
              firstHalfTotal(communicationExpenseValues),
              secondHalfTotal(communicationExpenseValues),
              total(communicationExpenseValues),
              // `${(total(communicationExpenseValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'utilitiesExpenses',
            values: [
              ...utilitiesValues,
              firstHalfTotal(utilitiesValues),
              secondHalfTotal(utilitiesValues),
              total(utilitiesValues),
              // `${(total(utilitiesValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'transactionFees',
            values: [
              ...transactionFeeValues,
              firstHalfTotal(transactionFeeValues),
              secondHalfTotal(transactionFeeValues),
              total(transactionFeeValues),
              // `${(total(transactionFeeValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'advertisingExpenses',
            values: [
              ...advertisingExpenseValues,
              firstHalfTotal(advertisingExpenseValues),
              secondHalfTotal(advertisingExpenseValues),
              total(advertisingExpenseValues),
              // `${(total(advertisingExpenseValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'entertainmentExpenses',
            values: [
              ...entertainmentExpenseValues,
              firstHalfTotal(entertainmentExpenseValues),
              secondHalfTotal(entertainmentExpenseValues),
              total(entertainmentExpenseValues),
              // `${(total(entertainmentExpenseValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          {
            label: 'professionalServicesFees',
            values: [
              ...professionalServiceFeeValues,
              firstHalfTotal(professionalServiceFeeValues),
              secondHalfTotal(professionalServiceFeeValues),
              total(professionalServiceFeeValues),
              // `${(total(professionalServiceFeeValues) / total(expenseValues) * 100).toFixed(2)}%`,
              '0',
            ],
          },
          // end for expense section
          {
            //add 人件費 + 経費 field
            label: 'sellingAndGeneralAdminExpensesShort', // shortened version as it is too long in English Mode
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
        setData(data)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

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
    <div className='table-results_summary-container editScrollable'>
      <div className='table-results_summary'>
        <table>
          <thead>
            <tr className='table-header-sticky'>
              <th className=''>{''}</th>
              {months.map((month, index) => (
                <th key={index} className={month >= 10 || month <= 3 ? 'light-txt' : 'orange-txt'}>
                  {language === 'en' ? monthNames[month].en : monthNames[month].jp}
                </th>
              ))}
              {halfYears.map((halfYear, index) => (
                <th key={index} className='sky-txt'>
                  {translate(`${halfYear}`, language)}
                </th>
              ))}
              <th className='total-txt'>{translate(language === 'en' ? 'salesRatioShort' : 'salesRatio', language)}</th>
            </tr>
            <tr className='scnd-row'>
              <th className='borderless'>{''}</th>
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
                <td
                  className={`${noIndentLabels.includes(item.label) ? (language !== 'en' ? 'no-indent' : 'no-indent-english-mode') : language !== 'en' ? 'indented-label' : 'indented-label-english-mode'}`}
                >
                  {translate(item.label, language)}
                </td>
                {item.values.map((value, valueIndex) => (
                  <td className='month-data' key={valueIndex}>
                    {isThousandYenChecked
                      ? (Math.round((value / 1000) * 10) / 10).toLocaleString() // Rounds to 1 decimal place
                      : value.toLocaleString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableResultsA
