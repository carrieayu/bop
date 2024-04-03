import React, { useState, FormEvent } from "react";

// Interface for form data type
interface FormData<T> {
  [key: string]: T;
}

// Custom hook to manage form state and validation
export function useForm<T extends FormData<any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<T>>({});

  // Function to handle form input changes
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  };

  // Function to handle form submission
  const handleSubmit = (
    onSubmit: (data: T) => void,
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    // Perform form validation here
    const validationErrors = {};
    // ... validation logic based on data types in T
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(values);
    }
  };

  return { values, errors, handleChange, handleSubmit };
}
