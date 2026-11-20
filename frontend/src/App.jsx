import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import RequestList from './pages/RequestList.jsx';
import NewRequest from './pages/NewRequest.jsx';
import RequestDetail from './pages/RequestDetail.jsx';
import EditRequest from './pages/EditRequest.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="solicitacoes" element={<RequestList />} />
        <Route path="solicitacoes/nova" element={<NewRequest />} />
        <Route path="solicitacoes/:id" element={<RequestDetail />} />
        <Route path="solicitacoes/:id/editar" element={<EditRequest />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
