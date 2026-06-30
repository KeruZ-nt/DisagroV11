import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Edit, Mail, Shield, Trash2, User, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { CreateUserModal } from './CreateUserModal';
import { EditRoleModal } from './EditRoleModal';
import { deleteUser } from '@/lib/api/management';

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  role_id?: string;
  roles?: { name: string; is_system_admin: boolean; areas?: { name: string } };
};

export type RoleData = { id: string; name: string; areas?: { name: string } };

export function TeamList({
  team,
  isAdmin,
  availableRoles,
}: { team: TeamMember[]; isAdmin: boolean; availableRoles: RoleData[] }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      toast.success(`Usuario ${deleteTarget.name} eliminado exitosamente`);
      queryClient.invalidateQueries({ queryKey: ['teamList'] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar permanentemente a ${deleteTarget?.name}? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        isConfirming={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-400" />
            Equipo y Usuarios
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Gestiona los miembros de la empresa, roles y accesos al sistema.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-500/20"
          >
            <UserPlus className="w-5 h-5" /> Añadir Miembro
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-slate-900/50 border border-white/5 rounded-2xl shadow-xl">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-slate-950/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Área / Rol
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Fecha de Creación
                </th>
                {isAdmin && (
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {team.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center border border-white/10 overflow-hidden flex-shrink-0">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">
                          {member.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Mail className="w-4 h-4 text-slate-500" />
                      {member.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex flex-col justify-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border w-fit mb-1 ${
                        member.roles?.is_system_admin
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}
                    >
                      {member.roles?.is_system_admin ? (
                        <Shield className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      {member.roles?.name || 'Sin Rol'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {member.roles?.areas?.name || 'Sin Área'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {new Date(member.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <button
                          onClick={() => setEditingMember(member)}
                          className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Cambiar Rol"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!member.roles?.is_system_admin && (
                          <button
                            onClick={() => handleDelete(member.id, member.name)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {team.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No hay miembros en el equipo.
            </div>
          )}
        </div>
      </div>

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        availableRoles={availableRoles}
      />

      <EditRoleModal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        member={editingMember}
        availableRoles={availableRoles}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['teamList'] });
        }}
      />
    </>
  );
}
