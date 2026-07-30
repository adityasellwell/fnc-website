import Table from "@/components/admin/Table";
import InviteTeamMemberModal from "@/components/admin/InviteTeamMemberModal";
import TeamRoleSelect from "@/components/admin/TeamRoleSelect";
import { requireFullAdminUser } from "@/lib/admin-auth";
import { listTeamMembers, listStaffRoles } from "@/services/team";

export const metadata = { title: "Team — Admin" };

export default async function AdminTeamPage() {
  // Only full admins can view/manage this screen — store_manager/staff
  // never see it, so they can't promote themselves or anyone else.
  await requireFullAdminUser();

  const [members, roles] = await Promise.all([listTeamMembers(), listStaffRoles()]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-charcoal">Team</h1>
        <InviteTeamMemberModal roles={roles} />
      </div>

      <Table
        emptyMessage="No team members yet."
        columns={[
          { header: "Name", accessor: (m) => m.name },
          { header: "Email", accessor: (m) => m.email },
          {
            header: "Status",
            accessor: (m) => (
              <span
                className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full ${
                  m.clerkId ? "text-fnc-green bg-fnc-green/10" : "text-fnc-blue bg-fnc-blue/10"
                }`}
              >
                {m.clerkId ? "Active" : "Pending — awaiting sign-up"}
              </span>
            ),
          },
          {
            header: "Role",
            accessor: (m) => <TeamRoleSelect userId={m.id} currentRoleId={m.roleId} roles={roles} />,
          },
        ]}
        rows={members}
      />

      <p className="font-body text-xs text-slate mt-4">
        Removing access isn&apos;t built yet — change someone&apos;s role here if their access level
        changes. To fully remove a team member, ask your developer for now.
      </p>
    </div>
  );
}
