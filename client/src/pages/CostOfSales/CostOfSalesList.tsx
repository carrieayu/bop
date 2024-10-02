import React, { useEffect, useState } from "react";
import Btn from "../../components/Button/Button";
import Pagination from "../../components/Pagination/Pagination";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { translate } from "../../utils/translationUtil";
import ListButtons from "../../components/ListButtons/ListButtons";
import HeaderButtons from "../../components/HeaderButtons/HeaderButtons";
import AlertModal from "../../components/AlertModal/AlertModal";
import { RiDeleteBin6Fill } from "react-icons/ri";


const CostOfSalesList: React.FC = () => {
    const [activeTab, setActiveTab] = useState('/planning-list')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('costOfSales')
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [paginatedData, setPaginatedData] = useState<any[]>([])
    const { language, setLanguage } = useLanguage()
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); 
    const select = [5, 10, 100]
    const [isEditing, setIsEditing] = useState(false)
    const [initialLanguage, setInitialLanguage] = useState(language);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedCostOfSales, setSelectedCostOfSales] = useState<any>(null);
    const [deleteId, setDeleteCostOfSalesId] = useState([])

    const totalPages = Math.ceil(100 / 10);

    const handleTabClick = (tab) => {
        setActiveTab(tab)
        navigate(tab)
      }
      
      const handleTabsClick = (tab) => {
        setActiveTabOther(tab)
        switch (tab) {
          case 'project':
            navigate('/projects-list');
            break;
          case 'employeeExpenses':
            navigate('/employee-expenses-list');
            break;
          case 'expenses':
            navigate('/expenses-list');
            break;
          case 'costOfSales':
            navigate('/cost-of-sales-list');
            break;
          default:
            break;
        }
      }  
    
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };


    const [costOfSales, setCostOfSales] = useState([]);


    const handleRowsPerPageChange = (numRows: number) => {
        setRowsPerPage(numRows)
        setCurrentPage(0) 
    }

    const handleClick = () => {
      setIsEditing((prevState) => {
        const newEditingState = !prevState;
        if (newEditingState) {
          setLanguage(initialLanguage);
        }
    
        return newEditingState;
      });
    }

    const handleChange = (index, e) => {
      const { name, value } = e.target;
      const updatedData = [...combinedData];
      updatedData[index] = {
        ...updatedData[index],
        [name]: value,
      };
      setCostOfSales(updatedData);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
  
      // Use validData instead of combinedData
      const token = localStorage.getItem('accessToken');
      if (!token) {
          window.location.href = '/login';
          return;
      }
      try {
          await axios.put('http://127.0.0.1:8000/api/cost-of-sales/update', validData, {
            // const response = await axios.put('http://54.178.202.58:8000/api/cost-of-sales/update', validData, {
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
          });
          alert('Successfully updated');

          setIsEditing(false);

          const response = await axios.get('http://127.0.0.1:8000/api/cost-of-sales');
          // const response = await axios.get('http://54.178.202.58:8000/api/cost-of-sales');
          setCostOfSales(response.data);
      } catch (error) {
          if (error.response) {
              console.error('Error response:', error.response.data);
              if (error.response.status === 401) {
                  window.location.href = '/login';
              } else {
                  console.error('There was an error updating the cost of sales data!', error.response.data);
              }
          } else {
              console.error('Error', error.message);
          }
      }
  };
  


    useEffect(() => {
        const fetchCostOfSales = async () => {
          const token = localStorage.getItem('accessToken');
          if (!token) {
            window.location.href = '/login';  // Redirect to login if no token found
            return;
          }
    
          try {
            const response = await axios.get('http://127.0.0.1:8000/api/cost-of-sales', {
            // const response = await axios.get('http://54.178.202.58:8000/api/cost-of-sales', {
              headers: {
                'Authorization': `Bearer ${token}`  // Add token to request headers
              }
            });
            setCostOfSales(response.data);
            console.log("cost of sales: ", response.data);
            
            console.log("combijned: ", combinedData);
          } catch (error) {
            if (error.response && error.response.status === 401) {
              window.location.href = '/login';  // Redirect to login if unauthorized
            } else {
              console.error('There was an error fetching the cost of sales data!', error);
            }
          }
        };
    
        fetchCostOfSales();
      }, []);

      console.log("cost of sales: ", setCostOfSales);

      useEffect(() => {
        const startIndex = currentPage * rowsPerPage
        setPaginatedData(costOfSales.slice(startIndex, startIndex + rowsPerPage))
      }, [currentPage, rowsPerPage, costOfSales])

      useEffect(() => {
        const path = location.pathname;
        if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
          setActiveTab(path);
        }
      }, [location.pathname]);

      // Fixed months array
    const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

    // Extract unique years from the costOfSales data
    const uniqueYears = Array.from(new Set(costOfSales.map(item => item.year))).sort((a, b) => a - b);

    // Combine static months with dynamic data
    const combinedData = uniqueYears.flatMap(year => {
      return months.map((month) => {
        const foundData = costOfSales.find(item => parseInt(item.month, 10) === month && item.year === year);
        
        return {
          cost_of_sale_id: foundData ? foundData.cost_of_sale_id : null,
          month,
          year,
          purchase: foundData ? foundData.purchase : 0,
          outsourcing_expense: foundData ? foundData.outsourcing_expense : 0,
          product_purchase: foundData ? foundData.product_purchase : 0,
          dispatch_labor_expense: foundData ? foundData.dispatch_labor_expense : 0,
          communication_expense: foundData ? foundData.communication_expense : 0,
          work_in_progress_expense: foundData ? foundData.work_in_progress_expense : 0,
          amortization_expense: foundData ? foundData.amortization_expense : 0
        };
      });
    });

  const validData = combinedData.filter(data => data.cost_of_sale_id !== null);

    useEffect(() => {
      setIsTranslateSwitchActive(language === 'en');
    }, [language]);
  
    const handleTranslationSwitchToggle = () => {
      const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
      setLanguage(newLanguage);
    };

    const openModal = (users, id) => {
      setSelectedCostOfSales(users)
      setModalIsOpen(true);
      setDeleteCostOfSalesId(id)
  };
  

  const closeModal = () => {
      setSelectedCostOfSales(null);
      setModalIsOpen(false);
  };

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

    const handleConfirm = async () => {
      console.log('Confirmed action for cost of sale:', deleteId)
      const token = localStorage.getItem('accessToken')
      try {
        await axios.delete(`http://127.0.0.1:8000/api/cost-of-sales/${deleteId}/delete/`, {
          // const response = await axios.get(`http://54.178.202.58:8000/api/user/list/${deleteId}/delete/`, {
              headers: {
                'Authorization': `Bearer ${token}`  // Add token to request headers
              }
        })

        setIsEditing(false);

        alert('Successfully deleted');

        const response = await axios.get('http://127.0.0.1:8000/api/cost-of-sales');
        // const response = await axios.get('http://54.178.202.58:8000/api/cost-of-sales');
        setCostOfSales(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login' // Redirect to login if unauthorized
        } else {
          console.error('Error deleting cost of sale:', error)
        }
      }
      closeModal();
    };

    const handleNewRegistrationClick = () => {
      navigate('/cost-of-sales-registration');
    };

  return (
    <div className='costOfSalesList_wrapper'>
        <HeaderButtons 
            activeTab={activeTab}
            handleTabClick={handleTabClick}
            isTranslateSwitchActive={isTranslateSwitchActive}
            handleTranslationSwitchToggle={handleTranslationSwitchToggle}
        />
        <div className="costOfSalesList_cont_wrapper">
                <Sidebar />
            <div className="costOfSalesList_btn_wrapper">
                    <div className="costOfSalesList_top_content">
                        <div className="costOfSalesList_top_body_cont">
                          <div className='costOfSalesList_mode_switch_datalist'>
                            <button className='costOfSalesList_mode_switch' onClick={handleClick}>
                              {isEditing ? translate('switchToDisplayMode', language) : translate('switchToEditMode', language)}
                            </button>
                          </div>
                        </div>
                        <div className="costOfSalesList_mid_body_cont">
                            <ListButtons
                              activeTabOther={activeTabOther}
                              message={translate('costOfSalesList', language)}
                              handleTabsClick={handleTabsClick}
                              handleNewRegistrationClick={handleNewRegistrationClick}
                              buttonConfig={[
                                { labelKey: 'project', tabKey: 'project' },
                                { labelKey: 'employeeExpenses', tabKey: 'employeeExpenses' },
                                { labelKey: 'expenses', tabKey: 'expenses' },
                                { labelKey: 'costOfSales', tabKey: 'costOfSales' },
                              ]}
                            />
                            <div className="costOfSalesList_table_wrapper">
                                <div className="costOfSalesList_table_cont">
                                    <div className='columns is-mobile'>
                                        <div className='column'>
                                          {isEditing ? (
                                            <div>
                                            <table className='table is-bordered is-hoverable'>
                                              <thead>
                                                  <tr className="costOfSalesList_table_title ">
                                                  <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('year', language)}</th>
                                                  <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('month', language)}</th>
                                                  <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('purchases', language)}</th>
                                                  <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('outsourcingExpenses', language)}</th>
                                                  <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('productPurchases', language)}</th>
                                                  <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('dispatchLaborExpenses', language)}</th>
                                                  <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('communicationExpenses', language)}</th>
                                                  <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('workInProgressExpenses', language)}</th>
                                                  <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('amortizationExpenses', language)}</th>
                                                  <th className="costOfSalesList_table_title_content_vertical has-text-centered"></th>
                                                  </tr>
                                              </thead>
                                              <tbody className="costOfSalesList_table_body">
                                                {combinedData.map((costOfSale, index) => {
                                                    const isNewYear = index === 0 || combinedData[index - 1].year !== costOfSale.year;
                                                    const isLastcostOfSaleOfYear = 
                                                      (index !== combinedData.length - 1 && combinedData[index + 1].year !== costOfSale.year);

                                                      const isEditable = costOfSale.cost_of_sale_id !== null;
                                                      
                                                    return (
                                                        <React.Fragment key={index}>
                                                            {costOfSale ? (
                                                                <tr className="costOfSalesList_table_body_content_horizontal">
                                                                    <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                        {costOfSale.year}
                                                                    </td>
                                                                    <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                        {costOfSale.month}
                                                                    </td>
                                                                    <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                        <input
                                                                            type='number'
                                                                            name='purchase'
                                                                            value={costOfSale.purchase}
                                                                            onChange={(e) => handleChange(index, e)}
                                                                            disabled={!isEditable}
                                                                        />
                                                                    </td>
                                                                    <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                        <input
                                                                            type='number'
                                                                            name='outsourcing_expense'
                                                                            value={costOfSale.outsourcing_expense}
                                                                            onChange={(e) => handleChange(index, e)}
                                                                            disabled={!isEditable}
                                                                        />
                                                                    </td>
                                                                    <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                        <input
                                                                            type='number'
                                                                            name='product_purchase'
                                                                            value={costOfSale.product_purchase}
                                                                            onChange={(e) => handleChange(index, e)}
                                                                            disabled={!isEditable}
                                                                        />
                                                                    </td>
                                                                    <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                        <input
                                                                            type='number'
                                                                            name='dispatch_labor_expense'
                                                                            value={costOfSale.dispatch_labor_expense}
                                                                            onChange={(e) => handleChange(index, e)}
                                                                            disabled={!isEditable}
                                                                        />
                                                                    </td>
                                                                    <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                        <input
                                                                            type='number'
                                                                            name='communication_expense'
                                                                            value={costOfSale.communication_expense}
                                                                            onChange={(e) => handleChange(index, e)}
                                                                            disabled={!isEditable}
                                                                        />
                                                                    </td>
                                                                    <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                        <input
                                                                            type='number'
                                                                            name='work_in_progress_expense'
                                                                            value={costOfSale.work_in_progress_expense}
                                                                            onChange={(e) => handleChange(index, e)}
                                                                            disabled={!isEditable}
                                                                        />
                                                                    </td>
                                                                    <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                        <input
                                                                            type='number'
                                                                            name='amortization_expense'
                                                                            value={costOfSale.amortization_expense}
                                                                            onChange={(e) => handleChange(index, e)}
                                                                            disabled={!isEditable}
                                                                        />
                                                                    </td>
                                                                    <td className='costOfSalesList_table_body_content_vertical delete_icon'>
                                                                        <RiDeleteBin6Fill
                                                                            className='delete-icon'
                                                                            onClick={() => openModal('costOfSales', costOfSale.cost_of_sale_id)}
                                                                            style={{ color: 'red' }}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ) : null}
                                                            {isLastcostOfSaleOfYear && (
                                                                <tr className="year-separator">
                                                                    <td className="horizontal-line-cell" colSpan={9}>
                                                                        <div className="horizontal-line" />
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                            </table>
                                            </div>
                                          ):(
                                            <table className='table is-bordered is-hoverable'>
                                            <thead>
                                                <tr className="costOfSalesList_table_title ">
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('year', language)}</th>
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('month', language)}</th>
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('purchases', language)}</th>
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('outsourcingExpenses', language)}</th>
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('productPurchases', language)}</th>
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('dispatchLaborExpenses', language)}</th>
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('communicationExpenses', language)}</th>
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('workInProgressExpenses', language)}</th>
                                                <th className="costOfSalesList_table_title_content_vertical has-text-centered">{translate('amortizationExpenses', language)}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="costOfSalesList_table_body">
                                              {combinedData.map((costOfSale, index) => {
                                                   const isNewYear = index === 0 || combinedData[index - 1].year !== costOfSale.year;
                                                   const isLastcostOfSaleOfYear = 
                                                     (index !== combinedData.length - 1 && combinedData[index + 1].year !== costOfSale.year);

                                                  return (
                                                      <React.Fragment key={index}>
                                                          <tr className="costOfSalesList_table_body_content_horizontal">
                                                              <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                  {costOfSale.year || 0}
                                                              </td>
                                                              <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                  {costOfSale.month}
                                                              </td>
                                                              <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                  {costOfSale.purchase || 0}
                                                              </td>
                                                              <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                  {costOfSale.outsourcing_expense || 0}
                                                              </td>
                                                              <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                  {costOfSale.product_purchase || 0}
                                                              </td>
                                                              <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                  {costOfSale.dispatch_labor_expense || 0}
                                                              </td>
                                                              <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                  {costOfSale.communication_expense || 0}
                                                              </td>
                                                              <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                  {costOfSale.work_in_progress_expense || 0}
                                                              </td>
                                                              <td className="costOfSalesList_table_body_content_vertical has-text-centered">
                                                                  {costOfSale.amortization_expense || 0}
                                                              </td>
                                                          </tr>
                                                          {isLastcostOfSaleOfYear && (
                                                              <tr className="year-separator">
                                                                  <td className="horizontal-line-cell" colSpan={9}>
                                                                      <div className="horizontal-line" />
                                                                  </td>
                                                              </tr>
                                                          )}
                                                      </React.Fragment>
                                                  );
                                              })}
                                            </tbody>
                                            </table>
                                          )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='costOfSalesList_is_editing_wrapper'>
                              <div className='costOfSalesList_is_editing_cont'>
                                {isEditing ? (
                                  <div className='costOfSalesList_mode_switch_datalist'>
                                    <button className='costOfSalesList_edit_submit_btn' onClick={handleSubmit}>
                                      更新
                                    </button>
                                  </div>
                                ) : (
                                  <div></div>
                                )}
                              </div>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
        <AlertModal
          isOpen={modalIsOpen}
          onConfirm={handleConfirm}
          onCancel={closeModal}
          message={translate('deleteMessage', language)}
        />
    </div>
  )
};

export default CostOfSalesList;
