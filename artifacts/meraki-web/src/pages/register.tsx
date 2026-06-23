import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function Register() {
  const { login } = useAuth();
  useEffect(() => {
    login();
  }, []);
  return null;
}
