export default class BusinessDivisionsEntity {
    business_division_id: string | undefined
    business_division_name: string | undefined

    constructor(field: Partial<BusinessDivisionsEntity>) {
        this.business_division_id = field.business_division_id
        this.business_division_name = field.business_division_name
    }
}
