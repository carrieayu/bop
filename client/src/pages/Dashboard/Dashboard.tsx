import React, { useEffect, useState } from 'react'
import Card from '../../components/Card/Card'
import GraphDashboard from '../../components/GraphDashboard/GraphDashboard'
import { fetchAllCards } from '../../reducers/card/cardSlice'
import { useAppSelector } from '../../actions/hooks'
import { RootState } from '../../app/store'
import { fetchAllClientData } from '../../reducers/table/tableSlice'
import { fetchGraphData } from '../../reducers/graph/graphSlice'
import Sidebar from '../../components/Sidebar/Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import { useAppDispatch } from '../../actions/hooks'
import TableDashboard from '../../components/TableDashboard/TableDashboard'
import { error } from 'console'

import { useDispatch, useSelector } from "react-redux";

// planning
import { fetchCos } from '../../reducers/costOfSale/costOfSaleSlice'
import { getCostOfSaleTotals } from '../../reducers/costOfSale/costOfSaleSlice'

import { fetchExpense } from '../../reducers/expenses/expensesSlice'
import { getExpenseTotals } from '../../reducers/expenses/expensesSlice'

import { fetchEmployeeExpense, getEmployeeExpenseTotals } from '../../reducers/employeeExpense/employeeExpenseSlice'
// results
import { fetchCosResult, getCostOfSaleResultsTotals } from '../../reducers/costOfSale/costOfSaleResultSlice'

import { fetchExpenseResult, getExpenseResultsTotals } from '../../reducers/expenses/expensesResultsSlice'

import { fetchProjectResult, getProjectTotalSales } from '../../reducers/project/projectResultSlice'
import { fetchProject, getProjectTotals } from '../../reducers/project/projectSlice'

import { fetchEmployeeExpenseResult, getEmployeeExpenseResultTotals} from '../../reducers/employeeExpense/employeeExpenseResultSlice'
import { Root } from 'react-dom/client'
import { DashboardCard } from '../../components/Card/DashboardCard'

function formatNumberWithCommas(number: number): string {
  return number.toLocaleString()
}

const Dashboard = () => {
  const totalSales = useAppSelector((state: RootState) => state.cards.totalSales)

  // GET TOTALS FOR CARDS USING REDUX
  const expenseTotalsArray = useSelector((state: RootState) => state.expenses.expenseTotals)
  const expenseYearTotal = useSelector((state: RootState) => state.expenses.expensesYearTotal)

  const costOfSaleTotalsArray = useSelector((state: RootState) => state.costOfSale.costOfSaleTotals)
  const costOfSaleYearTotal = useSelector((state: RootState) => state.costOfSale.costOfSaleYearTotal)

  const costOfSaleResultYearTotal = useSelector((state: RootState) => state.costOfSaleResult.costOfSaleResultYearTotal)

  const expenseResultYearTotal = useSelector((state: RootState) => state.expensesResults.expenseResultYearTotal)

  const projectResultTotalSales = useSelector((state: RootState) => state.projectResult.totalSales)


  const employeeExpenseResultYearTotal = useSelector(
    (state: RootState) => state.employeeExpenseResult.employeeExpenseResultYearTotal,
  )

  const employeeExpenseYearTotal = useSelector((state: RootState) => state.employeeExpense.employeeExpenseYearTotal)
  const employeeExpenseList = useSelector((state: RootState) => state.employeeExpense.employeeExpenseList)

  // sales revenue - cos totals
  const planningGrossProfit = totalSales - parseFloat(costOfSaleYearTotal)
  const planningGrossProfitMargin = totalSales !== 0 ? (planningGrossProfit / totalSales) * 100 : 0 // Prevent division by zero

  const resultGrossProfit = projectResultTotalSales - parseFloat(costOfSaleResultYearTotal)
  const resultGrossProfitMargin = totalSales !== 0 ? (resultGrossProfit / projectResultTotalSales) * 100 : 0 // Prevent division by zero

  const sellingAndAdminPlanningTotal = employeeExpenseYearTotal + expenseYearTotal
  const sellingAndAdminResultTotal = employeeExpenseResultYearTotal + expenseResultYearTotal

  const operatingIncomePlanning = planningGrossProfit - parseFloat(sellingAndAdminPlanningTotal)
  const operatingIncomeResult = resultGrossProfit - parseFloat(sellingAndAdminResultTotal)

  const operatingProfitMarginPlanning = totalSales !== 0 ? (operatingIncomePlanning / totalSales) * 100 : 0
  const operatingProfitMarginResult =
    projectResultTotalSales !== 0 ? (operatingIncomeResult / projectResultTotalSales) * 100 : 0

  
  const operatingIncomeTotalPlanningFromProjects = useSelector((state: RootState) => state.project.operatingIncomeTotal)
  const nonOperatingIncomeTotalPlanning = useSelector((state: RootState) => state.project.nonOperatingIncomeTotal)
  const nonOperatingExpenseTotalPlanning = useSelector((state: RootState) => state.project.nonOperatingExpenseTotal)

  const nonOperatingIncomeTotalResult = useSelector((state: RootState) => state.projectResult.nonOperatingIncomeTotal)
  const nonOperatingExpenseTotalResult = useSelector((state: RootState) => state.projectResult.nonOperatingExpenseTotal)

  // cumulative income: (total, calculate**):** operating income + non-operating income - non-operating expense
  const cumulativeOrdinaryIncomePlanningFromProjects = useSelector((state: RootState) => state.project.cumulativeOrdinaryIncome)
  // BEING USED HERE (operating income comes from dahsboard values not project.operating_income)
  const cumulativeOrdinaryIncomePlanning =
    (operatingIncomePlanning + nonOperatingIncomeTotalPlanning) - nonOperatingExpenseTotalPlanning

  const cumulativeOrdinaryIncomeResult =
    (operatingIncomeResult + nonOperatingIncomeTotalResult) - nonOperatingExpenseTotalResult
  // END   // GET TOTALS FOR CARDS USING REDUX

  const [tableList, setTableList] = useState<any>([])
  const totalOperatingProfit = useAppSelector((state: RootState) => state.cards.totalOperatingProfit)
  const totalGrossProfit = useAppSelector((state: RootState) => state.cards.totalGrossProfit)
  const totalNetProfitPeriod = useAppSelector((state: RootState) => state.cards.totalNetProfitPeriod)
  const totalGrossProfitMargin = useAppSelector((state: RootState) => state.cards.totalGrossProfitMargin)
  const totalOperatingProfitMargin = useAppSelector((state: RootState) => state.cards.totalOperatingProfitMargin)
  const totalSalesByDate = useAppSelector((state: RootState) => state.graph.totalSalesByDate)
  const totalOperatingIncomeByDate = useAppSelector((state: RootState) => state.graph.totalOperatingIncomeByDate)
  const totalGrossProfitByDate = useAppSelector((state: RootState) => state.graph.totalGrossProfitByDate)
  const totalCumulativeOrdinaryIncomeByDate = useAppSelector(
    (state: RootState) => state.graph.totalCumulativeOrdinaryIncome,
  )
  const totalGrossProfitMarginByDate = useAppSelector((state: RootState) => state.graph.totalGrossProfitMarginByDate)
  const totalOperatingProfitMarginByDate = useAppSelector(
    (state: RootState) => state.graph.totalOperatingProfitMarginByDate,
  )
  const month = useAppSelector((state: RootState) => state.graph.month)
  const [activeTab, setActiveTab] = useState('/dashboard')
  const [isSwitchActive, setIsSwitchActive] = useState(false)
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const navigate = useNavigate()
  const location = useLocation()
  const [isThousandYenChecked, setIsThousandYenChecked] = useState(false)
  const dispatch = useAppDispatch()

  const handleThousandYenToggle = () => {
    setIsThousandYenChecked((prevState) => !prevState)
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  useEffect(() => {
    console.log(
      'projectResultTotalSales',
      projectResultTotalSales,
      'costOfSaleResultYearTotal',
      costOfSaleResultYearTotal,
      'totalSales',
      totalSales,
      'costOfSaleYearTotal',
      costOfSaleYearTotal,
    )
  }, [tableList])

  useEffect(() => {
    // Updated to catch errors when executing dispatch
    const fetchData = async () => {
      try {
        // PLANNING
        // WHY IS THIS CALLED CLIENTDATA???? NEED TO INVESTIGATE AND POSSIBLY FIX
        const [clientData] = await Promise.all([
          dispatch(fetchAllClientData()).catch((error) => {
            console.error('Error fetching client data:', error)
            return null
          }),
          dispatch(fetchAllCards()).catch((error) => {
            console.error('Error fetching cards data:', error)
            return null
          }),
          dispatch(fetchGraphData()).catch((error) => {
            console.error('Error fetching graph data:', error)
            return null
          }),
          dispatch(fetchCos())
            .catch((error) => {
              console.error('Error fetching COS data:', error)
              return null
            })
            .then(() => {
              dispatch(getCostOfSaleTotals())
            }),
          dispatch(fetchExpense())
            .catch((error) => {
              console.error('Error fetching Expense data:', error)
              return null
            })
            .then(() => {
              dispatch(getExpenseTotals())
            }),
          dispatch(fetchEmployeeExpense())
            .catch((error) => {
              console.error('Error fetching Expense Result data:', error)
              return null
            })
            .then(() => {
              dispatch(getEmployeeExpenseTotals())
            }),
          dispatch(fetchProject())
            .catch((error) => {
              console.error('Error fetching Project data:', error)
              return null
            })
            .then(() => {
              dispatch(getProjectTotals())
            }),
          // RESULTS
          dispatch(fetchExpenseResult())
            .catch((error) => {
              console.error('Error fetching Expense Result data:', error)
              return null
            })
            .then(() => {
              dispatch(getExpenseResultsTotals())
            }),
          dispatch(fetchCosResult())
            .catch((error) => {
              console.error('Error fetching COS Result data:', error)
              return null
            })
            .then(() => {
              dispatch(getCostOfSaleResultsTotals())
            }),
          dispatch(fetchProjectResult())
            .catch((error) => {
              console.error('Error fetching Project Result data:', error)
              return null
            })
            .then(() => {
              dispatch(getProjectTotalSales())
            }),
          dispatch(fetchEmployeeExpenseResult())
            .catch((error) => {
              console.error('Error fetching Employee Expense Result data:', error)
              return null
            })
            .then(() => {
              dispatch(getEmployeeExpenseResultTotals())
            }),
        ])
        if (clientData) {
          setTableList(clientData.payload)
        }
      } catch (error) {
        console.error('Unexpected error:', error)
      }
    }

    fetchData()
  }, [tableList])

  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
    setLanguage(newLanguage)
  }

  const graphData = {
    labels: month, // This displays the 'dates' in y axis in the csv.
    datasets: [
      {
        type: 'bar' as const,
        label: translate('sales', language),
        data: month?.map((date) => totalSalesByDate[date] || 0),
        backgroundColor: '#6e748c',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: translate('grossProfit', language),
        data: month?.map((date) => totalGrossProfitByDate[date]),
        backgroundColor: '#7696c6',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: translate('operatingIncome', language),
        data: month?.map((date) => totalOperatingIncomeByDate[date]),
        backgroundColor: '#b8cbe2',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: translate('cumulativeOrdinaryIncome', language),
        data: month?.map((date) => totalCumulativeOrdinaryIncomeByDate[date]),
        backgroundColor: '#bde386',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: translate('grossProfitMargin', language),
        data: month?.map((date) => totalGrossProfitMarginByDate[date]),
        backgroundColor: '#ff8e13',
        borderColor: '#ff8e13',
        borderWidth: 2,
        yAxisID: 'y1',
        fill: false,
      },
      {
        type: 'line' as const,
        label: translate('operatingProfitMargin', language),
        data: month?.map((date) => totalOperatingProfitMarginByDate[date]),
        backgroundColor: '#ec3e4a',
        borderColor: '#ec3e4a',
        borderWidth: 2,
        yAxisID: 'y1',
        fill: false,
      },
    ],
  }

  return (
    <div className='dashboard_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='dashboard_content_wrapper'>
        <Sidebar />
        {/* <div className='dashboard_table_wrapper'> */}
        <div className='dashboard_content'>
          <div className='dashboard_body_cont'>
            <div className='dashboard_card_cont'>
              <div className='dashboard_left_card'>
                <DashboardCard
                  title={translate('sales', language)}
                  planningValue={totalSales}
                  resultValue={projectResultTotalSales}
                  translateKey='sales'
                  language={language}
                />
                <DashboardCard
                  title={translate(language === 'en' ? 'operatingIncomeShort' : 'operatingIncome', language)}
                  planningValue={operatingIncomePlanning}
                  resultValue={operatingIncomeResult}
                  translateKey='operatingIncome'
                  language={language}
                />
                <DashboardCard
                  title={translate('grossProfitMargin', language)}
                  planningValue={planningGrossProfitMargin.toFixed(2)}
                  resultValue={resultGrossProfitMargin.toFixed(2)}
                  translateKey='grossProfitMargin'
                  language={language}
                  percentage={true}
                />
              </div>
              &nbsp;&nbsp;&nbsp;
              <div className='dashboard_right_card'>
                <DashboardCard
                  title={translate('grossProfit', language)}
                  planningValue={planningGrossProfit}
                  resultValue={resultGrossProfit}
                  translateKey='grossProfit'
                  language={language}
                />
                <DashboardCard
                  title={translate(
                    language === 'en' ? 'cumulativeOrdinaryIncomeShort' : 'cumulativeOrdinaryIncome',
                    language,
                  )}
                  planningValue={cumulativeOrdinaryIncomePlanning}
                  resultValue={cumulativeOrdinaryIncomeResult}
                  translateKey='cumulativeOrdinaryIncome'
                  language={language}
                />
                <DashboardCard
                  title={translate(
                    language === 'en' ? 'operatingProfitMarginShort' : 'operatingProfitMargin',
                    language,
                  )}
                  planningValue={operatingProfitMarginPlanning.toFixed(2)}
                  resultValue={operatingProfitMarginResult.toFixed(2)}
                  translateKey='operatingProfitMargin'
                  language={language}
                  percentage={true}
                />
              </div>
            </div>
            &nbsp;&nbsp;&nbsp;
            <div className='dashboard_graph_cont'>
              <div className='dashboard_graph_wrap'>
                <GraphDashboard data={graphData} language={language} />
              </div>
            </div>
          </div>
          <div className='dashboard_bottom_cont'>
            <div className='dashboard_right-content'>
              <div className='dashboard_switches'>
                <p className='dashboard_pl-label'>{translate('thousandYen', language)}</p>
                <label className='dashboard_switch'>
                  <input type='checkbox' checked={isThousandYenChecked} onChange={handleThousandYenToggle} />
                  <span className='dashboard_slider'></span>
                </label>
              </div>
            </div>
            <div className='dashboard_tbl_cont'>
              <div className={`dashboard_table_content_planning ${isSwitchActive ? 'hidden' : ''}`}>
                {/* Render the TablePlanning & TableResults here (TableDashboard) */}
                <TableDashboard isThousandYenChecked={isThousandYenChecked} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
