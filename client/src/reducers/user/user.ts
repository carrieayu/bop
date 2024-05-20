import userEntity from '../../entity/userEntity'


export type userType = {
    userEntity: userEntity[]
    isError: boolean
    status: string
    error: any
}
