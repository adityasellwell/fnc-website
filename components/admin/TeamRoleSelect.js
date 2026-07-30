"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateTeamMemberRoleAction } from "@/app/admin/team/actions";

export default function TeamRoleSelect({ userId, currentRoleId, roles }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={currentRoleId}
        disabled={pending}
        onChange={(e) => startTransition(() => updateTeamMemberRoleAction(userId, e.target.value))}
        className="h-9 px-3 rounded-lg border border-bordergray bg-white font-body text-sm text-charcoal focus:border-fnc-red focus:outline-none transition-colors disabled:opacity-60"
      >
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name.replace("_", " ")}
          </option>
        ))}
      </select>
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate" />}
    </div>
  );
}
