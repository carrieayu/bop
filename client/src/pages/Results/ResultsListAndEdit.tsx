import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { UnknownAction } from '@reduxjs/toolkit'
import { fetchAllClientData } from '../../reducers/table/tableSlice'
import Sidebar from '../../components/Sidebar/Sidebar'
import Btn from '../../components/Button/Button'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import EditTableResults from '../../components/TableResults/EditTableResults'
import { TableResultsB } from '../../components/TableResults/TableResultB'
import TableResults from '../../components/TableResults/TableResultA'
import { RxHamburgerMenu } from 'react-icons/rx'
import { getResultsA } from '../../api/ResultsEndpoint/GetResultsA'
import * as XLSX from 'xlsx'

const header = ['計画']
const smallDate = ['2022/24月', '2022/25月', '2022/26月']
const dates = ['04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月', '1月', '2月', '3月']

const ResultsListAndEdit = () => {
  const [tableList, setTableList] = useState<any>([])
  const dispatch = useDispatch()
  const [currentPage, setCurrentPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const totalPages = Math.ceil(tableList?.length / rowsPerPage)
  const select = [5, 10, 100]
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('/results')
  const [isSwitchActive, setIsSwitchActive] = useState(false)
  const [isThousandYenChecked, setIsThousandYenChecked] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const token = localStorage.getItem('accessToken')
  const [isEditing, setIsEditing] = useState(false)
  const [initialLanguage, setInitialLanguage] = useState(language)
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)
  const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]
  const monthsNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const additionalHeaders = ['H1', 'H2', 'Year Total', 'Sales%']
  const toggleModal = () => {
    setIsCSVModalOpen(!isCSVModalOpen)
  }

  const downloadSVG = () => {
    
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
          const aggregatedData = {}
          let totalAnnualExecutive = 0
          let totalAnnualSalary = 0
          let totalBonusAndFuelAllowance = 0
          let totalWelfareExpense = 0
          let totalStatutoryWelfareExpense = 0
          let totalInsurancePremium = 0

          employeesResults.forEach((employee) => {
            totalAnnualExecutive += employee.executive_renumeration
            totalAnnualSalary += employee.salary
            totalBonusAndFuelAllowance += employee.bonus_and_fuel_allowance
            totalWelfareExpense += parseFloat(employee.welfare_expense) 
            totalStatutoryWelfareExpense += parseFloat(employee.statutory_welfare_expense)
            totalInsurancePremium += parseFloat(employee.insurance_premium)
          })

          const monthlyExecutive = totalAnnualExecutive / 12
          const monthlySalary = totalAnnualSalary / 12
          const yearlyBonusAndFuelAllowance = totalBonusAndFuelAllowance
          const monthlyWelfareExpense = (totalAnnualSalary * 0.0048) / 12
          const monthStatutoryWelfareExpense = (totalAnnualSalary * 0.0048) / 12
          const monthlyInsurancePremium = totalInsurancePremium / 12

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
          const { month, employee, project, ...values } = item 

          if (!acc[month]) {
            acc[month] = {
              month,
              employees: [employee], 
              projects: [project], 
              totalSalary: employee.salary || 0, 
              ...values,
            }
          } else {
            acc[month].employees.push(employee)
            acc[month].projects.push(project)

            acc[month].totalSalary += employee.salary || 0

            Object.keys(values).forEach((key) => {
              if (typeof values[key] === 'number') {
                acc[month][key] += values[key]
              } else if (typeof values[key] === 'string') {
                acc[month][key] = values[key] 
              }
            })
          }
          return acc
        }, {})
        const aggregatedPlanningProjectData = response.project_sales_results.reduce((acc, item) => {
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

        // SALES REVENUE
        const salesValues = months.map((month) => aggregatedPlanningProjectData[month]?.sales_revenue || 0)

        //COST OF SALES
        const costOfSalesValues = months.map((month) => {
          const purchases = aggregatedData[month]?.purchase || 0
          const outsourcing = aggregatedData[month]?.outsourcing_expense || 0
          const productPurchase = aggregatedData[month]?.product_purchase || 0
          const dispatchLabor = aggregatedData[month]?.dispatch_labor_expense || 0
          const communicationCost = aggregatedData[month]?.communication_expense || 0
          const workInProgress = aggregatedData[month]?.work_in_progress_expense || 0
          const amortization = aggregatedData[month]?.amortization_expense || 0
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
          const totalSales = salesValues[index] 
          const totalCostOfSales = costOfSalesValues[index] 
          const grossProfit = totalSales - totalCostOfSales 
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
          return month === 12 ? totalBonusAndFuelAllowance : 0 
        })
        const statutoryWelfareExpenseValues = months.map((month) => result[month]?.statutory_welfare_expense || 0)
        const welfareExpenseValues = months.map((month) => result[month]?.welfare_expense || 0)
        const insurancePremiumsValues = months.map((month) => result[month]?.insurance_premium || 0)

        // EXPENSES
        const expenseValues = months.map((month) => {
          const consumables = aggregatedExpensesData[month]?.consumable_expense || 0
          const rent = aggregatedExpensesData[month]?.rent_expense || 0
          const taxAndPublicCharge = aggregatedExpensesData[month]?.tax_and_public_charge || 0
          const depreciation = aggregatedExpensesData[month]?.depreciation_expense || 0
          const travel_expense = aggregatedExpensesData[month]?.travel_expense || 0
          const communication_expense = aggregatedExpensesData[month]?.communication_expense || 0
          const utilities_expense = aggregatedExpensesData[month]?.utilities_expense || 0
          const transaction_fee = aggregatedExpensesData[month]?.transaction_fee || 0
          const advertising_expense = aggregatedExpensesData[month]?.advertising_expense || 0
          const entertainment_expense = aggregatedExpensesData[month]?.entertainment_expense || 0
          const professional_service_fee = aggregatedExpensesData[month]?.professional_service_fee || 0
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
          const total_employee_expense = employeeExpensesValues[index] 
          const total_expense = expenseValues[index] 
          const sellingAndGeneralAdminExpense = total_employee_expense + total_expense 
          return sellingAndGeneralAdminExpense
        })

        // OPERATING INCOME
        const operatingIncomeValues = months.map((month, index) => {
          const gross_profit = grossProfitValues[index] 
          const selling_and_general_admin = sellingAndGeneralAdminExpenseValues[index] 
          const operating_income_value = gross_profit - selling_and_general_admin 
          return operating_income_value
        })
        //NoN Operating Income & Expense
        const nonOperatingIncomeValues = months.map(
          (month) => aggregatedPlanningProjectData[month]?.non_operating_income || 0,
        )
        const nonOperatingExpensesValues = months.map(
          (month) => aggregatedPlanningProjectData[month]?.non_operating_expense || 0,
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
          {
            label: 'Sales Revenue',
            values: [
              ...salesValues,

              firstHalfTotal(salesValues),
              secondHalfTotal(salesValues),
              total(salesValues),
              '0',
            ],
          },
          {
            label: 'Sales ',
            values: [
              ...salesValues,
              firstHalfTotal(salesValues),
              secondHalfTotal(salesValues),
              total(salesValues),
              '0',
            ],
          },
          //start of cost of sales portion
          {
            label: 'Cost Of Sales',
            values: [
              ...costOfSalesValues,
              firstHalfTotal(costOfSalesValues),
              secondHalfTotal(costOfSalesValues),
              total(costOfSalesValues),
              '0',
            ],
          },
          {
            label: 'Purchases',
            values: [
              ...purchasesValues,
              firstHalfTotal(purchasesValues),
              secondHalfTotal(purchasesValues),
              total(purchasesValues),
              '0',
            ],
          },
          {
            label: 'Outsourcing Expenses',
            values: [
              ...outsourcingExpenseValues,
              firstHalfTotal(outsourcingExpenseValues),
              secondHalfTotal(outsourcingExpenseValues),
              total(outsourcingExpenseValues),
              '0',
            ],
          },
          {
            label: 'Product Purchases',
            values: [
              ...productPurchaseValues,
              firstHalfTotal(productPurchaseValues),
              secondHalfTotal(productPurchaseValues),
              total(productPurchaseValues),
              '0',
            ],
          },
          {
            label: 'Dispatch Labor Expenses',
            values: [
              ...dispatchLaborExpenseValues,
              firstHalfTotal(dispatchLaborExpenseValues),
              secondHalfTotal(dispatchLaborExpenseValues),
              total(dispatchLaborExpenseValues),
              '0',
            ],
          },
          {
            label: 'Communication Expenses',
            values: [
              ...communicationCostValues,
              firstHalfTotal(communicationCostValues),
              secondHalfTotal(communicationCostValues),
              total(communicationCostValues),
              '0',
            ],
          },
          {
            label: 'Work in Progress Expenses',
            values: [
              ...workInProgressValues,
              firstHalfTotal(workInProgressValues),
              secondHalfTotal(workInProgressValues),
              total(workInProgressValues),
              '0',
            ],
          },
          {
            label: 'Amortization Expenses',
            values: [
              ...amortizationValues,
              firstHalfTotal(amortizationValues),
              secondHalfTotal(amortizationValues),
              total(amortizationValues),
              '0',
            ],
          },
          // end for cost of sales section
          {
            label: 'Gross Profit',
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
            label: 'Employee Expenses',
            values: [
              ...employeeExpensesValues,
              firstHalfTotal(employeeExpensesValues),
              secondHalfTotal(employeeExpensesValues),
              total(employeeExpensesValues),
              '0',
            ],
          },
          {
            label: 'Executive Enumeration',
            values: [
              ...executiveRenumerationValues,
              firstHalfTotal(executiveRenumerationValues),
              secondHalfTotal(executiveRenumerationValues),
              total(executiveRenumerationValues),
              '0',
            ],
          },
          {
            label: 'Salary',
            values: [
              ...salaryValues,
              firstHalfTotal(salaryValues),
              secondHalfTotal(salaryValues),
              total(salaryValues),
              '0',
            ],
          },
          {
            label: 'Bonus and Fuel Allowance',
            values: [
              ...bonusAndFuelAllowanceValues,
              firstHalfTotal(bonusAndFuelAllowanceValues),
              secondHalfTotal(bonusAndFuelAllowanceValues),
              total(bonusAndFuelAllowanceValues),
              '0',
            ],
          },
          {
            label: 'Statutory Welfare Expenses',
            values: [
              ...statutoryWelfareExpenseValues,
              firstHalfTotal(statutoryWelfareExpenseValues),
              secondHalfTotal(statutoryWelfareExpenseValues),
              total(statutoryWelfareExpenseValues),
              '0',
            ],
          },
          {
            label: 'Welfare Expenses',
            values: [
              ...welfareExpenseValues,
              firstHalfTotal(welfareExpenseValues),
              secondHalfTotal(welfareExpenseValues),
              total(welfareExpenseValues),
              '0',
            ],
          },
          {
            label: 'Insurance Premiums',
            values: [
              ...insurancePremiumsValues,
              firstHalfTotal(insurancePremiumsValues),
              secondHalfTotal(insurancePremiumsValues),
              total(insurancePremiumsValues),
              '0',
            ],
          },
          //end for employee expense section
          //start for expenses section
          {
            label: 'Expenses',
            values: [
              ...expenseValues,
              firstHalfTotal(expenseValues),
              secondHalfTotal(expenseValues),
              total(expenseValues),
              '0',
            ],
          },
          {
            label: 'Consumable Expenses',
            values: [
              ...consumableValues,
              firstHalfTotal(consumableValues),
              secondHalfTotal(consumableValues),
              total(consumableValues),
              '0',
            ],
          },
          {
            label: 'Rent Expenses',
            values: [
              ...rentValues,
              firstHalfTotal(rentValues),
              secondHalfTotal(rentValues),
              total(rentValues),
              '0',
            ],
          },
          {
            label: 'Taxes and Public Charges',
            values: [
              ...taxesPublicChargesValues,
              firstHalfTotal(taxesPublicChargesValues),
              secondHalfTotal(taxesPublicChargesValues),
              total(taxesPublicChargesValues),
              '0',
            ],
          },
          {
            label: 'Depreciation Expenses',
            values: [
              ...depreciationExpensesValues,
              firstHalfTotal(depreciationExpensesValues),
              secondHalfTotal(depreciationExpensesValues),
              total(depreciationExpensesValues),
              '0',
            ],
          },
          {
            label: 'Travel Expenses',
            values: [
              ...travelExpenseValues,
              firstHalfTotal(travelExpenseValues),
              secondHalfTotal(travelExpenseValues),
              total(travelExpenseValues),
              '0',
            ],
          },
          {
            label: 'Communication Expenses',
            values: [
              ...communicationExpenseValues,
              firstHalfTotal(communicationExpenseValues),
              secondHalfTotal(communicationExpenseValues),
              total(communicationExpenseValues),
              '0',
            ],
          },
          {
            label: 'Utilities Expenses',
            values: [
              ...utilitiesValues,
              firstHalfTotal(utilitiesValues),
              secondHalfTotal(utilitiesValues),
              total(utilitiesValues),
              '0',
            ],
          },
          {
            label: 'Transaction Expenses',
            values: [
              ...transactionFeeValues,
              firstHalfTotal(transactionFeeValues),
              secondHalfTotal(transactionFeeValues),
              total(transactionFeeValues),
              '0',
            ],
          },
          {
            label: 'Advertising Expenses',
            values: [
              ...advertisingExpenseValues,
              firstHalfTotal(advertisingExpenseValues),
              secondHalfTotal(advertisingExpenseValues),
              total(advertisingExpenseValues),
              '0',
            ],
          },
          {
            label: 'Entertainment Expenses',
            values: [
              ...entertainmentExpenseValues,
              firstHalfTotal(entertainmentExpenseValues),
              secondHalfTotal(entertainmentExpenseValues),
              total(entertainmentExpenseValues),
              '0',
            ],
          },
          {
            label: 'Professional Services Fees',
            values: [
              ...professionalServiceFeeValues,
              firstHalfTotal(professionalServiceFeeValues),
              secondHalfTotal(professionalServiceFeeValues),
              total(professionalServiceFeeValues),
              '0',
            ],
          },
          // end for expense section
          {
            //add 人件費 + 経費 field
            label: 'SG&A Expenses', // shortened version as it is too long in English Mode
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
            label: 'Operating Income',
            values: [
              ...operatingIncomeValues,
              firstHalfTotal(operatingIncomeValues),
              secondHalfTotal(operatingIncomeValues),
              total(operatingIncomeValues),
              '0',
            ],
          },
          {
            label: 'Non-Operating Income',
            values: [
              ...nonOperatingIncomeValues,
              firstHalfTotal(nonOperatingIncomeValues),
              secondHalfTotal(nonOperatingIncomeValues),
              total(nonOperatingIncomeValues),
              '0',
            ],
          },
          {
            label: 'Non-Operating Expenses',
            values: [
              ...nonOperatingExpensesValues,
              firstHalfTotal(nonOperatingExpensesValues),
              secondHalfTotal(nonOperatingExpensesValues),
              total(nonOperatingExpensesValues),
              '0',
            ],
          },
          {
            label: 'Ordinary Income',
            values: [
              ...ordinaryProfitValues,
              firstHalfTotal(ordinaryProfitValues),
              secondHalfTotal(ordinaryProfitValues),
              total(ordinaryProfitValues),
              '0',
            ],
          },
          {
            label: 'Cumulative Ordinary Income',
            values: [
              ...cumulativeOrdinaryProfitValues,
              firstHalfTotal(cumulativeOrdinaryProfitValues),
              secondHalfTotal(cumulativeOrdinaryProfitValues),
              total(cumulativeOrdinaryProfitValues),
              '0',
            ],
          },
        ]
        
        const excelRows = [
          ['', ...monthsNames, ...additionalHeaders],
          ['', 'Planning', 'Planning', 'Planning', 'Planning', ...Array(11).fill('Planning')],
        ]

        data.forEach((item) => {
          excelRows.push([item.label, ...item.values])
        })
        // This part of the code will write the excel
        const worksheet = XLSX.utils.aoa_to_sheet(excelRows)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
        XLSX.writeFile(workbook, 'report.xlsx')

        }).catch((error) => {
          console.log(error);
          
        })
  }

  const handleThousandYenToggle = () => {
    setIsThousandYenChecked((prevState) => !prevState)
  }

  const handleEditModeToggle = () => {
    setIsThousandYenChecked(false)
    setIsEditing((prevState) => {
      const newEditingState = !prevState
      if (newEditingState) {
        setLanguage(initialLanguage)
      }
      return newEditingState
    })
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const fetchData = async () => {
    try {
      const res = await dispatch(fetchAllClientData() as unknown as UnknownAction)
      setTableList(res.payload)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const startIndex = currentPage * rowsPerPage
    setPaginatedData(tableList?.slice(startIndex, startIndex + rowsPerPage))
  }, [currentPage, rowsPerPage, tableList])

  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRowsPerPageChange = (numRows: number) => {
    setRowsPerPage(numRows)
    setCurrentPage(0)
  }

  const handleSwitchToggle = () => {
    setIsSwitchActive((prevState) => !prevState)
  }

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const handleTranslationSwitchToggle = () => {
    if (!isEditing) {
      const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
      setInitialLanguage(language)
      setLanguage(newLanguage)
    }
  }

  return (
    <div className='results_summary_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='results_summary_content_wrapper'>
        <Sidebar />
        <div className='results_summary_table_wrapper'>
          <div className='results_summary_top_cont'>
            <div className='results_summary_content'>
              <div className='results_summary_btm'>
                <div className='results_summary_header_text'>
                  <div className='results_summary_left-content'>
                    <p>{translate('profitAndlossPlanning', language)}</p>
                  </div>
                  <div className='results_summary_right-content'>
                    <div className='results_summary_paginate'>
                      {isSwitchActive ? (
                        <p className='results_summary_mode_switch_disabled'>
                          {isEditing
                            ? translate('switchToDisplayMode', language)
                            : translate('switchToEditMode', language)}
                        </p>
                      ) : (
                        <p className='results_summary_mode_switch'>
                          {isEditing
                            ? translate('switchToDisplayMode', language)
                            : translate('switchToEditMode', language)}
                        </p>
                      )}

                      <label className='results_summary_switch'>
                        {isSwitchActive ? (
                          <label className='swith_edit'>
                            <input type='checkbox' checked={isEditing} onChange={handleEditModeToggle} disabled />
                            <span className='results_summary_slider'></span>
                          </label>
                        ) : (
                          <div>
                            <label className='swith_edit'>
                              <input type='checkbox' checked={isEditing} onChange={handleEditModeToggle} />
                              <span className='results_summary_slider'></span>
                            </label>
                          </div>
                        )}
                      </label>
                      <label className='results_summary_burger'>
                        <RxHamburgerMenu onClick={toggleModal} />
                      </label>
                      {isCSVModalOpen && (
                        <div className='results-csv-modal' onClick={toggleModal}>
                          <div className='results-csv-modal-content' onClick={(e) => e.stopPropagation()}>
                            <p className='results-csv-p' onClick={downloadSVG}>
                              Download SVG.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className='results_summary_tbl_cont'>
                  <div className={`table_content_results_summary ${isSwitchActive ? 'hidden' : ''}`}>
                    {/* Render the TablePlanning component here */}
                    {isEditing ? <EditTableResults /> : <TableResults isThousandYenChecked={isThousandYenChecked} />}
                  </div>
                  <div className={`table_content_props ${isSwitchActive ? '' : 'hidden'}`}>
                    <TableResultsB
                      data={paginatedData}
                      header={header}
                      dates={dates}
                      smallDate={smallDate}
                      isThousandYenChecked={isThousandYenChecked}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsListAndEdit