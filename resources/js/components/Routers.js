import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from "./Home";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Faculty from "./Faculty";
import Student from "./Student";
import Department from "./Department";



export default function Routers() {
    return (
        <Router>
            <div className="page-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/faculty" element={<Faculty />} />
                    <Route path="/student" element={<Student />} />
                    <Route path="/department" element={<Department />} />



                </Routes>
            </div>
        </Router>
    );
}

if (document.getElementById('root')) {
    ReactDOM.render(<Routers />, document.getElementById('root')); 
}