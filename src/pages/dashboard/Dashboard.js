import React from 'react';

// modal compoenents
import JoinRoomModal from '../../components/modal/joinRoom/JoinRoomContainer.js';
import CreateRoomModal from '../../components/modal/createRoom/CreateRoomContainer.js';

const Dashboard = (props) => {
    let joinClickHandler = props.joinClickHandler;
    let createClickHandler = props.createClickHandler;
    let logoutClickHandler = props.logoutClickHandler;
    let profileClickHandler = props.profileClickHandler;
    
    let joinIsActive = props.joinIsActive;
    let joinSetIsActive = props.joinSetIsActive;
    let createIsActive = props.createIsActive;
    let createSetIsActive = props.createSetIsActive;

    return(
        <div className="dashboard">
            <div className="dashboard-wrapper">
                <span className='normal-2 dashboard__logout' onClick={e => logoutClickHandler(e)}>Logout</span>
                <h1>hellochat</h1>

                <div className="dashboard__buttons">
                    <button onClick={e => joinClickHandler(e)}><h2>join room</h2></button>
                    <button onClick={e => createClickHandler(e)}><h2>create room</h2></button>
                    <button onClick={e => profileClickHandler(e)}><h2>profile</h2></button>
                </div>
            </div>

            <JoinRoomModal
                isActive = {joinIsActive}
                setIsActive = {joinSetIsActive}
            /> 

            <CreateRoomModal
                isActive = {createIsActive}
                setIsActive = {createSetIsActive}
            />
        </div>
    )
}

export default Dashboard;