import Table from "@/components/admin/Table";
import InviteTeamMemberModal from "@/components/admin/InviteTeamMemberModal";
import TeamRoleSelect from "@/components/admin/TeamRoleSelect";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { requireAdminUser, getScopedStoreId } from "@/lib/admin-auth";
import { listTeamMembers, listStaffRoles } from "@/services/team";
import { getStores } from "@/lib/data/stores";
import { deactivateTeamMemberAction } from "./actions";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";

export const metadata = { title: "Team — Admin" };

export default async function AdminTeamPage() {
  const admin = await requireAdminUser();
  if (admin.role.name !== "admin" && admin.role.name !== "store_manager") {
    notFound();
  }

  const storeId = getScopedStoreId(admin);

  const [members, roles, stores] = await Promise.all([
    listTeamMembers(storeId || undefined),
    listStaffRoles(),
    getStores(),
  ]);

  // Serialize values for client components safely
  const serializedAdmin = JSON.parse(JSON.stringify(admin));
  const serializedStores = JSON.parse(JSON.stringify(stores));

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-charcoal">Team</h1>
        <InviteTeamMemberModal roles={roles} currentUser={serializedAdmin} stores={serializedStores} />
      </div>

      <Table
        emptyMessage="No team members yet."
        columns={[
          { header: "Name", accessor: (m) => m.name },
          { header: "Email", accessor: (m) => m.email },
          { header: "Store", accessor: (m) => m.store?.name ?? "Head Office" },
          {
            header: "Status",
            accessor: (m) => (
              <span
                className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full ${
                  !m.isActive
                    ? "text-slate bg-bordergray"
                    : m.authUid
                    ? "text-fnc-green bg-fnc-green/10"
                    : "text-fnc-blue bg-fnc-blue/10"
                }`}
              >
                {!m.isActive
                  ? "Inactive"
                  : m.authUid
                  ? "Active"
                  : "Pending — awaiting sign-up"}
              </span>
            ),
          },
          {
            header: "Role",
            accessor: (m) => (
              <TeamRoleSelect
                userId={m.id}
                currentRoleId={m.roleId}
                roles={m.role.name === "admin" ? roles : roles.filter((r) => r.name !== "admin")}
              />
            ),
          },
          {
            header: "",
            className: "text-right",
            accessor: (m) =>
              m.id !== admin.id && m.isActive ? (
                <ConfirmDialog
                  title="Deactivate this team member?"
                  description={`"${m.name}" will no longer have access to the admin dashboard. Their historical logs will be preserved.`}
                  confirmLabel="Deactivate"
                  onConfirm={deactivateTeamMemberAction.bind(null, m.id)}
                  trigger={({ onClick }) => (
                    <button
                      type="button"
                      onClick={onClick}
                      aria-label="Deactivate"
                      className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:text-fnc-red hover:bg-warmwhite transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                />
              ) : null,
          },
        ]}
        rows={members}
      />
    </div>
  );
}
