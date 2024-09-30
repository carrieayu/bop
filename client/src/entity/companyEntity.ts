export default class MasterCompanyEntity {
    company_id: string | undefined
    company_name: string | undefined

    constructor(field: Partial<MasterCompanyEntity>) {
    this.company_id = field.company_id
    this.company_name = field.company_name
    }
}
