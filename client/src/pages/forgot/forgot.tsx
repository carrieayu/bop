import React, { useState } from "react";
import dattLogo from  '../../assets/images/logo.png'

const Forgot = () => {
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
              <form>
                <div className='field'>
                  <p className='control'>
                    <label htmlFor='username' className='label'>
                      Email Address
                    </label>
                    <input
                      type='text'
                      className='input'
                      placeholder='Enter email address...'
                      style={{ fontFamily: 'Arial, FontAwesome' }}
                    />
                  </p>
                </div>
                <div className='field'>
                <p className='control has-text-centered'>
                    <button className='button' type='submit'>Submit</button>
                </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forgot;
