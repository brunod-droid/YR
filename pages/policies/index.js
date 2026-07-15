import { useEffect } from "react";

export default function PoliciesRedirect() {
  useEffect(() => {
    window.location.href = "/customer-service-policies";
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      Redirecting to Customer Service Policies...
    </div>
  );
}
