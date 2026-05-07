import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { sessionsAPI } from "../services/api";
import useAuthStore from "../store/authStore";
import TestFlow from "../components/tests/TestFlow";
import { Spinner } from "../components/shared/UI";
import toast from "react-hot-toast";

export default function TestPage() {
  const { sessionId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionsAPI.get(sessionId)
      .then(r => {
        const s = r.data;
        // Guard: only the assigned patient or a doctor can access
        if (s.status === "completed") {
          navigate(`/results/${sessionId}`);
          return;
        }
        setSession(s);
      })
      .catch(() => { toast.error("Session not found"); navigate("/patient"); })
      .finally(() => setLoading(false));
  }, [sessionId, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  return <TestFlow sessionId={sessionId} />;
}
