import { createSlice } from '@reduxjs/toolkit'
import { userType } from '../../reducers/user/user'


const initialState: userType = {
    userEntity: [],
    isError: false,
    status: 'idle',
    error: null,
}

const userSlice = createSlice({
    name: 'user',
    initialState :initialState,
    reducers: {
        login: (state, action) =>{
            state.userEntity = action.payload;
        },
    },
})

// Export actions and reducer
export const { login } = userSlice.actions;
export default userSlice.reducer