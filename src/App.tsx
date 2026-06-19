import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import MealPlanPage from "@/pages/MealPlan";
import ShoppingListPage from "@/pages/ShoppingList";
import TemplatesPage from "@/pages/Templates";
import ExportPage from "@/pages/Export";
import CollaborationPage from "@/pages/Collaboration";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<MealPlanPage />} />
          <Route path="/shopping-list" element={<ShoppingListPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="/collaboration" element={<CollaborationPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
