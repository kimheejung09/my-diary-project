import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import TodoPage from "./TodoPage";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/todo" element={<TodoPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
