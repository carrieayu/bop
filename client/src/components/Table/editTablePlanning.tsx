import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { id } from '../../../jest.config'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'

const EditTablePlanning = () => {
  const [data, setData] = useState([])
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }
    axios
      // .get('http://127.0.0.1:8000/api/planning/all/', {
        axios.get('http://54.178.202.58:8000/api/planning/all/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log('All Data:', response.data) 
        const aggregatedData = response.data.cost_of_sales.reduce((acc, item) => {
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
        const aggregatedExpensesData = response.data.expenses.reduce((acc, item) => {
          const { month, ...values } = item
          if (!acc[month]) {
            acc[month] = { month, ...values } 
          } else {
            Object.keys(values).forEach((key) => {
              acc[month][key] += values[key]
            })
          }
          return acc
        }, {})
        const aggregatedPlanningProjectData = response.data.planning_project_data.reduce((acc, item) => {
          const { month, ...values } = item
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
        const aggregatedPlanningAssign = response.data.planning_assign_data.reduce((acc, item) => {
          const { month, ...values } = item
          if (!acc[month]) {
            acc[month] = { month, ...values } 
          } else {
            Object.keys(values).forEach((key) => {
              acc[month][key] += values[key]
            })
          }
          return acc
        }, {})

        console.log('Aggregated Planning Assign Data:', aggregatedPlanningAssign)

        const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]
        //COST OF SALES
        const costOfSalesValues = months.map((month) => aggregatedData[month]?.cost_of_sales || 0)
        const purchasesValues = months.map((month) => {
          const dataEntry = aggregatedData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              purchase: dataEntry.purchases || 0,
            }
          }
          return { id: null, purchase: 0 }
        })
        // const outsourcingValues = months.map((month) => aggregatedData[month]?.outsourcing_costs || 0)
        const outsourcingValues = months.map((month) => {
          const dataEntry = aggregatedData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              outsourcing_costs: dataEntry.outsourcing_costs || 0,
            }
          }
          return { id: null, outsourcing_costs: 0 }
        })

        // const productPurchaseValues = months.map((month) => aggregatedData[month]?.product_purchases || 0)
        const productPurchaseValues = months.map((month) => {
          const dataEntry = aggregatedData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              product_purchases: dataEntry.product_purchases || 0,
            }
          }
          return { id: null, product_purchases: 0 }
        })
        // const dispatchLaborValues = months.map((month) => aggregatedData[month]?.dispatch_labor_costs || 0)
        const dispatchLaborValues = months.map((month) => {
          const dataEntry = aggregatedData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              dispatch_labor_costs: dataEntry.dispatch_labor_costs || 0,
            }
          }
          return { id: null, dispatch_labor_costs: 0 }
        })
        // const communicationCostValues = months.map((month) => aggregatedData[month]?.communication_costs || 0)
        const communicationCostValues = months.map((month) => {
          const dataEntry = aggregatedData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              communication_costs: dataEntry.communication_costs || 0,
            }
          }
          return { id: null, communication_costs: 0 }
        })
        // const inProgressValues = months.map((month) => aggregatedData[month]?.work_in_progress || 0)
        const inProgressValues = months.map((month) => {
          const dataEntry = aggregatedData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              work_in_progress: dataEntry.work_in_progress || 0,
            }
          }
          return { id: null, work_in_progress: 0 }
        })
        // const amortizationValues = months.map((month) => aggregatedData[month]?.amortization || 0)
        const amortizationValues = months.map((month) => {
          const dataEntry = aggregatedData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              amortization: dataEntry.amortization || 0,
            }
          }
          return { id: null, amortization: 0 }
        })
        //PLANNING ASSIGN
        // const renumerationValues = months.map((month) => aggregatedExpensesData[month]?.remuneration || 0)
        const renumerationValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              remuneration: dataEntry.remuneration || 0,
            }
          }
          return { id: null, remuneration: 0 }
        })
        // const consumableValues = months.map((month) => aggregatedExpensesData[month]?.consumables_expenses || 0)
        const consumableValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              consumables_expenses: dataEntry.consumables_expenses || 0,
            }
          }
          return { id: null, consumables_expenses: 0 }
        })

        const assign_unit_priceValues = months.map(
          (month) => aggregatedPlanningAssign[month]?.assignment_unit_price || 0,
        ) //assignment_unit_price value data
        // const travelExpenseValues = months.map((month) => aggregatedExpensesData[month]?.travel_expenses || 0)
        const travelExpenseValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              travel_expenses: dataEntry.travel_expenses || 0,
            }
          }
          return { id: null, travel_expenses: 0 }
        })
        // const taxesPublicChargesValues = months.map((month) => aggregatedExpensesData[month]?.taxes_and_public_charges || 0,)
        const taxesPublicChargesValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              taxes_and_public_charges: dataEntry.taxes_and_public_charges || 0,
            }
          }
          return { id: null, taxes_and_public_charges: 0 }
        })
        // const utilitiesValues = months.map((month) => aggregatedExpensesData[month]?.utilities_expenses || 0)
        const utilitiesValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              utilities_expenses: dataEntry.utilities_expenses || 0,
            }
          }
          return { id: null, utilities_expenses: 0 }
        })

        //FOR EXPENSES
        // const rentValues = months.map((month) => aggregatedExpensesData[month]?.rent || 0)
        const rentValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              rent: dataEntry.rent || 0,
            }
          }
          return { id: null, rent: 0 }
        })

        // const paymentFeeValues = months.map((month) => aggregatedExpensesData[month]?.payment_fees || 0)
        const paymentFeeValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              payment_fees: dataEntry.payment_fees || 0,
            }
          }
          return { id: null, payment_fees: 0 }
        })
        // const depreciationExpensesValues = months.map((month) => aggregatedExpensesData[month]?.depreciation_expenses || 0,)
        const depreciationExpensesValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              depreciation_expenses: dataEntry.depreciation_expenses || 0,
            }
          }
          return { id: null, depreciation_expenses: 0 }
        })
        // const communicationExpenseValues = months.map((month) => aggregatedExpensesData[month]?.communication_expenses || 0,)
        const communicationExpenseValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              communication_expenses: dataEntry.communication_expenses || 0,
            }
          }
          return { id: null, communication_expenses: 0 }
        })
        // const advertisingExpenseValues = months.map((month) => aggregatedExpensesData[month]?.advertising_expenses || 0)
        const advertisingExpenseValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              advertising_expenses: dataEntry.advertising_expenses || 0,
            }
          }
          return { id: null, advertising_expenses: 0 }
        })
        // const entertainmentExpenseValues = months.map((month) => aggregatedExpensesData[month]?.entertainment_expenses || 0,)
        const entertainmentExpenseValues = months.map((month) => {
          const dataEntry = aggregatedExpensesData[month]
          if (dataEntry) {
            return {
              id: dataEntry.id,
              entertainment_expenses: dataEntry.entertainment_expenses || 0,
            }
          }
          return { id: null, entertainment_expenses: 0 }
        })
        //NoN Operating Income & Expense
        const nonOperatingIncomeValues = months.map(
          (month) => aggregatedPlanningProjectData[month]?.non_operating_income || 0,
        )
        const nonOperatingExpensesValues = months.map(
          (month) => aggregatedPlanningProjectData[month]?.non_operating_expenses || 0,
        )

        // console.log("Non Operating: " , nonOperatingIncomeValues)
        const personnelExpensesValues = months.map((month) => {
          const totalExpenses =
            aggregatedExpensesData[month]?.remuneration +
              aggregatedPlanningAssign[month]?.assignment_unit_price +
              aggregatedExpensesData[month]?.travel_expenses +
              aggregatedExpensesData[month]?.taxes_and_public_charges +
              aggregatedExpensesData[month]?.utilities_expenses || 0

          return totalExpenses
        })
        const generalExpenseValues = months.map((month) => {
          const personnelExpenses =
            (aggregatedExpensesData[month]?.remuneration || 0) +
            (aggregatedExpensesData[month]?.consumables_expenses || 0) +
            (aggregatedExpensesData[month]?.travel_expenses || 0) +
            (aggregatedExpensesData[month]?.taxes_and_public_charges || 0) +
            (aggregatedExpensesData[month]?.utilities_expenses || 0)

          const totalExpense =
            aggregatedExpensesData[month]?.rent +
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
              aggregatedExpensesData[month]?.payment_fees || 0

          const generalTotal = personnelExpenses + totalExpense
          return {
            month,
            personnelExpenses,
            totalExpense,
            generalTotal,
          }
        })

        const expenseTotalValues = months.map((month) => {
          const totalExpense =
            aggregatedExpensesData[month]?.rent +
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
              aggregatedExpensesData[month]?.payment_fees || 0

          return totalExpense
        })
        const firstHalfTotal = (arr) => arr.slice(0, 6).reduce((acc, value) => acc + parseFloat(value), 0)
        const secondHalfTotal = (arr) => arr.slice(6).reduce((acc, value) => acc + parseFloat(value), 0)
        const total = (arr) => arr.reduce((acc, value) => acc + parseFloat(value), 0)

        // Compute gross profit for each month
        const grossProfitValues = months.map((month) => {
          const totalRevenue = aggregatedData[month]?.product_purchases + aggregatedData[month]?.purchases || 0
          const grossProfit = totalRevenue - (aggregatedData[month]?.cost_of_sales || 0)
          return grossProfit
        })

        const grossProfitData = {
          label: 'grossProfit',
          values: [
            ...grossProfitValues,
            firstHalfTotal(grossProfitValues),
            secondHalfTotal(grossProfitValues),
            total(grossProfitValues),
            '',
          ],
        }

        const sellingGeneralValues = generalExpenseValues.map((item) => item.generalTotal)
        const operatingProfitValues = grossProfitValues.map(
          (grossProfit, index) => grossProfit - sellingGeneralValues[index],
        )

        const ordinaryProfitValues = months.map((month, index) => {
          const operatingProfitValuess = operatingProfitValues[index]
          const nonOperatingIncome = nonOperatingIncomeValues[index]
          const nonOperatingExpenses = nonOperatingExpensesValues[index]
          const operatingTotal = operatingProfitValuess + nonOperatingIncome + nonOperatingExpenses

          return operatingTotal
        })

        const cumulativeSum = (arr) => {
          let sum = 0
          return arr.map((value) => (sum += value))
        }
        const cumulativeOrdinaryProfitValues = cumulativeSum(ordinaryProfitValues)

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
            id: '',
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
            id: purchasesValues.map((entry) => entry.id),
            label: 'purchases',
            values: [
              ...purchasesValues.map((entry) => entry.purchase),
              firstHalfTotal(purchasesValues.map((entry) => entry.purchase)),
              secondHalfTotal(purchasesValues.map((entry) => entry.purchase)),
              total(purchasesValues.map((entry) => entry.purchase)),
              '0',
            ],
          },
          {
            id: outsourcingValues.map((outsource) => outsource.id),
            label: 'outsourcingCosts',
            values: [
              ...outsourcingValues.map((outsource) => outsource.outsourcing_costs),
              firstHalfTotal(outsourcingValues.map((outsource) => outsource.outsourcing_costs)),
              secondHalfTotal(outsourcingValues.map((outsource) => outsource.outsourcing_costs)),
              total(outsourcingValues.map((outsource) => outsource.outsourcing_costs)),
              '0',
            ],
          },
          {
            id: outsourcingValues.map((productPurchaseValues) => productPurchaseValues.id),
            label: 'merchandisePurchases',
            values: [
              ...productPurchaseValues.map((productPurchaseValues) => productPurchaseValues.product_purchases),
              firstHalfTotal(
                productPurchaseValues.map((productPurchaseValues) => productPurchaseValues.product_purchases),
              ),
              secondHalfTotal(
                productPurchaseValues.map((productPurchaseValues) => productPurchaseValues.product_purchases),
              ),
              total(productPurchaseValues.map((productPurchaseValues) => productPurchaseValues.product_purchases)),
              '0',
            ],
          },
          {
            id: dispatchLaborValues.map((dispatchLaborValues) => dispatchLaborValues.id),
            label: 'temporaryStaffCost',
            values: [
              ...dispatchLaborValues.map((dispatch) => dispatch.dispatch_labor_costs),
              firstHalfTotal(dispatchLaborValues.map((dispatch) => dispatch.dispatch_labor_costs)),
              secondHalfTotal(dispatchLaborValues.map((dispatch) => dispatch.dispatch_labor_costs)),
              total(dispatchLaborValues.map((dispatch) => dispatch.dispatch_labor_costs)),
              '0',
            ],
          },
          {
            id: communicationCostValues.map((communicationCost) => communicationCost.id),
            label: 'communicationExpenses',
            values: [
              ...communicationCostValues.map((communication) => communication.communication_costs),
              firstHalfTotal(communicationCostValues.map((communication) => communication.communication_costs)),
              secondHalfTotal(communicationCostValues.map((communication) => communication.communication_costs)),
              total(communicationCostValues.map((communication) => communication.communication_costs)),
              '0',
            ],
          },
          {
            id: inProgressValues.map((inProgressValues) => inProgressValues.id),
            label: 'workinProgressExpense',
            values: [
              ...inProgressValues.map((inProgress) => inProgress.work_in_progress),
              firstHalfTotal(inProgressValues.map((inProgress) => inProgress.work_in_progress)),
              secondHalfTotal(inProgressValues.map((inProgress) => inProgress.work_in_progress)),
              total(inProgressValues.map((inProgress) => inProgress.work_in_progress)),
              '0',
            ],
          },
          {
            id: amortizationValues.map((amortization) => amortization.id),
            label: 'postingdepreciationExpense',
            values: [
              ...amortizationValues.map((amortizationValues) => amortizationValues.amortization),
              firstHalfTotal(amortizationValues.map((amortizationValues) => amortizationValues.amortization)),
              secondHalfTotal(amortizationValues.map((amortizationValues) => amortizationValues.amortization)),
              total(amortizationValues.map((amortizationValues) => amortizationValues.amortization)),
              '0',
            ],
          },
          //end of cost of sales portion
          //start for planning assign data portion
          grossProfitData, //gross profit
          {
            id: '',
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
            id: renumerationValues.map((renumerationValues) => renumerationValues.id),
            label: 'executiveCompensation',
            values: [
              ...renumerationValues.map((remuneration) => remuneration.remuneration),
              firstHalfTotal(renumerationValues.map((remuneration) => remuneration.remuneration)),
              secondHalfTotal(renumerationValues.map((remuneration) => remuneration.remuneration)),
              total(renumerationValues.map((remuneration) => remuneration.remuneration)),
              '0',
            ],
          },
          {
            id: '',
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
            id: travelExpenseValues.map((travelExpenseValues) => travelExpenseValues.id),
            label: 'bonusesAndfuelallowances',
            values: [
              ...travelExpenseValues.map((travel) => travel.travel_expenses),
              firstHalfTotal(travelExpenseValues.map((travel) => travel.travel_expenses)),
              secondHalfTotal(travelExpenseValues.map((travel) => travel.travel_expenses)),
              total(travelExpenseValues.map((travel) => travel.travel_expenses)),
              '0',
            ],
          },
          {
            id: taxesPublicChargesValues.map((taxesPublicChargesValues) => taxesPublicChargesValues.id),
            label: 'statutoryWelfareCosts',
            values: [
              ...taxesPublicChargesValues.map((taxes) => taxes.taxes_and_public_charges),
              firstHalfTotal(taxesPublicChargesValues.map((taxes) => taxes.taxes_and_public_charges)),
              secondHalfTotal(taxesPublicChargesValues.map((taxes) => taxes.taxes_and_public_charges)),
              total(taxesPublicChargesValues.map((taxes) => taxes.taxes_and_public_charges)),
              '0',
            ],
          },
          {
            id: utilitiesValues.map((utilitiesValues) => utilitiesValues.id),
            label: 'welfareExpenses',
            values: [
              ...utilitiesValues.map((utility) => utility.utilities_expenses),
              firstHalfTotal(utilitiesValues.map((utility) => utility.utilities_expenses)),
              secondHalfTotal(utilitiesValues.map((utility) => utility.utilities_expenses)),
              total(utilitiesValues.map((utility) => utility.utilities_expenses)),
              '0',
            ],
          },
          //end for planning portion
          //start for expenses portion
          {
            id: '',
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
            id: consumableValues.map((consumableValues) => consumableValues.id),
            //same value to " 給与手当 " ?
            label: 'suppliesExpense',
            values: [
              ...consumableValues.map((consumable) => consumable.consumables_expenses),
              firstHalfTotal(consumableValues.map((consumable) => consumable.consumables_expenses)),
              secondHalfTotal(consumableValues.map((consumable) => consumable.consumables_expenses)),
              total(consumableValues.map((consumable) => consumable.consumables_expenses)),
              '0',
            ],
          },
          {
            id: rentValues.map((rentValues) => rentValues.id),
            label: 'rentExpense',
            values: [
              ...rentValues.map((rent) => rent.rent),
              firstHalfTotal(rentValues.map((rent) => rent.rent)),
              secondHalfTotal(rentValues.map((rent) => rent.rent)),
              total(rentValues.map((rent) => rent.rent)),
              '0',
            ],
          },
          {
            id: paymentFeeValues.map((paymentFeeValues) => paymentFeeValues.id),
            label: 'insurancePremiums',
            values: [
              ...paymentFeeValues.map((payment) => payment.payment_fees),
              firstHalfTotal(paymentFeeValues.map((payment) => payment.payment_fees)),
              secondHalfTotal(paymentFeeValues.map((payment) => payment.payment_fees)),
              total(paymentFeeValues.map((payment) => payment.payment_fees)),
              '0',
            ],
          },
          {
            id: taxesPublicChargesValues.map((taxesPublicChargesValues) => taxesPublicChargesValues.id),
            //same "法定福利費 "
            label: 'taxesAndpublicdues',
            values: [
              ...taxesPublicChargesValues.map((taxes) => taxes.taxes_and_public_charges),
              firstHalfTotal(taxesPublicChargesValues.map((taxes) => taxes.taxes_and_public_charges)),
              secondHalfTotal(taxesPublicChargesValues.map((taxes) => taxes.taxes_and_public_charges)),
              total(taxesPublicChargesValues.map((taxes) => taxes.taxes_and_public_charges)),
              '0',
            ],
            // values: [
            //   ...taxesPublicChargesValues,
            //   firstHalfTotal(taxesPublicChargesValues),
            //   secondHalfTotal(taxesPublicChargesValues),
            //   total(taxesPublicChargesValues),
            //   // `${(total(taxesPublicChargesValues) / total(costOfSalesValues) * 100).toFixed(2)}%`,
            //   '0',
            // ],
          },
          {
            id: depreciationExpensesValues.map((depreciationExpensesValues) => depreciationExpensesValues.id),
            label: 'depreciationExpense',
            values: [
              ...depreciationExpensesValues.map((depreciation) => depreciation.depreciation_expenses),
              firstHalfTotal(depreciationExpensesValues.map((depreciation) => depreciation.depreciation_expenses)),
              secondHalfTotal(depreciationExpensesValues.map((depreciation) => depreciation.depreciation_expenses)),
              total(depreciationExpensesValues.map((depreciation) => depreciation.depreciation_expenses)),
              '0',
            ],
          },
          {
            id: travelExpenseValues.map((travelExpenseValues) => travelExpenseValues.id),
            label: 'travelAndtransportationexpenses',
            values: [
              ...travelExpenseValues.map((travel) => travel.travel_expenses),
              firstHalfTotal(travelExpenseValues.map((travel) => travel.travel_expenses)),
              secondHalfTotal(travelExpenseValues.map((travel) => travel.travel_expenses)),
              total(travelExpenseValues.map((travel) => travel.travel_expenses)),
              '0',
            ],
          },
          {
            id: communicationExpenseValues.map((communicationExpenseValues) => communicationExpenseValues.id),
            label: 'communicationExpenses',
            values: [
              ...communicationExpenseValues.map((communication) => communication.communication_expenses),
              firstHalfTotal(communicationExpenseValues.map((communication) => communication.communication_expenses)),
              secondHalfTotal(communicationExpenseValues.map((communication) => communication.communication_expenses)),
              total(communicationExpenseValues.map((communication) => communication.communication_expenses)),
              '0',
            ],
          },
          {
            id: utilitiesValues.map((utilitiesValues) => utilitiesValues.id),
            label: 'utilities',
            values: [
              ...utilitiesValues.map((utility) => utility.utilities_expenses),
              firstHalfTotal(utilitiesValues.map((utility) => utility.utilities_expenses)),
              secondHalfTotal(utilitiesValues.map((utility) => utility.utilities_expenses)),
              total(utilitiesValues.map((utility) => utility.utilities_expenses)),
              '0',
            ],
          },
          {
            id: advertisingExpenseValues.map((advertisingExpenseValues) => advertisingExpenseValues.id),
            label: 'paymentFees',
            values: [
              ...advertisingExpenseValues.map((advertising) => advertising.advertising_expenses),
              firstHalfTotal(advertisingExpenseValues.map((advertising) => advertising.advertising_expenses)),
              secondHalfTotal(advertisingExpenseValues.map((advertising) => advertising.advertising_expenses)),
              total(advertisingExpenseValues.map((advertising) => advertising.advertising_expenses)),
              '0',
            ],
          },
          {
            id: advertisingExpenseValues.map((advertisingExpenseValues) => advertisingExpenseValues.id),
            label: 'paymentFees',
            values: [
              ...advertisingExpenseValues.map((advertising) => advertising.advertising_expenses),
              firstHalfTotal(advertisingExpenseValues.map((advertising) => advertising.advertising_expenses)),
              secondHalfTotal(advertisingExpenseValues.map((advertising) => advertising.advertising_expenses)),
              total(advertisingExpenseValues.map((advertising) => advertising.advertising_expenses)),
              '0',
            ],
          },
          {
            id: entertainmentExpenseValues.map((entertainmentExpenseValues) => entertainmentExpenseValues.id),
            label: 'entertainmentAndhospitalityexpenses',
            values: [
              ...entertainmentExpenseValues.map((entertainment) => entertainment.entertainment_expenses),
              firstHalfTotal(entertainmentExpenseValues.map((entertainment) => entertainment.entertainment_expenses)),
              secondHalfTotal(entertainmentExpenseValues.map((entertainment) => entertainment.entertainment_expenses)),
              total(entertainmentExpenseValues.map((entertainment) => entertainment.entertainment_expenses)),
              '0',
            ],
          },
          {
            id: paymentFeeValues.map((paymentFeeValues) => paymentFeeValues.id),
            label: 'paymentForcompensation',
            values: [
              ...paymentFeeValues.map((payment) => payment.payment_fees),
              firstHalfTotal(paymentFeeValues.map((payment) => payment.payment_fees)),
              secondHalfTotal(paymentFeeValues.map((payment) => payment.payment_fees)),
              total(paymentFeeValues.map((payment) => payment.payment_fees)),
              '0',
            ],
          },
          {
            id: '',
            //add 人件費 + 経費 field
            label: 'sellingAndgeneraladministrativeexpenses',
            // values: Array(16).fill(0),
            values: [
              ...generalExpenseValues.map((item) => item.generalTotal),
              firstHalfTotal(generalExpenseValues.map((item) => item.generalTotal)),
              secondHalfTotal(generalExpenseValues.map((item) => item.generalTotal)),
              total(generalExpenseValues.map((item) => item.generalTotal)),
              '0',
            ],
          },
          //Operating income 営業利益 ①
          {
            id: '',
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
            id: '',
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
            id: '',
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
            id: '',
            label: 'ordinaryProfit',
            values: [
              ...ordinaryProfitValues,
              firstHalfTotal(ordinaryProfitValues),
              secondHalfTotal(ordinaryProfitValues),
              total(ordinaryProfitValues),
              '0',
            ],
          },
          {
            id: '',
            label: 'cumulativeOrdinaryProfit',
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
  ]


  const editableLabels = [
    'purchases',
    'outsourcingCosts',
    'merchandisePurchases',
    'temporaryStaffCost',
    'communicationExpenses',
    'workinProgressExpense',
    'postingdepreciationExpense',
    'executiveCompensation',
    'bonusesAndfuelallowances',
    'welfareExpenses',
    'statutoryWelfareCosts',
    'suppliesExpense',
    'rentExpense',
    'taxesAndpublicdues',
    'depreciationExpense',
    'travelAndtransportationexpenses',
    'utilities',
    'paymentFees',
    'paymentFees',
    'entertainmentAndhospitalityexpenses',
    'paymentForcompensation',
  ]

  const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]
  const halfYears = ['上期計', '下期計', '合計']
  const [editableData, setEditableData] = useState(data)
  const isRowEditable = (label) => editableLabels.includes(label)

  const handleInputChange = (rowIndex, valueIndex, e) => {
    const updatedData = [...data]

    if (!updatedData[rowIndex] || !updatedData[rowIndex].values) {
      console.error(`Row at index ${rowIndex} is undefined or missing 'values'`)
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

    try {
      // const response = await axios.put('http://127.0.0.1:8000/api/planning/update/', changedData, {
        const response = await axios.put('http://54.178.202.58:8000/api/planning/update/',  changedData ,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      alert('Sucessfully updated')
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.location.href = '/login'
      } else {
        console.error('There was an error updating the planning data!', error)
      }
    }
  }


const handleSubmit = (event) => {
  event.preventDefault()

  const cleanedData = editableData
    .map((row) => {
      // Ensure both id and values are arrays
      const idArray = Array.isArray(row.id) ? row.id : []
      const valuesArray = Array.isArray(row.values) ? row.values : []

      // Filter out null or 0 values
      const cleanedIds = idArray.filter((id, index) => id !== null && valuesArray[index] !== 0)
      const cleanedValues = valuesArray.filter((value) => value !== 0)

      // Only include rows with valid ids and values
      if (cleanedIds.length > 0 && cleanedValues.length > 0) {
        return {
          id: cleanedIds,
          label: row.label,
          values: cleanedValues,
        }
      }
      return null
    })
    .filter((row) => row !== null)

  // console.log('Cleaned Data:', cleanedData)
  saveData(cleanedData)
}

  return (
    <div className='table-planning-container'>
      <div className='table-planning'>
        <table>
          <thead>
            <tr>
              <th>{translate('item', language)}</th>
              {months.map((month, index) => (
                <th key={index} className={month >= 10 || month <= 3 ? 'light-txt' : 'orange-txt'}>
                  {month}月
                </th>
              ))}
              {halfYears.map((halfYear, index) => (
                <th key={index} className='sky-txt'>
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
                <th key={index} className=''>
                  <th key={index} className=''>{translate('planning', language)}</th>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td className={noIndentLabels.includes(item.label) ? 'no-indent' : 'indented-label'}>{translate(item.label, language)}</td>
                {item.values.map((value, valueIndex) => (
                  <td key={valueIndex}>
                    {isRowEditable(item.label) && valueIndex < 12 ? (
                      <input className='input_tag' type='text' value={value} onChange={(e) => handleInputChange(index, valueIndex, e)} />
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
          <button className='edit_submit_btn' onClick={handleSubmit}>更新する</button>
        </div>
      </div>
    </div>
  )
}

export default EditTablePlanning
