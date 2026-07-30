"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import Button from "@/components/ui/Button";

export default function SignOutButton() {
  const { signOut } = useAuth();
  return (
    <Button onClick={signOut} size="md" variant="outline">
      Sign Out
    </Button>
  );
}
