
import { months } from "../constants"
import { sumValues } from "./helperFunctionsUtil"

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

// EXPENSES
export const aggregatedExpensesFunction = (expenses) => {
  return expenses.reduce((acc, item) => {
      return generalAggregate(acc, item)
  }, {})
}

export const expensesTotalsFunction = (expensesData, detailedResponse = false ) => {

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
    
    const totals =
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
    
        if (!detailedResponse) {
          return totals
        } else {
          return {
            month,
            totals,
            consumables,
            rent,
            taxAndPublicCharge,
            depreciation,
            travelExpense,
            communicationExpense,
            utilitiesExpense,
            transactionFee,
            advertisingExpense,
            entertainmentExpense,
            professionalServiceFee
          }
        }
  })
}

// USED FOR GRAPH / REDUX
export const monthlyTotalsExpensesFunction = (expenses) => {
  return expenses.map((item) => {
    const object = {
      month: item.month,
      year: item.year,
      total:
        parseFloat(item.consumable_expense) +
        parseFloat(item.rent_expense) +
        parseFloat(item.tax_and_public_charge) +
        parseFloat(item.depreciation_expense) +
        parseFloat(item.travel_expense) +
        parseFloat(item.communication_expense) +
        parseFloat(item.utilities_expense) +
        parseFloat(item.transaction_fee) +
        parseFloat(item.advertising_expense) +
        parseFloat(item.entertainment_expense) +
        parseFloat(item.professional_service_fee),
    }

    return object
  })
}

// COST OF SALES
export const aggregatedCostOfSalesFunction = (cost_of_sales) => {
  return cost_of_sales.reduce((acc, item) => {
    return generalAggregate(acc,item)
  }, {})
}

export const costOfSalesTotalsFunction = (aggregatedCostOfSalesData, detailedResponse = false) => {
  return months.map((month) => {
    const purchases = Number(aggregatedCostOfSalesData[month]?.purchase) || 0
    const outsourcing = Number(aggregatedCostOfSalesData[month]?.outsourcing_expense) || 0
    const productPurchase = Number(aggregatedCostOfSalesData[month]?.product_purchase) || 0
    const dispatchLabor = Number(aggregatedCostOfSalesData[month]?.dispatch_labor_expense) || 0
    const communication = Number(aggregatedCostOfSalesData[month]?.communication_expense) || 0
    const workInProgress = Number(aggregatedCostOfSalesData[month]?.work_in_progress_expense) || 0
    const amortization = Number(aggregatedCostOfSalesData[month]?.amortization_expense) || 0

    const totalValue =
      purchases + outsourcing + productPurchase + dispatchLabor + communication + workInProgress + amortization
    
    if (!detailedResponse) {
      return totalValue
    } else {
      return {month, totalValue, purchases, outsourcing, productPurchase, dispatchLabor, communication, workInProgress, amortization}
    }
  })
}

// USED FOR GRAPH / REDUX
export const monthlyTotalsCostOfSalesFunction = (costOfSales) => {
  return costOfSales.map((item) => {
    const object = {
      month: item.month,
      year: item.year,
      total:
        parseFloat(item.purchase) +
        parseFloat(item.outsourcing_expense) +
        parseFloat(item.product_purchase) +
        parseFloat(item.dispatch_labor_expense) +
        parseFloat(item.communication_expense) +
        parseFloat(item.work_in_progress_expense) +
        parseFloat(item.amortization_expense),
    }

    return object
  })
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
        totalSalary: 0,
        totalExecutiveRemuneration: 0,
        totalBonusAndFuel: 0,
        totalStatutoryWelfare: 0,
        totalWelfare: 0,
        totalInsurancePremium: 0,
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
    acc[month].totalSalary += parseNumber(rest.salary)
    acc[month].totalExecutiveRemuneration += parseNumber(rest.executive_remuneration)
    acc[month].totalBonusAndFuel += parseNumber(rest.bonus_and_fuel_allowance)
    acc[month].totalStatutoryWelfare += parseNumber(rest.statutory_welfare_expense)
    acc[month].totalWelfare += parseNumber(rest.welfare_expense)
    acc[month].totalInsurancePremium += parseNumber(rest.insurance_premium)

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

// Array of total per month [] (just number values. not properly assigned months)
export const employeeExpensesTotalsFunction = (employeeExpensesdata, detailedResponse = false) => {
  return months.map((month) => {
    const executiveRemuneration = Number(employeeExpensesdata[month]?.totalExecutiveRemuneration) || 0
    const salary = Number(employeeExpensesdata[month]?.totalSalary) || 0
    const bonusAndFuelAllowance = Number(employeeExpensesdata[month]?.totalBonusAndFuel) || 0
    const statutoryWelfareExpense = Number(employeeExpensesdata[month]?.totalStatutoryWelfare) || 0
    const welfareExpense = Number(employeeExpensesdata[month]?.totalWelfare) || 0
    const insurancePremium = Number(employeeExpensesdata[month]?.totalInsurancePremium) || 0
    
    const totals =
      executiveRemuneration +
      salary +
      bonusAndFuelAllowance +
      statutoryWelfareExpense +
      welfareExpense +
      insurancePremium
      
      if (!detailedResponse) {
          return totals
        } else {
          return {
            month,
            totals,
            executiveRemuneration,
            salary,
            bonusAndFuelAllowance,
            statutoryWelfareExpense,
            welfareExpense,
            insurancePremium
          }
        }
  })
}

// USED FOR GRAPH / REDUX
export const monthlyTotalsEmployeeExpenseFunction = (employeeExpense) => {
  return employeeExpense.map((item) => {
    const object = {
      month: item.month,
      year: item.year,
      total:
        (parseFloat(item.salary ?? 0) || 0) +
        (parseFloat(item.executive_remuneration ?? 0) || 0) +
        parseFloat(item.statutory_welfare_expense) +
        parseFloat(item.welfare_expense) +
        parseFloat(item.insurance_premium) 
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

// EMPLOYEE EXPENSES FUNCTION FOR EMPLOYEE EXPENSES SLICE 
// REFACTOR: I FEEL THIS COULD BE COMBINED WITH ALREADY EXISTING FUNCTION)
export const employeeExpenseYearlyTotals = (employeeExpenses) => {
  const salaryTotal = sumValues(employeeExpenses.map((emp) => Number(emp.salary) || 0))
  const executiveRemunerationTotal = sumValues(employeeExpenses.map((emp) => Number(emp.executive_remuneration) || 0))
  const insurancePremiumTotal = sumValues(employeeExpenses.map((emp) => Number(emp.insurance_premium) || 0))
  const welfareExpenseTotal = sumValues(employeeExpenses.map((emp) => Number(emp.welfare_expense) || 0))
  const statutoryWelfareTotal = sumValues(employeeExpenses.map((emp) => Number(emp.statutory_welfare_expense) || 0))
  const bonusAndFuelTotal = sumValues(employeeExpenses.map((emp) => Number(emp.bonus_and_fuel_allowance) || 0))

  const combinedTotal =
    salaryTotal +
    executiveRemunerationTotal +
    insurancePremiumTotal +
    welfareExpenseTotal +
    statutoryWelfareTotal +
    bonusAndFuelTotal

  const totals = {
    salaryTotal: salaryTotal,
    executiveRemunerationTotal: executiveRemunerationTotal,
    insurancePremiumTotal: insurancePremiumTotal,
    welfareExpenseTotal: welfareExpenseTotal,
    statutoryWelfareTotal: statutoryWelfareTotal,
    bonusAndFuelTotal: bonusAndFuelTotal,
    combinedTotal: combinedTotal,
  }

  return totals
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