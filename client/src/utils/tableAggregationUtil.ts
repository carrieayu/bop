
// export const aggregatedData = (response: any) => {
  // console.log('response', response)

import { months } from "../constants"

  // const generalAggregate = (acc, item) => {
  //   const { month, ...values } = item
  //   if (!acc[month]) {
  //     acc[month] = { month, ...values } // Include month in the object
  //   } else {
  //     Object.keys(values).forEach((key) => {
  //       acc[month][key] += values[key] // Aggregating values
  //     })
  //   }
  //   return acc
  // }

// EXPENSES
export const aggregatedExpensesFunction = (expenses) => {
  return expenses.reduce((acc, item) => {
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
}

export const expensesTotalsFunction = (months, expensesData) => {

  return months.map((month) => {
    const consumables = Number(expensesData[month]?.consumable_expense) || 0
    const rent = Number(expensesData[month]?.rent_expense) || 0
    const taxAndPublicCharge = Number(expensesData[month]?.tax_and_public_charge) || 0
    const depreciation = Number(expensesData[month]?.depreciation_expense) || 0
    const travelExpense = Number(expensesData[month]?.travel_expense) || 0
    const communicationExpense = Number(expensesData[month]?.communication_expense) || 0
    const utilitiesExpense = Number(expensesData[month]?.utilities_expense) || 0
    const transactionFee = Number(expensesData[month]?.transaction_fee) || 0
    const advertisingExpense = Number(expensesData[month]?.advertising_expense) || 0
    const entertainmentExpense = Number(expensesData[month]?.entertainment_expense) || 0
    const professionalServiceFee = Number(expensesData[month]?.professional_service_fee) || 0
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
}

// COST OF SALES
export const aggregatedCostOfSalesFunction = (cost_of_sales) => {
  return cost_of_sales.reduce((acc, item) => {
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
}

export const costOfSalesTotalsFunction = (months, aggregatedCostOfSalesData) => {
  return months.map((month) => {
    const purchases = Number(aggregatedCostOfSalesData[month]?.purchase) || 0
    const outsourcing = Number(aggregatedCostOfSalesData[month]?.outsourcing_expense) || 0
    const productPurchase = Number(aggregatedCostOfSalesData[month]?.product_purchase) || 0
    const dispatchLabor = Number(aggregatedCostOfSalesData[month]?.dispatch_labor_expense) || 0
    const communication = Number(aggregatedCostOfSalesData[month]?.communication_expense) || 0
    const workInProgress = Number(aggregatedCostOfSalesData[month]?.work_in_progress_expense) || 0
    const amortization = Number(aggregatedCostOfSalesData[month]?.amortization_expense) || 0
    return purchases + outsourcing + productPurchase + dispatchLabor + communication + workInProgress + amortization
  })
}

// EMPLOYEE EXPENSES
export const aggregatedEmployeeExpensesFunction = (employee_expenses) => {
  return employee_expenses.reduce((acc, item) => {

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
}

export const employeeExpensesTotalsFunction = (months, employeeExpensesdata) => {
  return months.map((month) => {
    const executiveRemuneration = Number(employeeExpensesdata[month]?.totalExecutiveRemuneration) || 0
    const salary = Number(employeeExpensesdata[month]?.totalSalary) || 0
    const bonusAndFuelAllowance = Number(employeeExpensesdata[month]?.totalBonusAndFuel) || 0
    const statutoryWelfareExpense = Number(employeeExpensesdata[month]?.totalStatutoryWelfare) || 0
    const welfareExpense = Number(employeeExpensesdata[month]?.totalWelfare) || 0
    const insurancePremium = Number(employeeExpensesdata[month]?.totalInsurancePremium) || 0
    return (
      executiveRemuneration +
      salary +
      bonusAndFuelAllowance +
      statutoryWelfareExpense +
      welfareExpense +
      insurancePremium
    )
  })
}

// PROJECTS
export const aggregatedProjectsFunction = (projects) => {
  return projects.reduce((acc, item) => {
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
}


  // return {
  //   aggregated_expenses: aggregatedExpensesData,
  //   aggregated_cost_of_sales: aggregatedCostOfSaleData,
  //   aggregated_employee_expenses: aggregatedEmployeeExpensesData,
  // }
// }
