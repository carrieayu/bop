import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translate } from '../../utils/translationUtil';
import { getPlanningA } from '../../api/PlanningEndpoint/GetPlanningA';
import { monthNames, months, token } from '../../constants';
import { organiseTotals } from '../../utils/helperFunctionsUtil'


interface TablePlanningAProps {
  isThousandYenChecked: boolean;
}

const TablePlanning: React.FC<TablePlanningAProps> = ({isThousandYenChecked}) => {
  const [data, setData] = useState([]);
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); // State for switch in translation

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    getPlanningA(token)
      .then(response => {
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

        // EMPLOYEE EXPENSES (planningAssign is OLD name)
        const aggregatedPlanningAssign = response.planning_assign_data.reduce((acc, item) => {
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

        // PROJECTS   
        // NOTE: (planningProjectsData is OLD name)
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

        // SALES REVENUE
        const salesValues = months.map((month) => aggregatedPlanningProjectData[month]?.sales_revenue || 0)

        // COST OF SALES
        const costOfSalesValues = months.map((month) => {
          const purchases = Number(aggregatedData[month]?.purchase) || 0
          const outsourcing = Number(aggregatedData[month]?.outsourcing_expense) || 0
          const productPurchase = Number(aggregatedData[month]?.product_purchase) || 0
          const dispatchLabor = Number(aggregatedData[month]?.dispatch_labor_expense) || 0
          const communication = Number(aggregatedData[month]?.communication_expense) || 0
          const workInProgress = Number(aggregatedData[month]?.work_in_progress_expense) || 0
          const amortization = Number(aggregatedData[month]?.amortization_expense) || 0
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
        const employeeExpenseExecutiveRenumerationValues = months.map(
          (month) => aggregatedPlanningAssign[month]?.totalExecutiveRenumeration || 0,
        )
        const employeeExpenseSalaryValues = months.map((month) => aggregatedPlanningAssign[month]?.totalSalary || 0)
        const employeeExpenseBonusAndFuelAllowanceValues = months.map(
          (month) => aggregatedPlanningAssign[month]?.totalBonusAndFuel || 0,
        )
        const employeeExpenseStatutoryWelfareExpenseValues = months.map(
          (month) => aggregatedPlanningAssign[month]?.totalStatutoryWelfare || 0,
        )
        const employeeExpenseWelfareExpenseValues = months.map((month) => aggregatedPlanningAssign[month]?.totalWelfare || 0)
        const employeeExpenseInsurancePremiumValues = months.map(
          (month) => aggregatedPlanningAssign[month]?.totalInsurancePremium || 0,
        )

        // EMPLOYEE EXPENSE TOTALS
        const employeeExpensesValues = months.map((month) => {
          const executiveRenumeration = Number(aggregatedPlanningAssign[month]?.totalExecutiveRenumeration) || 0
          const salary = Number(aggregatedPlanningAssign[month]?.totalSalary) || 0
          const bonusAndFuelAllowance = Number(aggregatedPlanningAssign[month]?.totalBonusAndFuel) || 0
          const statutoryWelfareExpense = Number(aggregatedPlanningAssign[month]?.totalStatutoryWelfare) || 0
          const welfareExpense = Number(aggregatedPlanningAssign[month]?.totalWelfare) || 0
          const insurancePremium = Number(aggregatedPlanningAssign[month]?.totalInsurancePremium) || 0
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
        const nonOperatingIncomeValues = months.map(
          (month) => aggregatedPlanningProjectData[month]?.non_operating_income || 0,
        )
        const nonOperatingExpensesValues = months.map(
          (month) => aggregatedPlanningProjectData[month]?.non_operating_expense || 0,
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
            values: organiseTotals(salesValues),
          },
          {
            label: 'sales',
            values: organiseTotals(salesValues),
          },
          //start of cost of sales portion
          {
            label: 'costOfSales',
            values: organiseTotals(costOfSalesValues),
          },
          {
            label: 'purchases',
            values: organiseTotals(purchasesValues),
          },
          {
            label: 'outsourcingExpenses',
            values: organiseTotals(outsourcingExpenseValues),
          },
          {
            label: 'productPurchases',
            values: organiseTotals(productPurchaseValues),
          },
          {
            label: 'dispatchLaborExpenses',
            values: organiseTotals(dispatchLaborExpenseValues),
          },
          {
            label: 'communicationExpenses',
            values: organiseTotals(communicationCostValues),
          },
          {
            label: 'workInProgressExpenses',
            values: organiseTotals(workInProgressValues),
          },
          {
            label: 'amortizationExpenses',
            values: organiseTotals(amortizationValues),
          },
          // end for cost of sales section
          {
            label: 'grossProfit',
            values: organiseTotals(grossProfitValues),
          },
          // start for employee expense section
          {
            label: 'employeeExpenses',
            values: organiseTotals(employeeExpensesValues),
          },
          {
            label: 'executiveRenumeration',
            values: organiseTotals(employeeExpenseExecutiveRenumerationValues),
          },
          {
            label: 'salary',
            values: organiseTotals(employeeExpenseSalaryValues),
          },
          {
            label: 'bonusAndFuelAllowance',
            values: organiseTotals(employeeExpenseBonusAndFuelAllowanceValues),
          },
          {
            label: 'statutoryWelfareExpenses',
            values: organiseTotals(employeeExpenseStatutoryWelfareExpenseValues),
          },
          {
            label: 'welfareExpenses',
            values: organiseTotals(employeeExpenseWelfareExpenseValues),
          },
          {
            label: 'insurancePremiums',
            values: organiseTotals(employeeExpenseInsurancePremiumValues),
          },
          //end for employee expense section
          //start for expenses section
          {
            label: 'expenses',
            values: organiseTotals(expenseValues),
          },
          {
            //same value to " 給与手当 " ?
            label: 'consumableExpenses',
            values: organiseTotals(consumableValues),
          },
          {
            label: 'rentExpenses',
            values: organiseTotals(rentValues),
          },
          {
            label: 'taxesAndPublicCharges',
            values: organiseTotals(taxesPublicChargesValues),
          },
          {
            label: 'depreciationExpenses',
            values: organiseTotals(depreciationExpensesValues),
          },
          {
            label: 'travelExpenses',
            values: organiseTotals(travelExpenseValues),
          },
          {
            label: 'communicationExpenses',
            values: organiseTotals(communicationExpenseValues),
          },
          {
            label: 'utilitiesExpenses',
            values: organiseTotals(utilitiesValues),
          },
          {
            label: 'transactionFees',
            values: organiseTotals(transactionFeeValues),
          },
          {
            label: 'advertisingExpenses',
            values: organiseTotals(advertisingExpenseValues),
          },
          {
            label: 'entertainmentExpenses',
            values: organiseTotals(entertainmentExpenseValues),
          },
          {
            label: 'professionalServicesFees',
            values: organiseTotals(professionalServiceFeeValues),
          },
          // end for expense section
          {
            //add 人件費 + 経費 field
            label: 'sellingAndGeneralAdminExpensesShort', // shortened version as it is too long in English Mode
            values: organiseTotals(sellingAndGeneralAdminExpenseValues),
          },
          //Operating income 営業利益 ①
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

        setData(data)
      })
    .catch(error => {
      console.error(error);
    });
  }, []);

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en');
  }, [language]);

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
    setLanguage(newLanguage);
  };

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

  const halfYears = ['firstHalftotal', 'secondHalftotal', 'totalTable'];

  return (
    <div className='table-planning-container editScrollable'>
      <div className='table-planning'>
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
};

export default TablePlanning;
