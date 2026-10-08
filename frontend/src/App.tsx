import { AppShell } from "@/components/layout/app-shell";
import { EmployeeListPage } from "@/features/employees/pages/EmployeeListPage";
import { PayslipPage } from "@/features/payroll/pages/PayslipPage";
import { useEffect, useState } from "react";

function App() {
  const [section, setSection] = useState(currentSection);

  useEffect(() => {
    const onHashChange = () => setSection(currentSection());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <AppShell activeSection={section}>
      {section === "payroll" ? <PayslipPage /> : <EmployeeListPage />}
    </AppShell>
  );
}

function currentSection(): "employees" | "payroll" {
  return window.location.hash === "#payroll" ? "payroll" : "employees";
}

export default App;
