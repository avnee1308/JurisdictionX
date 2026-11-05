import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import CitizenDashboard from './pages/CitizenDashboard'
import SubmitComplaint from './pages/SubmitComplaint'
import ComplaintDetails from './pages/ComplaintDetails'
import DepartmentDashboard from './pages/DepartmentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import KnowledgeGraph from './pages/KnowledgeGraph'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<Layout />}>
        <Route path="/citizen" element={<CitizenDashboard />} />
        <Route path="/citizen/submit" element={<SubmitComplaint />} />
        <Route path="/complaints/:id" element={<ComplaintDetails />} />
        <Route path="/department" element={<DepartmentDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/graph" element={<KnowledgeGraph />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
