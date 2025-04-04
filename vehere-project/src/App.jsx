import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TablesPage from "./pages/TablesPage";
import ProbeStats from "./components/Profile";
import Navbar from "./components/Navbar";
import FileCount from "./pages/FileCount";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="flex align-middle justify-center bg-gray-100">
        <Routes>
          <Route path="/" element={<ProbeStats />} />{" "}
          {/* Probe Stats on Homepage */}
          <Route path="/table" element={<TablesPage />} />
          <Route path="/file-count" element={<FileCount />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
