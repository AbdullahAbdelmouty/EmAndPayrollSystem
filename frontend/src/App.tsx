import { AppShell } from "@/components/layout/app-shell";
import { EmployeeListPage } from "@/features/employees/pages/EmployeeListPage";

function App() {
  return (
    <AppShell activeSection="employees"><EmployeeListPage /></AppShell>
  );
}

export default App;
