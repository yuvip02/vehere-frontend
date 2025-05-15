import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TablesPage from "./pages/TablesPage";
import ProbeStats from "./components/Profile";
import Navbar from "./components/Navbar";
import FileCount from "./pages/FileCount";
import LogstashFileCountPage from "./pages/LogstashFileCountPage";
import ServicesPage from "./pages/ServicesPage";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="pl-28 flex align-middle justify-center bg-gray-100">
        <Routes>
          <Route path="/" element={<ProbeStats />} />{" "}
          {/* Probe Stats on Homepage */}
          <Route path="/table" element={<TablesPage />} />
          <Route path="/file-count" element={<FileCount />} />
          <Route
            path="/logstash-file-count"
            element={<LogstashFileCountPage />}
          />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
