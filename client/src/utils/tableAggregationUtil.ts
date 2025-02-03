
// export const aggregatedData = (response: any) => {
  // console.log('response', response)

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

  // const aggregatedExpensesData = response.expenses.reduce(generalAggregate, {})

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


  // EMPLOYEE EXPENSES
// const aggregatedEmployeeExpensesData = response.employee_expenses.reduce((acc, item) => {
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

  // return {
  //   aggregated_expenses: aggregatedExpensesData,
  //   aggregated_cost_of_sales: aggregatedCostOfSaleData,
  //   aggregated_employee_expenses: aggregatedEmployeeExpensesData,
  // }
// }
