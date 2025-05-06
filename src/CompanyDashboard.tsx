import React from "react";
import JobbVareUttak from "./JobbVareUttak";

interface CompanyDashboardProps {
  firmaId: string;
  mobilvisning: boolean;
}

const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ firmaId, mobilvisning }) => {
  return <JobbVareUttak verkstedId={firmaId} mobilvisning={mobilvisning} />;
};

export default CompanyDashboard;
