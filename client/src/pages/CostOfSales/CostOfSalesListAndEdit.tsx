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
import CrudModal from "../../components/CrudModal/CrudModal";
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import '../../assets/scss/Components/SliderToggle.scss'
import { deleteCostOfSale } from "../../api/CostOfSalesEndpoint/DeleteCostOfSale";
import { getCostOfSale } from "../../api/CostOfSalesEndpoint/GetCostOfSale";
import { updateCostOfSale } from "../../api/CostOfSalesEndpoint/UpdateCostOfSale";
import {
  validateRecords,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicates,
} from '../../utils/validationUtil'
import {handleDisableKeysOnNumberInputs, removeCommas} from '../../utils/helperFunctionsUtil' // helper to block non-numeric key presses for number inputs
import { formatNumberWithCommas } from '../../utils/helperFunctionsUtil' // helper to block non-numeric key presses for number inputs


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
    const [crudValidationErrors, setCrudValidationErrors] = useState([])
    const [selectedCostOfSales, setSelectedCostOfSales] = useState<any>(null);
    const [deleteCostOfSalesId, setDeleteCostOfSalesId] = useState([])
    const [costOfSales, setCostOfSales] = useState([])
    const [originalCostOfSales, setOriginalCostOfSales] = useState(costOfSales)
    const totalPages = Math.ceil(100 / 10);
    const token = localStorage.getItem('accessToken')
    const [isCRUDOpen, setIsCRUDOpen] = useState(false);
    const [crudMessage, setCrudMessage] = useState('');
    const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false);

    const handleTabClick = (tab) => {
        setActiveTab(tab)
        navigate(tab)
      }
      
      const handleTabsClick = (tab) => {
        setActiveTabOther(tab)
        switch (tab) {
          case 'project':
            navigate('/projects-list')
            break
          case 'employeeExpenses':
            navigate('/employee-expenses-list')
            break
          case 'expenses':
            navigate('/expenses-list')
            break
          case 'costOfSales':
            navigate('/cost-of-sales-list')
            break
          default:
            break
        }
      }  
    
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };

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
      const { name, value } = e.target

      // Remove commas to get the raw number
      // EG. 999,999 → 999999 in the DB
      const rawValue = removeCommas(value)
      
      const updatedData = [...combinedData]
      updatedData[index] = {
        ...updatedData[index],
        [name]: rawValue,
      }
      setCostOfSales(updatedData)
    };

  const handleSubmit = async () => {
    // Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'costOfSales'

    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    // Validate records for the specified project fields
    const validateCostOfSales = (records) => validateRecords(records, fieldChecks, 'costOfSales')

    // Expenses has default 12 (for each month)
    // Even if not all records have actually been created in DB: We need to filter out non-registered records.
    const costOfSalesListExistingRecords = costOfSales.filter((cos) => cos.cost_of_sale_id !== null)

    // Step 2: Validate client-side input
    const validationErrors = validateCostOfSales(costOfSalesListExistingRecords)

    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['year', 'month', 'project_name', 'business_division', 'client']
    const duplicateErrors = checkForDuplicates(costOfSalesListExistingRecords, uniqueFields, 'costOfSales', language)

    // Step 4: Map error types to data and translation keys for handling in the modal
    const errorMapping = [
      { errors: validationErrors, errorType: 'normalValidation' },
      { errors: duplicateErrors, errorType: 'duplicateValidation' },
    ]

    // Step 5: Display the first set of errors found, if any
    const firstError = errorMapping.find(({ errors }) => errors.length > 0)

    if (firstError) {
      const { errors, errorType } = firstError
      const translatedErrors = translateAndFormatErrors(errors, language, errorType)
      setCrudMessage(translatedErrors)
      setCrudValidationErrors(translatedErrors)
      // setModalIsOpen(true)
      setIsCRUDOpen(true)

      return
    } else {
      setCrudValidationErrors([])
    }
    // Continue with submission if no errors

    const getModifiedFields = (original, updated) => {
      const modifiedFields = []

      updated.forEach((updatedCos) => {
        const originalCoS = original.find((cos) => cos.cost_of_sale_id === updatedCos.cost_of_sale_id)

        if (originalCoS) {
          const changes = { cost_of_sale_id: updatedCos.cost_of_sale_id }

          let hasChanges = false
          for (const key in updatedCos) {
            if (key === 'cost_of_sale_id ' || key === 'month') continue
            if (updatedCos[key] !== originalCoS[key] && updatedCos[key] !== '') {
              changes[key] = updatedCos[key]
              hasChanges = true
            }
          }

          if (hasChanges) {
            modifiedFields.push(changes)
          }
        }
      })
      return modifiedFields
    }

    const modifiedFields = getModifiedFields(originalCostOfSales, validData)
    if (modifiedFields.length === 0) {
      return
    }

    if (!token) {
      window.location.href = '/login'
      return
    }
    updateCostOfSale(modifiedFields, token)
      .then(() => {
        setOriginalCostOfSales(costOfSales)
        setCrudMessage(translate('successfullyUpdated', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
      })
      .catch((error) => {
        if (error.response) {
          console.error('Error response:', error.response.data)
          if (error.response.status === 401) {
            window.location.href = '/login'
          } else {
            console.error('There was an error updating the cost of sales data!', error.response.data)
          }
        } else {
          console.error('Error', error.message)
        }
      })
  };

    const handleUpdateConfirm = async () => {
      await handleSubmit(); // Call the submit function for update
      setIsUpdateConfirmationOpen(false);
  };
  
    useEffect(() => {
        const fetchCostOfSales = async () => {
          const token = localStorage.getItem('accessToken');
          if (!token) {
            window.location.href = '/login';  // Redirect to login if no token found
            return;
          }
    
          try {
            const response = await axios.get(`${getReactActiveEndpoint()}/api/cost-of-sales/list/`, {
              headers: {
                Authorization: `Bearer ${token}`, // Add token to request headers
              },
            })
            setCostOfSales(response.data);
            setOriginalCostOfSales(response.data)
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
          purchase: foundData ? foundData.purchase : '',
          outsourcing_expense: foundData ? foundData.outsourcing_expense : '',
          product_purchase: foundData ? foundData.product_purchase : '',
          dispatch_labor_expense: foundData ? foundData.dispatch_labor_expense : '',
          communication_expense: foundData ? foundData.communication_expense : '',
          work_in_progress_expense: foundData ? foundData.work_in_progress_expense : '',
          amortization_expense: foundData ? foundData.amortization_expense : ''
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
      setIsCRUDOpen(false);
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
      
      deleteCostOfSale(deleteCostOfSalesId, token)
        .then(() => {
          setCrudMessage(translate('successfullyDeleted', language))
          setIsCRUDOpen(true)
          getCostOfSale(token).then((data) => {
            console.log(data)
            setCostOfSales(data)
            setIsEditing(false)
          }).catch(() => {});
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            window.location.href = '/login' // Redirect to login if unauthorized
          } else {
            console.error('Error deleting cost of sale:', error)
          }
        })
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
      <div className='costOfSalesList_cont_wrapper'>
        <Sidebar />
        <div className='costOfSalesList_btn_wrapper'>
          <div className='costOfSalesList_top_content'>
            <div className='costOfSalesList_top_body_cont'>
              <div className='costOfSalesList_mode_switch_datalist'>
                <div className='mode-switch-container'>
                  <p className='slider-mode-switch'>
                    {isEditing ? translate('switchToDisplayMode', language) : translate('switchToEditMode', language)}
                  </p>
                  <label className='slider-switch'>
                    <input type='checkbox' checked={isEditing} onChange={handleClick} />
                    <span className='slider'></span>
                  </label>
                </div>
              </div>
            </div>
            <div className='costOfSalesList_mid_body_cont'>
              <ListButtons
                activeTabOther={activeTabOther}
                message={translate(isEditing ? 'costOfSalesEdit' : 'costOfSalesList', language)}
                handleTabsClick={handleTabsClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={[
                  { labelKey: 'project', tabKey: 'project' },
                  { labelKey: 'employeeExpenses', tabKey: 'employeeExpenses' },
                  { labelKey: 'expenses', tabKey: 'expenses' },
                  { labelKey: 'costOfSales', tabKey: 'costOfSales' },
                ]}
              />
              <div className={`costOfSalesList_table_wrapper ${isEditing ? 'editMode' : ''}`}>
                <div className='costOfSalesList_table_cont'>
                  {/* <div className='columns is-mobile'> */}
                  {/* <div className='column'> */}
                  {isEditing ? (
                    <div>
                      <table className='table is-bordered is-hoverable'>
                        <thead>
                          <tr className='costOfSalesList_table_title '>
                            <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                              {translate('year', language)}
                            </th>
                            <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                              {translate('month', language)}
                            </th>
                            <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                              {translate('purchases', language)}
                            </th>
                            <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                              {translate('outsourcingExpenses', language)}
                            </th>
                            <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                              {translate('productPurchases', language)}
                            </th>
                            <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                              {translate('dispatchLaborExpenses', language)}
                            </th>
                            <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                              {translate('communicationExpenses', language)}
                            </th>
                            <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                              {translate('workInProgressExpenses', language)}
                            </th>
                            <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                              {translate('amortizationExpenses', language)}
                            </th>
                            <th className='costOfSalesList_table_title_content_vertical has-text-centered'></th>
                          </tr>
                        </thead>
                        <tbody className='costOfSalesList_table_body'>
                          {combinedData.map((costOfSale, index) => {
                            const isNewYear = index === 0 || combinedData[index - 1].year !== costOfSale.year
                            const isLastcostOfSaleOfYear =
                              index !== combinedData.length - 1 && combinedData[index + 1].year !== costOfSale.year

                            const isEditable = costOfSale.cost_of_sale_id !== null

                            return (
                              <React.Fragment key={index}>
                                {costOfSale ? (
                                  <tr className='costOfSalesList_table_body_content_horizontal'>
                                    <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                      {costOfSale.year}
                                    </td>
                                    <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                      {costOfSale.month}
                                    </td>
                                    <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='purchase'
                                        value={formatNumberWithCommas(costOfSale.purchase)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='outsourcing_expense'
                                        value={formatNumberWithCommas(costOfSale.outsourcing_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='product_purchase'
                                        value={formatNumberWithCommas(costOfSale.product_purchase)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='dispatch_labor_expense'
                                        value={formatNumberWithCommas(costOfSale.dispatch_labor_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='communication_expense'
                                        value={formatNumberWithCommas(costOfSale.communication_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='work_in_progress_expense'
                                        value={formatNumberWithCommas(costOfSale.work_in_progress_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
                                        disabled={!isEditable}
                                      />
                                    </td>
                                    <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                      <input
                                        type='text'
                                        name='amortization_expense'
                                        value={formatNumberWithCommas(costOfSale.amortization_expense)}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={handleDisableKeysOnNumberInputs}
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
                                  <tr className='year-separator'>
                                    <td className='horizontal-line-cell' colSpan={9}>
                                      <div className='horizontal-line' />
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <table className='table is-bordered is-hoverable'>
                      <thead>
                        <tr className='costOfSalesList_table_title '>
                          <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                            {translate('year', language)}
                          </th>
                          <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                            {translate('month', language)}
                          </th>
                          <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                            {translate('purchases', language)}
                          </th>
                          <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                            {translate('outsourcingExpenses', language)}
                          </th>
                          <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                            {translate('productPurchases', language)}
                          </th>
                          <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                            {translate('dispatchLaborExpenses', language)}
                          </th>
                          <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                            {translate('communicationExpenses', language)}
                          </th>
                          <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                            {translate('workInProgressExpenses', language)}
                          </th>
                          <th className='costOfSalesList_table_title_content_vertical has-text-centered'>
                            {translate('amortizationExpenses', language)}
                          </th>
                        </tr>
                      </thead>
                      <tbody className='costOfSalesList_table_body'>
                        {combinedData.map((costOfSale, index) => {
                          const isNewYear = index === 0 || combinedData[index - 1].year !== costOfSale.year
                          const isLastcostOfSaleOfYear =
                            index !== combinedData.length - 1 && combinedData[index + 1].year !== costOfSale.year

                          return (
                            <React.Fragment key={index}>
                              <tr className='costOfSalesList_table_body_content_horizontal'>
                                <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                  {costOfSale.year || 0}
                                </td>
                                <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                  {costOfSale.month}
                                </td>
                                <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(costOfSale.purchase) || 0}
                                </td>
                                <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(costOfSale.outsourcing_expense) || 0}
                                </td>
                                <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(costOfSale.product_purchase) || 0}
                                </td>
                                <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(costOfSale.dispatch_labor_expense) || 0}
                                </td>
                                <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(costOfSale.communication_expense) || 0}
                                </td>
                                <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(costOfSale.work_in_progress_expense) || 0}
                                </td>
                                <td className='costOfSalesList_table_body_content_vertical has-text-centered'>
                                  {formatNumberWithCommas(costOfSale.amortization_expense) || 0}
                                </td>
                              </tr>
                              {isLastcostOfSaleOfYear && (
                                <tr className='year-separator'>
                                  <td className='horizontal-line-cell' colSpan={9}>
                                    <div className='horizontal-line' />
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                  {/* </div> */}
                  {/* </div> */}
                </div>
              </div>
              <div className='costOfSalesList_is_editing_wrapper'>
                <div className='costOfSalesList_is_editing_cont'>
                  {isEditing ? (
                    <div className='costOfSalesList_edit_submit_btn_cont'>
                      <button
                        className='costOfSalesList_edit_submit_btn'
                        onClick={() => {
                          setIsUpdateConfirmationOpen(true)
                        }}
                      >
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
      <CrudModal
        isCRUDOpen={isCRUDOpen}
        onClose={closeModal}
        message={crudMessage}
        validationMessages={crudValidationErrors}
      />
      <AlertModal
        isOpen={isUpdateConfirmationOpen}
        onConfirm={handleUpdateConfirm}
        onCancel={() => setIsUpdateConfirmationOpen(false)}
        message={translate('updateMessage', language)}
      />
    </div>
  )
};

export default CostOfSalesList;
