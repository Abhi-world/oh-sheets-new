import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import ConnectMonday from './pages/ConnectMonday';
import ConnectSheets from './pages/ConnectSheets';
import MondayOAuth from './pages/MondayOAuth';
import InstallationFlow from './components/installation/InstallationFlow';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/connect-monday" element={<ConnectMonday />} />
        <Route path="/connect-sheets" element={<ConnectSheets />} />
        <Route path="/monday-oauth" element={<MondayOAuth />} />
        <Route path="/install" element={<InstallationFlow />} />
      </Routes>
    </Router>
  );
}

export default App;