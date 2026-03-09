import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AssessmentManagement: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/subject-head/dashboard", {
      replace: true,
      state: { activeTab: "syllabus-assessment" },
    });
  }, [navigate]);
  return null;
};

export default AssessmentManagement;
