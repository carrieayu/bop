import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translate } from '../../utils/translationUtil';
import { getPlanningA } from '../../api/PlanningEndpoint/GetPlanningA';
import { monthNames, months, token } from '../../constants';
import { cumulativeSum, organiseTotals } from '../../utils/helperFunctionsUtil'
import { aggregatedCostOfSalesFunction, aggregatedEmployeeExpensesFunction, aggregatedExpensesFunction, aggregatedProjectsFunction, costOfSalesTotalsFunction, employeeExpensesTotalsFunction, expensesTotalsFunction, grossProfitFunction, mapValue, operatingIncomeFunction, ordinaryProfitFunction, sellingAndGeneralAdminExpenseFunction } from '../../utils/tableAggregationUtil';

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
        // PLANNING:COST OF SALES
        const aggregatedCostOfSalesData = aggregatedCostOfSalesFunction(response.cost_of_sales)
        // PLANNING:EXPENSES
        const aggregatedExpensesData = aggregatedExpensesFunction(response.expenses)
        // PLANNING:EMPLOYEE EXPENSES
        const aggregatedEmployeeExpensesData = aggregatedEmployeeExpensesFunction(response.employee_expenses)
        // PLANNING:PROJECTS
        const aggregatedProjectsData = aggregatedProjectsFunction(response.projects)

        // SALES REVENUE
        const salesRevenueValues = months.map((month) => aggregatedProjectsData[month]?.sales_revenue || 0)

        // PLANNING: COST OF SALES TOTALS VALUES
        const costOfSalesValues = costOfSalesTotalsFunction(aggregatedCostOfSalesData)

        const purchasesValues = mapValue('purchase', aggregatedCostOfSalesData)
        const outsourcingExpenseValues = mapValue('outsourcing_expense', aggregatedCostOfSalesData)
        const productPurchaseValues = mapValue('product_purchase', aggregatedCostOfSalesData)
        const dispatchLaborExpenseValues = mapValue('dispatch_labor_expense', aggregatedCostOfSalesData)
        const communicationCostValues = mapValue('communication_expense', aggregatedCostOfSalesData)
        const workInProgressExpenseValues = mapValue('work_in_progress_expense', aggregatedCostOfSalesData)
        const amortizationExpenseValues = mapValue('amortization_expense', aggregatedCostOfSalesData)

        // PLANNING:GROSS PROFIT
        const grossProfitValues = grossProfitFunction(salesRevenueValues, costOfSalesValues)

        // PLANNING:EMPLOYEE EXPENSE
        const employeeExpenseExecutiveRemunerationValues = mapValue(
          'totalExecutiveRemuneration',
          aggregatedEmployeeExpensesData,
        )
        const employeeExpenseSalaryValues = mapValue('totalSalary', aggregatedEmployeeExpensesData)
        const employeeExpenseBonusAndFuelAllowanceValues = mapValue('totalBonusAndFuel', aggregatedEmployeeExpensesData)
        const employeeExpenseStatutoryWelfareExpenseValues = mapValue(
          'totalStatutoryWelfare',
          aggregatedEmployeeExpensesData,
        )
        const employeeExpenseWelfareExpenseValues = mapValue('totalWelfare', aggregatedEmployeeExpensesData)
        const employeeExpenseInsurancePremiumValues = mapValue('totalInsurancePremium', aggregatedEmployeeExpensesData)

        // PLANNING:EMPLOYEE EXPENSE TOTALS
        const employeeExpenseValues = employeeExpensesTotalsFunction(aggregatedEmployeeExpensesData)

        // PLANNING:EXPENSES
        const expenseValues = expensesTotalsFunction(aggregatedExpensesData)

        const consumableValues = mapValue('consumable_expense', aggregatedExpensesData)
        const rentValues = mapValue('rent_expense', aggregatedExpensesData)
        const taxesPublicChargesValues = mapValue('tax_and_public_charge', aggregatedExpensesData)
        const depreciationExpenseValues = mapValue('depreciation_expense', aggregatedExpensesData)
        const travelExpenseValues = mapValue('travel_expense', aggregatedExpensesData)
        const communicationExpenseValues = mapValue('communication_expense', aggregatedExpensesData)
        const utilitiesValues = mapValue('utilities_expense', aggregatedExpensesData)
        const transactionFeeValues = mapValue('transaction_fee', aggregatedExpensesData)
        const advertisingExpenseValues = mapValue('advertising_expense', aggregatedExpensesData)
        const entertainmentExpenseValues = mapValue('entertainment_expense', aggregatedExpensesData)
        const professionalServiceFeeValues = mapValue('professional_service_fee', aggregatedExpensesData)

        // PLANNING:SELLING AND GENERAL ADMIN EXPENSES
        const sellingAndGeneralAdminExpenseValues = sellingAndGeneralAdminExpenseFunction(
          employeeExpenseValues,
          expenseValues,
        )

        // PLANNING:OPERATING INCOME
        const operatingIncomeValues = operatingIncomeFunction(grossProfitValues, sellingAndGeneralAdminExpenseValues)

        // Non-Operating Income & Expense
        const nonOperatingIncomeValues = mapValue('non_operating_income', aggregatedProjectsData)
        const nonOperatingExpenseValues = mapValue('non_operating_expense', aggregatedProjectsData)

        // PLANNING:ORDINARY PROFIT/INCOME
        const ordinaryIncomeValues = ordinaryProfitFunction(
          operatingIncomeValues,
          nonOperatingIncomeValues,
          nonOperatingExpenseValues,
        )

        const cumulativeOrdinaryIncomeValues = cumulativeSum(ordinaryIncomeValues)

        const labelsAndValues = [
          // Sales revenue section
          { label: 'salesRevenue', values: salesRevenueValues },
          { label: 'sales', values: salesRevenueValues },

          // Cost of sales section
          { label: 'costOfSales', values: costOfSalesValues },
          { label: 'purchases', values: purchasesValues },
          { label: 'outsourcingExpenses', values: outsourcingExpenseValues },
          { label: 'productPurchases', values: productPurchaseValues },
          { label: 'dispatchLaborExpenses', values: dispatchLaborExpenseValues },
          { label: 'communicationExpenses', values: communicationCostValues },
          { label: 'workInProgressExpenses', values: workInProgressExpenseValues },
          { label: 'amortizationExpenses', values: amortizationExpenseValues },

          // Gross profit
          { label: 'grossProfit', values: grossProfitValues },

          // Employee expense section
          { label: 'employeeExpenses', values: employeeExpenseValues },
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
          { label: 'depreciationExpenses', values: depreciationExpenseValues },
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
          { label: 'nonOperatingExpenses', values: nonOperatingExpenseValues },
          { label: 'ordinaryIncome', values: ordinaryIncomeValues },
          { label: 'cumulativeOrdinaryIncome', values: cumulativeOrdinaryIncomeValues },
        ]

        const data = labelsAndValues.map((item) => ({
          label: item.label,
          values: organiseTotals(item.values),
        }))

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
