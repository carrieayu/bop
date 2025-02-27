import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../app/store'
import { useEffect, useState } from 'react'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useTranslateSwitch = (language: string) => {
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  return { isTranslateSwitchActive, setIsTranslateSwitchActive }
}

// Forms Add + / Remove -

export const addFormInput = (formData, setFormData, maximumEntries, emptyFormData) => {
  if (formData.length < maximumEntries) {
    setFormData([...formData, { ...emptyFormData }])
  } else {
    console.log('You can only add up to 10 forms.')
  }
  return { formData }
}

export const removeFormInput = (formData, setFormData) => {
  if (formData.length > 1) {
    setFormData(formData.slice(0, -1))
  }
}

export const openModal = (setModalisOpen) => {
  setModalisOpen(true)
}

export const closeModal = (setModalisOpen) => {
  setModalisOpen(false)
}
