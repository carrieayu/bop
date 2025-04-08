import { months } from "../constants"
import { fields } from "./inputFieldConfigurations"

// Get Relevant Field Names for (expenses, costOfSales, employeeExpenses, projects)
const expenseFinancialFields = fields.expenses.filter((item) => item.isFinancial === true)
const costOfSalesFinancialFields = fields.costOfSales.filter((item) => item.isFinancial === true)
const employeeFinancialFields = fields.employees.filter((item) => item.isFinancial === true)
const projectFinancialFields = fields.projects.filter((item) => item.isFinancial === true)

// HELPER FUNCTIONS
const generalAggregate = (acc, item) => {
  const { month, ...values } = item
  if (!acc[month]) {
    acc[month] = { month, ...values } // Include month in the object
  } else {
    Object.keys(values).forEach((key) => {
      acc[month][key] += values[key] // Aggregating values
    })
  }
  return acc
}

const getMonthlyTotals = (data, financialFields, detailedResponse = false, from ="") => {
  return months.map((month) => {

    const dataForMonth = data[month] || []

    const totalsObject = financialFields.reduce((acc, { field, fieldName }) => {
      acc[fieldName] = Number(dataForMonth[field] || 0)
      return acc
    }, {})

    const totals = Object.values(totalsObject).reduce((sum: any, value: any) => sum + value, 0)
    
    return detailedResponse ? { month, totals, ...totalsObject, from } : totals
  })
}

const prepareGraphData = (data, financialFields) => {
  
  return data.map((item) => {
    const total = financialFields.reduce((sum, { field }) => {
      return sum + parseFloat(item[field] || 0)
    }, 0)

    return {
      month: item.month,
      year: item.year,
      total
    }
  })
}

// EXPENSES
export const aggregatedExpensesFunction = (expenses) => {
  return expenses.reduce((acc, item) => {
    return generalAggregate(acc, item)
  }, {})
}

export const getMonthlyExpensesTotals = (expensesData, detailedResponse = false, from = '') =>
  getMonthlyTotals(expensesData, expenseFinancialFields, detailedResponse, from)


// USED FOR GRAPH / REDUX
export const getGraphDataForExpenses = (expenses) => {
  return prepareGraphData(expenses, expenseFinancialFields)
}

// COST OF SALES
export const aggregatedCostOfSalesFunction = (cost_of_sales) => {
  return cost_of_sales.reduce((acc, item) => {
    return generalAggregate(acc,item)
  }, {})
}


export const getCostOfSalesMonthlyTotals = (costOfSalesData, detailedResponse = false) =>
  getMonthlyTotals(costOfSalesData, costOfSalesFinancialFields, detailedResponse)


// USED FOR GRAPH / REDUX
export const getGraphDataForCostOfSales = (costOfSales) => {
    return prepareGraphData(costOfSales, costOfSalesFinancialFields)
}

// EMPLOYEE EXPENSES
// Uses employee-expenses/list
export const aggregatedEmployeeExpensesFunctionDashboard = (employee_expenses) => {
  const parseNumber = (value) => Number(value) || 0

  return employee_expenses.reduce((acc, item) => {
    const { month, year, employee_expense_id, ...rest } = item

    if (!acc[month]) {
      acc[month] = {
        month,
        year,
        employee_expense_id,
        employees: [],
        projects: [],
        salary: 0, // totals for month
        executiveRemuneration: 0, // totals for month
        bonusAndFuelAllowance: 0, // totals for month
        statutoryWelfareExpense: 0, // totals for month
        welfareExpense: 0, // totals for month
        insurancePremium: 0, // totals for month
      }
    }

    // Add employee and project details
    acc[month].employees.push({
      employee_id: rest.employee_id,
      employee_type: rest.employee_type,
      first_name: rest.first_name,
      last_name: rest.last_name,
      salary: rest.salary,
      executive_remuneration: rest.executive_remuneration,
      bonus_and_fuel_allowance: rest.bonus_and_fuel_allowance,
      statutory_welfare_expense: rest.statutory_welfare_expense,
      welfare_expense: rest.welfare_expense,
      insurance_premium: rest.insurance_premium,
    })

    acc[month].projects.push({
      project_id: rest.project_id,
      project_name: rest.project_name,
      client_name: rest.client_name,
      business_division_name: rest.business_division_name,
    })
    
    // Aggregate totals using parseNumber helper
    employeeFinancialFields.forEach(({ field, fieldName }) => {
      acc[month][fieldName] += parseNumber(rest[field])
    })
    
    return acc
  }, {})
}

// uses 'planningList' which strudtures employee expenses slightly differently to employee-expenes/list
export const aggregatedEmployeeExpensesFunction = (employee_expenses) => {
  return employee_expenses.reduce((acc, item) => {

    const { month, employee, project, ...values } = item // Destructure employee and project

    // Initialize month if not already present
    if (!acc[month]) {
      acc[month] = {
        month,
        employees: [employee], // Store employees as an array
        projects: [project], // Store projects as an array
        salary: Number(employee.salary) || 0, // Initialize totalSalary with the first employee's salary
        executiveRemuneration: Number(employee.executive_remuneration) || 0,
        bonusAndFuelAllowance: Number(employee.bonus_and_fuel_allowance) || 0,
        statutoryWelfareExpense: Number(employee.statutory_welfare_expense) || 0,
        welfareExpense: Number(employee.welfare_expense) || 0,
        insurancePremium: Number(employee.insurance_premium) || 0,
        ...values,
      }
    } else {
      // Add the new employee and project objects to the array
      acc[month].employees.push(employee)
      acc[month].projects.push(project)
      // Add the employee's salary to the total
      acc[month].salary += Number(employee.salary) || 0
      acc[month].executiveRemuneration += Number(employee.executive_remuneration) || 0
      acc[month].bonusAndFuelAllowance += Number(employee.bonus_and_fuel_allowance) || 0
      acc[month].statutoryWelfareExpense += Number(employee.statutory_welfare_expense) || 0
      acc[month].welfareExpense += Number(employee.welfare_expense) || 0
      acc[month].insurancePremium += Number(employee.insurance_premium) || 0

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


// Array of total per month [] (just number values. not properly assigned months)
export const employeeExpensesTotalsFunction = (employeeExpensesdata, detailedResponse = false) => {
  return months.map((month) => {
    const dataForMonth = employeeExpensesdata[month] // Access month data
    // In case data for the month doesn't exist
    if (!dataForMonth) {
      return detailedResponse ? { month, totals: 0 } : 0
    }

    const employeeExpenses = employeeFinancialFields.reduce((acc, { fieldName }) => {
      acc[fieldName] = Number(dataForMonth[fieldName] || 0) // Convert strings to numbers
      return acc
    }, {})

    const totals = Object.values(employeeExpenses).reduce((sum:any, value:any) => sum + value, 0)

    const detailedObject = { month, totals, ...employeeExpenses }

    return detailedResponse ? detailedObject : totals
  })
}

// USED FOR GRAPH 
export const monthlyTotalsEmployeeExpenseFunction = (employeeExpense) => {
  return employeeExpense.map((item) => {
    const total = employeeFinancialFields.reduce((sum, {field}) => {
      return sum + parseFloat(item[field] || 0)
    },0)

    const object = {
      month: item.month,
      year: item.year,
      total
    }
    return object
  })
}
// PROJECTS

export const aggregatedProjectsFunction = (projects) => {
  // WIP: I think this needs fixing: returns odd values for id and month. (are they even necessary?)  
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

// GROSS PROFIT
// DELETE?? NOW USING "calculateMonthlyGrossProfit" and converting results into value Array.

export const grossProfitFunction = (salesRevenue, costOfSalesValues) => {
  return months.map((month, index) => {
    const totalSales = salesRevenue[index] // Get the salesRevenue  for the current month
    const totalCostOfSales = costOfSalesValues[index] // Get the cost of sales for the current month
    const grossProfit = totalSales - totalCostOfSales // Calculate gross profit
    return grossProfit
  })
}

// SELLING AND GENERAL ADMIN EXPENSES
export const sellingAndGeneralAdminExpenseFunction = (employeeExpensesValues, expensesValues) => {
  return months.map((month, index) => {
    const totalEmployeeExpense = employeeExpensesValues[index] // Get the total employee expense for the current month
    const totalExpense = expensesValues[index] // Get the total expense for the current month
    const sellingAndGeneralAdminExpense = totalEmployeeExpense + totalExpense // Calculation for Selling and General Admin Expense
    return sellingAndGeneralAdminExpense
  })
}
// OPERATING INCOME
export const operatingIncomeFunction = (grossProfitValues, sellingAndGeneralAdminExpenseValues) => {
  return months.map((month, index) => {
    const grossProfit = grossProfitValues[index] // Get the gross profit for the current month
    const sellingAndGeneralAdmin = sellingAndGeneralAdminExpenseValues[index] // Get the Selling and General Admin Expense for the current month
    const operatingIncomeValue = grossProfit - sellingAndGeneralAdmin // Calculate operating income value
    return operatingIncomeValue 
  })
}

// ORDINARY PROFIT
export const ordinaryProfitFunction = (
  operatingIncomeValues,
  nonOperatingIncomeValues,
  nonOperatingExpensesValues,
) => {
  return months.map((month, index) => {
    const operatingIncome = operatingIncomeValues[index]
    const nonOperatingIncome = nonOperatingIncomeValues[index]
    const totalOperating = operatingIncome + nonOperatingIncome
    const totalOrdinaryIncome = totalOperating - nonOperatingExpensesValues[index]

    return totalOrdinaryIncome
  })
}

// OTHER
export const mapValue = (key, data) => {
  return months.map((month) => data[month]?.[key] || 0) // return the mapped values properly
}


// Extract year, month and the remaining values from nested "projects" object in side "project results"
export const filterListMonthAndYear = (arr) => {
  // Step 1: Filter the projects that include 'project_sales_result_id'
  const filteredProjects = arr.filter((project) => Object.keys(project).includes('project_sales_result_id'))

  const updated = filteredProjects.map((project) => {
    const { year, month } = project.projects
    const transformedProject = { ...project, year, month }

    return transformedProject
  })
  return updated
}