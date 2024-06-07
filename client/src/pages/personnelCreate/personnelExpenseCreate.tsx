import React, { useEffect, useState } from 'react';
import Btn from '../../components/Button/Button';
import { fetchPersonnelData } from '../../reducers/personnel/personnelSlice';
import { fetchPlanning } from '../../reducers/personnel/personnelPlanningSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { UnknownAction } from 'redux';
import axios from 'axios';

const PersonnelExpenseCreate = () => {
  const dispatch = useDispatch();
  const [personnelList, setPersonnelList] = useState<any>([]);
  const personnel = useSelector((state: RootState) => state.personnelData.personnel);
  const personnelPlanning = useSelector((state: RootState) => state.personnelPlanning.personnelPlanning);

  const [containers, setContainers] = useState([{
    employeeName: '',
    user_id: '',
    projects: [{ projectName: '', project_planning_id: '', client_id: '', unit_price: '', ratio: '' }]
  }]);

  const fetchData = async () => {
    try {
      const resPersonnel = await dispatch(fetchPersonnelData() as unknown as UnknownAction);
      console.log('fetchPersonnel response:', resPersonnel);
      setPersonnelList(resPersonnel.payload);
      const resPersonPlanning = await dispatch(fetchPlanning() as unknown as UnknownAction);
      console.log('fetchPlanning response:', resPersonPlanning);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddContainer = () => {
    if (containers.length < 5) {
      setContainers([...containers, {
        employeeName: '',
        user_id: '',
        projects: [{ projectName: '', project_planning_id: '', client_id: '', unit_price: '', ratio: '' }]
      }]);
    }
  };

  const handleRemoveContainer = () => {
    if (containers.length > 1) {
      const newContainers = [...containers];
      newContainers.pop();
      setContainers(newContainers);
    }
  };

  const handleAddProject = (containerIndex) => {
    const newContainers = [...containers];
    if (newContainers[containerIndex].projects.length < 5) {
      newContainers[containerIndex].projects.push({ projectName: '', project_planning_id: '', client_id: '', unit_price: '', ratio: '' });
      setContainers(newContainers);
    }
  };

  const handleInputChange = (containerIndex, projectIndex, event) => {
    const { name, value } = event.target;
    const newContainers = [...containers];
    if (projectIndex === null) {
      newContainers[containerIndex][name] = value;

      // Update user_id when employeeName is selected
      if (name === 'employeeName') {
        const selectedPerson = personnel.find(person => person.username === value);
        newContainers[containerIndex]['user_id'] = selectedPerson ? selectedPerson.user_id : '';
      }

    } else {
      newContainers[containerIndex].projects[projectIndex][name] = value;

      // Update project_planning_id and client_id when projectName is selected
      if (name === 'projectName') {
        const selectedProject = personnelPlanning.find(plan => plan.planning_project_name === value);
        newContainers[containerIndex].projects[projectIndex]['project_planning_id'] = selectedProject ? selectedProject.planning_project_id : '';
        newContainers[containerIndex].projects[projectIndex]['client_id'] = selectedProject ? selectedProject.client_id : '';
      }
    }
    setContainers(newContainers);
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const transformedData = containers.flatMap(container => 
      container.projects.map(project => ({
        client_id: project.client_id,
        assignment_ratio: project.ratio,
        assignment_unit_price: project.unit_price,
        planning_project_id: project.project_planning_id,
        assignment_user_id: container.user_id,
        employeeName: container.employeeName // Include any additional fields if necessary
      }))
    );

    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/personnelplanning/add/', transformedData, {
        headers: {
          'Authorization': `Bearer ${token}`  // Add token to request headers
        }
      });
      console.log(response.data);
      alert('Saved');
      window.location.reload();
      // Reset the form or handle success accordingly
    } catch (error) {
      console.error('Error:', error.response.data);
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit} className="personnel-wrapper">
      {containers.map((container, containerIndex) => (
        <div className="personnel-container" key={containerIndex}>
          <div className="personnel-cont-body">
            <div className="personnel-row">
              <div className="personnel-label">
                <p>従業員</p>
              </div>
              <div className="personnel-card-box">
                <select
                  name="employeeName"
                  className="emp-select"
                  value={container.employeeName}
                  onChange={(e) => handleInputChange(containerIndex, null, e)}
                >
                  <option value="">従業員の選択</option>
                  {personnel.map((person, index) => (
                    <option key={index} value={person.username}>
                      {person.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="project-fields">
              {container.projects.map((project, projectIndex) => (
                <div className="project-group" key={projectIndex}>
                  <div className="personnel-row">
                    <div className="personnel-label">
                      <p>案件</p>
                    </div>
                    <div className="personnel-card-box">
                      <select
                        name="projectName"
                        value={project.projectName}
                        onChange={(e) => handleInputChange(containerIndex, projectIndex, e)}
                      >
                        <option value=""></option>
                        {personnelPlanning.map((person_plan, index) => (
                          <option key={index} value={person_plan.planning_project_name}>
                            {person_plan.planning_project_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="personnel-row">
                    <div className="personnel-label">
                      <p>人件費</p>
                    </div>
                    <div className="personnel-card-box">
                      <input
                        type="number"
                        name="unit_price"
                        value={project.unit_price}
                        onChange={(e) => handleInputChange(containerIndex, projectIndex, e)}
                      />
                    </div>
                  </div>
                  <div className="personnel-row">
                    <div className="personnel-label">
                      <p>割合</p>
                    </div>
                    <div className="personnel-card-box">
                      <input
                        type="number"
                        name="ratio"
                        value={project.ratio}
                        onChange={(e) => handleInputChange(containerIndex, projectIndex, e)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="button-box">
              <Btn
                label="追加"
                className="button"
                type="button"
                onClick={() => handleAddProject(containerIndex)}
              />
            </div>
          </div>
        </div>
      ))}
      <div className="personnel-cont-footer">
        <Btn label="+" className="plus-btn" type="button" onClick={handleAddContainer} />
        <Btn label="-" className="minus-btn" type="button" onClick={handleRemoveContainer} />
        <Btn label="キャンセル" className="cancel-btn" type="button" onClick={() => alert('cancel')} />
        <Btn label="登録" className="cancel-btn" type="submit" onClick={() => ''} />
        {/* <button className="save-btn" type='submit'>Save</button> */}
      </div>
    </form>
  );
};

export default PersonnelExpenseCreate;
