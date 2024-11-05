import React, { useState } from 'react'
import dattLogo from '../../assets/images/logo.png'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import AlertModal from '../../components/AlertModal/AlertModal'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import CrudModal from '../../components/CrudModal/CrudModal'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

const ResetPassword = () => {
  const { uid, token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const { language, setLanguage } = useLanguage()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [isModalOpenRedirect, setIsModalOpenRedirect] = useState(false)
  const [modalMessageRedirect, setModalMessageRedirect] = useState('')

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const redirect = () => {
    setIsModalOpen(false)
    navigate('/login', { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
    if (!passwordRegex.test(password)) {
      setModalMessage(
        'Passwords must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character.',
      )
      setIsModalOpen(true)
      return
    } 

    if (password !== passwordConfirm) {
      alert('Password Not Matched')
      setError('Password and confirm password do not match.')
      return
    }

    try {
      const response = await axios.put(`${getReactActiveEndpoint()}/api/password-reset/${uid}/${token}/`, {
        password,
      })
      setModalMessageRedirect('Password has been reset.')
      setIsModalOpenRedirect(true)
      
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred.')
    }
  }

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
                    <label htmlFor='password' className='label'>
                      Password
                    </label>
                    <input
                      type='password'
                      className='input'
                      placeholder='Enter password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ fontFamily: 'Arial, FontAwesome' }}
                    />
                  </p>
                </div>
                <div className='field'>
                  <p className='control'>
                    <label htmlFor='password-confirm' className='label'>
                      Confirm Password
                    </label>
                    <input
                      type='password'
                      className='input'
                      placeholder='Re-enter pasword'
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      style={{ fontFamily: 'Arial, FontAwesome' }}
                    />
                  </p>
                </div>
                {error && (
                  <div className='error' style={{ color: 'red', textAlign: 'center' }}>
                    {error}
                  </div>
                )}
                {success && <div className='success'>{success}</div>}
                <div className='field'>
                  <p className='control has-text-centered'>
                    <button className='button' type='submit'>
                      Submit
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <CrudModal message={modalMessage} onClose={closeModal} isCRUDOpen={isModalOpen} />
      <CrudModal message={modalMessageRedirect} onClose={redirect} isCRUDOpen={isModalOpenRedirect} />
    </div>
  )
}

export default ResetPassword
