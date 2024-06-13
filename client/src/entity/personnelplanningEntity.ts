export default class PersonnelPlanningEntity{
    planning_project_id: string | undefined
    planning_project_name: string | undefined
    client_id: string | undefined
    constructor(data: Partial<PersonnelPlanningEntity>) {
        this.planning_project_id = data.planning_project_id
        this.planning_project_name = data.planning_project_name
        this.client_id = data.client_id
    }
}