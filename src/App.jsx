import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VillageReportPage from "./pages/VillageReportPage";
import { HOME_PATH, REPORT_PATH } from "./routes/paths";

function App() {
  return (
    <Routes>
      <Route path={HOME_PATH} element={<HomePage />} />
      <Route path={REPORT_PATH} element={<VillageReportPage />} />
      <Route path="*" element={<Navigate to={HOME_PATH} replace />} />
    </Routes>
  );
}

export default App;
