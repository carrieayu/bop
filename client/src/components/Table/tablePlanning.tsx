import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { translate } from '../../utils/translationUtil';

const TablePlanning = () => {
  const [data, setData] = useState([]);
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); // State for switch in translation

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    // axios.get('http://127.0.0.1:8000/api/planning/all/', {
    axios.get('http://54.178.202.58:8000/api/planning/all/', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    })
    .then(response => {
      console.log('All Data:', response.data); // Log the response data to inspect in the console

      const aggregatedData = response.data.cost_of_sales.reduce((acc, item) => {
        const { month, ...values } = item;
        if (!acc[month]) {
          acc[month] = { ...values };
        } else {
          Object.keys(values).forEach(key => {
            acc[month][key] += values[key];
          });
        }
        return acc;
      }, {});
      const aggregatedExpensesData = response.data.expenses.reduce((acc, item) => {
        const { month, ...values } = item;
        if (!acc[month]) {
          acc[month] = { month, ...values };  // Include month in the object
        } else {
          Object.keys(values).forEach(key => {
            acc[month][key] += values[key];
          });
        }
        return acc;
      }, {});
      const aggregatedPlanningProjectData = response.data.planning_project_data.reduce((acc, item) => {
        const { month, ...values } = item;
        if (!acc[month]) {
          acc[month] = { month };
        }
        Object.keys(values).forEach(key => {
          // Convert value to a float
          const value = parseFloat(values[key]);
          if (!isNaN(value)) {
            acc[month][key] = (acc[month][key] || 0) + value;
          }
        });
      
        return acc;
      }, {});
      const aggregatedPlanningAssign = response.data.planning_assign_data.reduce((acc, item) => {
        const { month, ...values } = item;
        if (!acc[month]) {
          acc[month] = { month, ...values };  // Include month in the object
        } else {
          Object.keys(values).forEach(key => {
            acc[month][key] += values[key];
          });
        }
        return acc;
      }, {});

      console.log('Aggregated Planning Assign Data:', aggregatedPlanningAssign);

      const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
      //COST OF SALES
      const costOfSalesValues = months.map(month => aggregatedData[month]?.cost_of_sales || 0);
      const purchasesValues = months.map(month => aggregatedData[month]?.purchases || 0);
      const outsourcingValues = months.map(month => aggregatedData[month]?.outsourcing_costs || 0);
      const productPurchaseValues = months.map(month => aggregatedData[month]?.product_purchases || 0);
      const dispatchLaborValues = months.map(month => aggregatedData[month]?.dispatch_labor_costs || 0);
      const communicationCostValues = months.map(month => aggregatedData[month]?.communication_costs || 0);
      const inProgressValues = months.map(month => aggregatedData[month]?.work_in_progress || 0);
      const amortizationValues = months.map(month => aggregatedData[month]?.amortization || 0);

      //PLANNING ASSIGN
      const renumerationValues = months.map(month => aggregatedExpensesData[month]?.remuneration || 0);
      const consumableValues = months.map(month => aggregatedExpensesData[month]?.consumables_expenses || 0);
      const assign_unit_priceValues = months.map(month => aggregatedPlanningAssign[month]?.assignment_unit_price || 0); //assignment_unit_price value data
      const travelExpenseValues = months.map(month => aggregatedExpensesData[month]?.travel_expenses || 0);
      const taxesPublicChargesValues = months.map(month => aggregatedExpensesData[month]?.taxes_and_public_charges || 0);
      const utilitiesValues = months.map(month => aggregatedExpensesData[month]?.utilities_expenses || 0);

      //FOR EXPENSES
      const rentValues = months.map(month => aggregatedExpensesData[month]?.rent || 0);
      const paymentFeeValues = months.map(month => aggregatedExpensesData[month]?.payment_fees || 0);
      const depreciationExpensesValues = months.map(month => aggregatedExpensesData[month]?.depreciation_expenses || 0);
      const communicationExpenseValues = months.map(month => aggregatedExpensesData[month]?.communication_expenses || 0);
      const advertisingExpenseValues = months.map(month => aggregatedExpensesData[month]?.advertising_expenses || 0);
      const entertainmentExpenseValues = months.map(month => aggregatedExpensesData[month]?.entertainment_expenses || 0);

      //NoN Operating Income & Expense
      const nonOperatingIncomeValues = months.map(month => aggregatedPlanningProjectData[month]?.non_operating_income || 0);
      const nonOperatingExpensesValues = months.map(month => aggregatedPlanningProjectData[month]?.non_operating_expenses || 0);

      // console.log("Non Operating: " , nonOperatingIncomeValues)
      const personnelExpensesValues = months.map(month => {
        const totalExpenses = aggregatedExpensesData[month]?.remuneration + aggregatedPlanningAssign[month]?.assignment_unit_price +
        aggregatedExpensesData[month]?.travel_expenses + aggregatedExpensesData[month]?.taxes_and_public_charges + 
        aggregatedExpensesData[month]?.utilities_expenses || 0;

        return totalExpenses;
      })
      const generalExpenseValues = months.map(month => {
        const personnelExpenses = (aggregatedExpensesData[month]?.remuneration || 0) +
          (aggregatedExpensesData[month]?.consumables_expenses || 0) +
          (aggregatedExpensesData[month]?.travel_expenses || 0) +
          (aggregatedExpensesData[month]?.taxes_and_public_charges || 0) +
          (aggregatedExpensesData[month]?.utilities_expenses || 0);
      
          const totalExpense = aggregatedExpensesData[month]?.rent + 
          aggregatedExpensesData[month]?.consumables_expenses +
          aggregatedExpensesData[month]?.payment_fees + 
          aggregatedExpensesData[month]?.taxes_and_public_charges + 
          aggregatedExpensesData[month]?.depreciation_expenses + 
          aggregatedExpensesData[month]?.travel_expenses + 
          aggregatedExpensesData[month]?.communication_expenses + 
          aggregatedExpensesData[month]?.utilities_expenses + 
          aggregatedExpensesData[month]?.advertising_expenses + 
          aggregatedExpensesData[month]?.advertising_expenses + 
          aggregatedExpensesData[month]?.entertainment_expenses + 
          aggregatedExpensesData[month]?.payment_fees || 0;
         
          const generalTotal = personnelExpenses + totalExpense
        return {
          month,
          personnelExpenses,
          totalExpense,
          generalTotal
        };
      });

      const expenseTotalValues = months.map(month => {
        const totalExpense = aggregatedExpensesData[month]?.rent + 
        aggregatedExpensesData[month]?.consumables_expenses +
        aggregatedExpensesData[month]?.payment_fees + 
        aggregatedExpensesData[month]?.taxes_and_public_charges + 
        aggregatedExpensesData[month]?.depreciation_expenses + 
        aggregatedExpensesData[month]?.travel_expenses + 
        aggregatedExpensesData[month]?.communication_expenses + 
        aggregatedExpensesData[month]?.utilities_expenses + 
        aggregatedExpensesData[month]?.advertising_expenses + 
        aggregatedExpensesData[month]?.advertising_expenses + 
        aggregatedExpensesData[month]?.entertainment_expenses + 
        aggregatedExpensesData[month]?.payment_fees || 0;

        return totalExpense;
      })
      const firstHalfTotal = arr => arr.slice(0, 6).reduce((acc, value) => acc + parseFloat(value), 0);
      const secondHalfTotal = arr => arr.slice(6).reduce((acc, value) => acc + parseFloat(value), 0);
      const total = arr => arr.reduce((acc, value) => acc + parseFloat(value), 0);

      // Compute gross profit for each month
      const grossProfitValues = months.map(month => {
        const totalRevenue = aggregatedData[month]?.product_purchases + aggregatedData[month]?.purchases || 0;
        const grossProfit = totalRevenue - (aggregatedData[month]?.cost_of_sales || 0);
        return grossProfit;
      });

      const grossProfitData = {
        label: 'grossProfit',
        values: [
          ...grossProfitValues,
          firstHalfTotal(grossProfitValues),
          secondHalfTotal(grossProfitValues),
          total(grossProfitValues),
          ''
        ],
      };

      const sellingGeneralValues = generalExpenseValues.map(item => item.generalTotal);
      const operatingProfitValues = grossProfitValues.map((grossProfit, index) => grossProfit - sellingGeneralValues[index]);

      const ordinaryProfitValues = months.map((month, index) => {
        const operatingProfitValuess = operatingProfitValues[index];
        const nonOperatingIncome = nonOperatingIncomeValues[index];
        const nonOperatingExpenses = nonOperatingExpensesValues[index];
        const operatingTotal = operatingProfitValuess + nonOperatingIncome + nonOperatingExpenses;

        return operatingTotal;
      });

      const cumulativeSum = (arr) => {
        let sum = 0;
        return arr.map(value => sum += value);
      };
      const cumulativeOrdinaryProfitValues = cumulativeSum(ordinaryProfitValues);

      // console.log("Cumulative: ", cumulativeOrdinaryProfitValues)

      const data = [
        {
          label: 'salesRevenue',
          values: Array(16).fill(0),
        },
        {
          label: 'sales',
          values: Array(16).fill(0),
        },
        //start of cost of sales portion
        {
          label: 'costofGoodSold',
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
          label: 'outsourcingCosts',
          values: [
            ...outsourcingValues,
            firstHalfTotal(outsourcingValues),
            secondHalfTotal(outsourcingValues),
            total(outsourcingValues),
            // `${(total(outsourcingValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          label: 'merchandisePurchases',
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
          label: 'temporaryStaffCost',
          values: [
            ...dispatchLaborValues,
            firstHalfTotal(dispatchLaborValues),
            secondHalfTotal(dispatchLaborValues),
            total(dispatchLaborValues),
            // `${(total(dispatchLaborValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
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
          label: 'workinProgressExpense',
          values: [
            ...inProgressValues,
            firstHalfTotal(inProgressValues),
            secondHalfTotal(inProgressValues),
            total(inProgressValues),
            // `${(total(inProgressValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          label: 'postingdepreciationExpense',
          values: [
            ...amortizationValues,
            firstHalfTotal(amortizationValues),
            secondHalfTotal(amortizationValues),
            total(amortizationValues),
            // `${(total(amortizationValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
            '0',
          ],
        },
        //end of cost of sales portion
        //start for planning assign data portion
         grossProfitData, //gross profit
         {
          label: 'laborCosts',
          values: [
            ...personnelExpensesValues,
            firstHalfTotal(personnelExpensesValues),
            secondHalfTotal(personnelExpensesValues),
            total(personnelExpensesValues),
            // `${(total(personnelExpensesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          label: 'executiveCompensation',
          values: [
            ...renumerationValues,
            firstHalfTotal(renumerationValues),
            secondHalfTotal(renumerationValues),
            total(renumerationValues),
            // `${(total(renumerationValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
         {
          label: 'salaryAndallowances',
          values: [
            ...assign_unit_priceValues,
            firstHalfTotal(assign_unit_priceValues),
            secondHalfTotal(assign_unit_priceValues),
            total(assign_unit_priceValues),
            // `${(total(consumableValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          label: 'bonusesAndfuelallowances',
          values: [
            ...travelExpenseValues,
            firstHalfTotal(travelExpenseValues),
            secondHalfTotal(travelExpenseValues),
            total(travelExpenseValues),
            // `${(total(travelExpenseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          label: 'statutoryWelfareCosts',
          values: [
            ...taxesPublicChargesValues,
            firstHalfTotal(taxesPublicChargesValues),
            secondHalfTotal(taxesPublicChargesValues),
            total(taxesPublicChargesValues),
            // `${(total(taxesPublicChargesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          label: 'welfareExpenses',
          values: [
            ...utilitiesValues,
            firstHalfTotal(utilitiesValues),
            secondHalfTotal(utilitiesValues),
            total(utilitiesValues),
            // `${(total(utilitiesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        //end for planning portion
        //start for expenses portion
        {
          label: 'expenses',
          values: [
            ...expenseTotalValues,
            firstHalfTotal(expenseTotalValues),
            secondHalfTotal(expenseTotalValues),
            total(expenseTotalValues),
            // `${(total(expenseTotalValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          //same value to " 給与手当 " ?
          label: 'suppliesExpense',
          values: [
            ...consumableValues,
            firstHalfTotal(consumableValues),
            secondHalfTotal(consumableValues),
            total(consumableValues),
            // `${(total(consumableValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          label: 'rentExpense',
          values: [
            ...rentValues,
            firstHalfTotal(rentValues),
            secondHalfTotal(rentValues),
            total(rentValues),
            // `${(total(rentValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          label: 'insurancePremiums',
          values: [
            ...paymentFeeValues,
            firstHalfTotal(paymentFeeValues),
            secondHalfTotal(paymentFeeValues),
            total(paymentFeeValues),
            // `${(total(paymentFeeValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          //same " 法定福利費 "
          label: 'taxesAndpublicdues',
          values: [
            ...taxesPublicChargesValues,
            firstHalfTotal(taxesPublicChargesValues),
            secondHalfTotal(taxesPublicChargesValues),
            total(taxesPublicChargesValues),
            // `${(total(taxesPublicChargesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          label: 'depreciationExpense',
          values: [
            ...depreciationExpensesValues,
            firstHalfTotal(depreciationExpensesValues),
            secondHalfTotal(depreciationExpensesValues),
            total(depreciationExpensesValues),
            // `${(total(depreciationExpensesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          label: 'travelAndtransportationexpenses',
          values: [
            ...travelExpenseValues,
            firstHalfTotal(travelExpenseValues),
            secondHalfTotal(travelExpenseValues),
            total(travelExpenseValues),
            // `${(total(travelExpenseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
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
            // `${(total(communicationExpenseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          label: 'utilities',
          values: [
            ...utilitiesValues,
            firstHalfTotal(utilitiesValues),
            secondHalfTotal(utilitiesValues),
            total(utilitiesValues),
            // `${(total(utilitiesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          label: 'paymentFees',
          values: [
            ...advertisingExpenseValues,
            firstHalfTotal(advertisingExpenseValues),
            secondHalfTotal(advertisingExpenseValues),
            total(advertisingExpenseValues),
            // `${(total(advertisingExpenseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          label: 'advertisingAndpromotionexpenses',
          values: [
            ...advertisingExpenseValues,
            firstHalfTotal(advertisingExpenseValues),
            secondHalfTotal(advertisingExpenseValues),
            total(advertisingExpenseValues),
            // `${(total(advertisingExpenseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          label: 'entertainmentAndhospitalityexpenses',
          values: [
            ...entertainmentExpenseValues,
            firstHalfTotal(entertainmentExpenseValues),
            secondHalfTotal(entertainmentExpenseValues),
            total(entertainmentExpenseValues),
            // `${(total(entertainmentExpenseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          label: 'paymentForcompensation',
          values: [
            ...paymentFeeValues,
            firstHalfTotal(paymentFeeValues),
            secondHalfTotal(paymentFeeValues),
            total(paymentFeeValues),
            // `${(total(paymentFeeValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
            '0',
          ],
        },
        {
          //add 人件費 + 経費 field
          label: 'sellingAndgeneraladministrativeexpenses',
          // values: Array(16).fill(0),
          values: [
            ...generalExpenseValues.map(item => item.generalTotal),
            firstHalfTotal(generalExpenseValues.map(item => item.generalTotal)),
            secondHalfTotal(generalExpenseValues.map(item => item.generalTotal)),
            total(generalExpenseValues.map(item => item.generalTotal)),
            '0',
          ],
        },
        //Operating income 営業利益 ①
        {
          label: 'operatingProfit',
          values: [
            ...operatingProfitValues,
            firstHalfTotal(operatingProfitValues),
            secondHalfTotal(operatingProfitValues),
            total(operatingProfitValues),
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
          label: 'ordinaryProfit',
          values: [
            ...ordinaryProfitValues ,
            firstHalfTotal(ordinaryProfitValues ),
            secondHalfTotal(ordinaryProfitValues ),
            total(ordinaryProfitValues ),
            '0', 
          ],
        },
        {
          label: 'cumulativeOrdinaryProfit',
          values: [
            ...cumulativeOrdinaryProfitValues ,
            firstHalfTotal(cumulativeOrdinaryProfitValues ),
            secondHalfTotal(cumulativeOrdinaryProfitValues ),
            total(cumulativeOrdinaryProfitValues ),
            '0', 
          ],
        },
      ];

      setData(data);
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
    'costofGoodSold',
    'grossProfit',
    'personal expenses',
    'laborCosts',
    'sellingAndgeneraladministrativeexpenses',
    'operatingProfit ①',
    'ordinaryProfit',
    'cumulativeOrdinaryProfit',
  ];

  const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
  const monthNames: { [key: number]: { en: string; jp: string } } = {
    1: { en: "January", jp: "1月" },
    2: { en: "February", jp: "2月" },
    3: { en: "March", jp: "3月" },
    4: { en: "April", jp: "4月" },
    5: { en: "May", jp: "5月" },
    6: { en: "June", jp: "6月" },
    7: { en: "July", jp: "7月" },
    8: { en: "August", jp: "8月" },
    9: { en: "September", jp: "9月" },
    10: { en: "October", jp: "10月" },
    11: { en: "November", jp: "11月" },
    12: { en: "December", jp: "12月" },
  };
  const halfYears = ['firstHalftotal', 'secondHalftotal', 'totalTable'];

  return (
    <div className="table-planning-container">
      <div className="table-planning">
        <table>
          <thead>
            <tr>
              <th>{translate('item', language)}</th>
              {months.map((month, index) => (
                <th key={index} className={(month >= 10 || month <= 3) ? 'light-txt' : 'orange-txt'}>
                  {language === "en" ? monthNames[month].en : monthNames[month].jp}
                </th>
              ))}
              {halfYears.map((halfYear, index) => (
                <th key={index} className="sky-txt">
                  {translate('planning', language)}
                </th>
              ))}
              <th className='total-txt'>{translate('sales', language)}</th>
            </tr>
            <tr className='scnd-row'>
              <th className='borderless'></th>
              {months.map((month, index) => (
                <th key={index}>{translate('planning', language)}</th>
              ))}
              {halfYears.map((_, index) => (
                <th key={index} className=''>{translate('planning', language)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td className={noIndentLabels.includes(item.label) ? 'no-indent' : 'indented-label'}>{translate(item.label, language)}</td>
                {item.values.map((value, valueIndex) => (
                  <td key={valueIndex}>{value.toLocaleString()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablePlanning;
