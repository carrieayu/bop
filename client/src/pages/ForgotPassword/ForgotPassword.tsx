import React, { useState } from "react";
import dattLogo from  '../../assets/images/logo.png'
import axios from "axios";
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import CrudModal from '../../components/CrudModal/CrudModal'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { language, setLanguage } = useLanguage()
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [crudValidationErrors, setCrudValidationErrors] = useState([])

  const openModal = () => {
    setModalIsOpen(true)
  }

  const closeSuccessModal = () => {
    setModalIsOpen(false)
    window.location.href = '/login' // Redirect to login if mail sent was successful
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${getReactActiveEndpoint()}/api/password-forgot/`, { email })
      setIsModalOpen(true)
      setModalMessage(translate('MailSentSuccess', language))
      
      setSuccessMessage(response.data.message)
    } catch (error) {
      setIsModalOpen(true)
      setModalMessage(translate('invalidInputOrEmailDoesNotExist', language))
      setError(error.response.data.message);
    }
    setLoading(false);
  };
  return (
    <div className='container'>
      <div className='card-box'>
        <div className='card-content'>
          <div className='left-content'>
            <div className='logo'>
              <img src={dattLogo} alt='Datt Japan Logo' />
            </div>
          </div>

          <div className='line'>
            <div className='line-content-a'></div>
            <div className='line-content'></div>
          </div>

          <div className='right-content'>
            <div className='form'>
              <form onSubmit={handleSubmit}>
                <div className='field'>
                  <p className='control'>
                    <label htmlFor='username' className='label'>
                      Email Address
                    </label>
                    <input
                      type='text'
                      className='input'
                      placeholder='Enter email address...'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ fontFamily: 'Arial, FontAwesome' }}
                    />
                  </p>
                </div>
                {/* {error && (
                  <p className='has-text-danger' style={{ color: 'red', textAlign: 'center' }}>
                    {error}
                  </p>
                )} */}
                {/* {successMessage && (
                  <p className='has-text-success' style={{ color: 'green', textAlign: 'center' }}>
                    {successMessage}
                  </p>
                )} */}
                <div className='field'>
                  <p className='control has-text-centered'>
                    <button className='button' type='submit' disabled={loading}>
                      {loading ? 'Loading...' : 'Submit'}
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <CrudModal
        message={modalMessage}
        onClose={closeSuccessModal}
        isCRUDOpen={isModalOpen}
        validationMessages={crudValidationErrors}
      />
    </div>
  )
};

export default ForgotPassword;
