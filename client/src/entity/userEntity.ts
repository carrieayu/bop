export default class userEntity {
    username: string | undefined
    password: string | undefined

    constructor(field: Partial<userEntity>) {
    this.username = field.username
    this.password = field.password
    }
}
