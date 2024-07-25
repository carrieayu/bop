import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TablePlanning = () => {
  const [data, setData] = useState([]);

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

      console.log('Aggregated PlanningProject Data:', aggregatedPlanningProjectData);

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

      console.log("Non Operating: " , nonOperatingIncomeValues)
      const personnelExpensesValues = months.map(month => {
        const totalExpenses = aggregatedExpensesData[month]?.remuneration + aggregatedExpensesData[month]?.consumables_expenses +
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
        label: '売上総利益',
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

      console.log("Cumulative: ", cumulativeOrdinaryProfitValues)

      const data = [
        {
          label: '売上高',
          values: Array(16).fill(0),
        },
        {
          label: '売上',
          values: Array(16).fill(0),
        },
        //start of cost of sales portion
        {
          label: '売上原価',
          values: [
            ...costOfSalesValues,
            firstHalfTotal(costOfSalesValues),
            secondHalfTotal(costOfSalesValues),
            total(costOfSalesValues),
            `${(total(costOfSalesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '仕入高',
          values: [
            ...purchasesValues,
            firstHalfTotal(purchasesValues),
            secondHalfTotal(purchasesValues),
            total(purchasesValues),
            `${(total(purchasesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '外注加工費',
          values: [
            ...outsourcingValues,
            firstHalfTotal(outsourcingValues),
            secondHalfTotal(outsourcingValues),
            total(outsourcingValues),
            `${(total(outsourcingValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '商品仕入',
          values: [
            ...productPurchaseValues,
            firstHalfTotal(productPurchaseValues),
            secondHalfTotal(productPurchaseValues),
            total(productPurchaseValues),
            `${(total(productPurchaseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '派遣人件費',
          values: [
            ...dispatchLaborValues,
            firstHalfTotal(dispatchLaborValues),
            secondHalfTotal(dispatchLaborValues),
            total(dispatchLaborValues),
            `${(total(dispatchLaborValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '通信費',
          values: [
            ...communicationCostValues,
            firstHalfTotal(communicationCostValues),
            secondHalfTotal(communicationCostValues),
            total(communicationCostValues),
            `${(total(communicationCostValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '仕掛計上',
          values: [
            ...inProgressValues,
            firstHalfTotal(inProgressValues),
            secondHalfTotal(inProgressValues),
            total(inProgressValues),
            `${(total(inProgressValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '償却計上',
          values: [
            ...amortizationValues,
            firstHalfTotal(amortizationValues),
            secondHalfTotal(amortizationValues),
            total(amortizationValues),
            `${(total(amortizationValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
          ],
        },
        //end of cost of sales portion
        //start for planning assign data portion
         grossProfitData, //gross profit
         {
          label: '人件費',
          values: [
            ...personnelExpensesValues,
            firstHalfTotal(personnelExpensesValues),
            secondHalfTotal(personnelExpensesValues),
            total(personnelExpensesValues),
            `${(total(personnelExpensesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '役員報酬',
          values: [
            ...renumerationValues,
            firstHalfTotal(renumerationValues),
            secondHalfTotal(renumerationValues),
            total(renumerationValues),
            `${(total(renumerationValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
         {
          label: '給与手当',
          values: [
            ...consumableValues,
            firstHalfTotal(consumableValues),
            secondHalfTotal(consumableValues),
            total(consumableValues),
            `${(total(consumableValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '賞与・燃料手当',
          values: [
            ...travelExpenseValues,
            firstHalfTotal(travelExpenseValues),
            secondHalfTotal(travelExpenseValues),
            total(travelExpenseValues),
            `${(total(travelExpenseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '法定福利費',
          values: [
            ...taxesPublicChargesValues,
            firstHalfTotal(taxesPublicChargesValues),
            secondHalfTotal(taxesPublicChargesValues),
            total(taxesPublicChargesValues),
            `${(total(taxesPublicChargesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '福利厚生費',
          values: [
            ...utilitiesValues,
            firstHalfTotal(utilitiesValues),
            secondHalfTotal(utilitiesValues),
            total(utilitiesValues),
            `${(total(utilitiesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        //end for planning portion
        //start for expenses portion
        {
          label: '経費',
          values: [
            ...expenseTotalValues,
            firstHalfTotal(expenseTotalValues),
            secondHalfTotal(expenseTotalValues),
            total(expenseTotalValues),
            `${(total(expenseTotalValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          //same value to " 給与手当 " ?
          label: '消耗品費',
          values: [
            ...consumableValues,
            firstHalfTotal(consumableValues),
            secondHalfTotal(consumableValues),
            total(consumableValues),
            `${(total(consumableValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '賃借料',
          values: [
            ...rentValues,
            firstHalfTotal(rentValues),
            secondHalfTotal(rentValues),
            total(rentValues),
            `${(total(rentValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '保険料',
          values: [
            ...paymentFeeValues,
            firstHalfTotal(paymentFeeValues),
            secondHalfTotal(paymentFeeValues),
            total(paymentFeeValues),
            `${(total(paymentFeeValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          //same " 法定福利費 "
          label: '租税公課',
          values: [
            ...taxesPublicChargesValues,
            firstHalfTotal(taxesPublicChargesValues),
            secondHalfTotal(taxesPublicChargesValues),
            total(taxesPublicChargesValues),
            `${(total(taxesPublicChargesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '減価償却費',
          values: [
            ...depreciationExpensesValues,
            firstHalfTotal(depreciationExpensesValues),
            secondHalfTotal(depreciationExpensesValues),
            total(depreciationExpensesValues),
            `${(total(depreciationExpensesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '旅費交通費',
          values: [
            ...travelExpenseValues,
            firstHalfTotal(travelExpenseValues),
            secondHalfTotal(travelExpenseValues),
            total(travelExpenseValues),
            `${(total(travelExpenseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '通信費',
          values: [
            ...communicationExpenseValues,
            firstHalfTotal(communicationExpenseValues),
            secondHalfTotal(communicationExpenseValues),
            total(communicationExpenseValues),
            `${(total(communicationExpenseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '水道光熱費',
          values: [
            ...utilitiesValues,
            firstHalfTotal(utilitiesValues),
            secondHalfTotal(utilitiesValues),
            total(utilitiesValues),
            `${(total(utilitiesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '支払手数料',
          values: [
            ...advertisingExpenseValues,
            firstHalfTotal(advertisingExpenseValues),
            secondHalfTotal(advertisingExpenseValues),
            total(advertisingExpenseValues),
            `${(total(advertisingExpenseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '広告宣伝費',
          values: [
            ...advertisingExpenseValues,
            firstHalfTotal(advertisingExpenseValues),
            secondHalfTotal(advertisingExpenseValues),
            total(advertisingExpenseValues),
            `${(total(advertisingExpenseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '接待交際費',
          values: [
            ...entertainmentExpenseValues,
            firstHalfTotal(entertainmentExpenseValues),
            secondHalfTotal(entertainmentExpenseValues),
            total(entertainmentExpenseValues),
            `${(total(entertainmentExpenseValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          label: '支払報酬',
          values: [
            ...paymentFeeValues,
            firstHalfTotal(paymentFeeValues),
            secondHalfTotal(paymentFeeValues),
            total(paymentFeeValues),
            `${(total(paymentFeeValues) / total(costOfSalesValues) * 100).toFixed(2)}%`, 
          ],
        },
        {
          //add 人件費 + 経費 field
          label: '販売及び一般管理費',
          // values: Array(16).fill(0),
          values: [
            ...generalExpenseValues.map(item => item.generalTotal),
            firstHalfTotal(generalExpenseValues.map(item => item.generalTotal)),
            secondHalfTotal(generalExpenseValues.map(item => item.generalTotal)),
            total(generalExpenseValues.map(item => item.generalTotal)),
            ''
          ],
        },
        //Operating income 営業利益 ①
        {
          label: '営業利益 ①',
          values: [
            ...operatingProfitValues,
            firstHalfTotal(operatingProfitValues),
            secondHalfTotal(operatingProfitValues),
            total(operatingProfitValues),
            ''
          ],
        },
        {
          label: '営業外収益',
          values: [
            ...nonOperatingIncomeValues,
            firstHalfTotal(nonOperatingIncomeValues),
            secondHalfTotal(nonOperatingIncomeValues),
            total(nonOperatingIncomeValues),
            ''
          ],
        },
        {
          label: '営業外費用',
          values: [
            ...nonOperatingExpensesValues,
            firstHalfTotal(nonOperatingExpensesValues),
            secondHalfTotal(nonOperatingExpensesValues),
            total(nonOperatingExpensesValues),
            ''
          ],
        },
        {
          label: '経常利益',
          values: [
            ...ordinaryProfitValues ,
            firstHalfTotal(ordinaryProfitValues ),
            secondHalfTotal(ordinaryProfitValues ),
            total(ordinaryProfitValues ),
            '' 
          ],
        },
        {
          label: '累計経常利益',
          values: [
            ...cumulativeOrdinaryProfitValues ,
            firstHalfTotal(cumulativeOrdinaryProfitValues ),
            secondHalfTotal(cumulativeOrdinaryProfitValues ),
            total(cumulativeOrdinaryProfitValues ),
            '' 
          ],
        },
      ];

      setData(data);
    })
    .catch(error => {
      console.error(error);
    });
  }, []);

  const noIndentLabels = [
    '売上高',
    '売上原価',
    '売上総利益',
    '人件費',
    '経費',
    '販売及び一般管理費',
    '営業利益 ①',
    '経常利益',
    '累計経常利益',
  ];

  const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
  const halfYears = ['上期計', '下期計', '合計'];

  return (
    <div className="table-planning-container">
      <div className="table-planning">
        <table className="plan">
          <thead>
            <tr>
              <th>項目</th>
              {months.map((month, index) => (
                <th key={index} className={(month >= 10 || month <= 3) ? 'light-txt' : 'orange-txt'}>
                  {month}月
                </th>
              ))}
              {halfYears.map((halfYear, index) => (
                <th key={index} className="sky-txt">
                  {halfYear}
                </th>
              ))}
              <th className='total-txt'>売上比</th>
            </tr>
            <tr className='scnd-row'>
              <th className='borderless'></th>
              {months.map((month, index) => (
                <th key={index}>計画</th>
              ))}
              {halfYears.map((_, index) => (
                <th key={index} className=''>計画</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td className={noIndentLabels.includes(item.label) ? 'no-indent' : 'indented-label'}>{item.label}</td>
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
