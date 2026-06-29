import {
  createArea,
  createRole,
  deleteArea,
  deleteRole,
} from '@/lib/api/management';
import { useQueryClient } from '@tanstack/react-query';
import { FolderGit2, Network, Shield, Trash2 } from 'lucide-react';
import { useState } from 'react';

export type AreaData = { id: string; name: string };
export type RoleData = {
  id: string;
  name: string;
  is_system_admin: boolean;
  areas?: { name: string };
};

export function ManagementView({
  areas,
  roles,
}: { areas: AreaData[]; roles: RoleData[] }) {
  const [activeTab, setActiveTab] = useState<'areas' | 'roles'>('areas');
  const queryClient = useQueryClient();

  // Area Form
  const [areaName, setAreaName] = useState('');
  const [isSavingArea, setIsSavingArea] = useState(false);

  // Role Form
  const [roleName, setRoleName] = useState('');
  const [roleAreaId, setRoleAreaId] = useState('');
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [isSavingRole, setIsSavingRole] = useState(false);

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingArea(true);
    try {
      await createArea(areaName);
      queryClient.invalidateQueries({ queryKey: ['rolesAndAreas'] });
      setAreaName('');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSavingArea(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRole(true);
    try {
      if (!roleAreaId) throw new Error('Debes seleccionar un área');
      await createRole(roleName, roleAreaId, isSystemAdmin);
      queryClient.invalidateQueries({ queryKey: ['rolesAndAreas'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setRoleName('');
      setIsSystemAdmin(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSavingRole(false);
    }
  };

  return (
    <div className="h-full flex flex-col pb-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Network className="w-8 h-8 text-emerald-400" />
            Gestión de Áreas y Roles
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Define la estructura de la empresa para agrupar usuarios y permisos.
          </p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-white/10 mb-6">
        <button
          onClick={() => setActiveTab('areas')}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'areas'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Áreas (Departamentos)
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'roles'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Roles (Cargos)
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
        {activeTab === 'areas' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-slate-900/50 border border-white/5 rounded-2xl p-6 h-fit">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-emerald-400" />
                Nueva Área
              </h3>
              <form onSubmit={handleCreateArea} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400">
                    Nombre del Área
                  </label>
                  <input
                    required
                    type="text"
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Ej. Ventas Norte"
                  />
                </div>
                <button
                  disabled={isSavingArea}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all"
                >
                  {isSavingArea ? 'Guardando...' : 'Crear Área'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">
                      Nombre del Área
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {areas.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        No hay áreas creadas
                      </td>
                    </tr>
                  )}
                  {areas.map((area) => (
                    <tr key={area.id} className="hover:bg-white/5 group">
                      <td className="px-6 py-4 text-slate-200 font-medium">
                        {area.name}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={async () => {
                            await deleteArea(area.id);
                            queryClient.invalidateQueries({
                              queryKey: ['rolesAndAreas'],
                            });
                          }}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-slate-900/50 border border-white/5 rounded-2xl p-6 h-fit">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                Nuevo Rol
              </h3>
              <form onSubmit={handleCreateRole} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400">
                    Nombre del Rol
                  </label>
                  <input
                    required
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Ej. Gerente de Cuentas"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400">
                    Pertenece al Área
                  </label>
                  <select
                    required
                    value={roleAreaId}
                    onChange={(e) => setRoleAreaId(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                  >
                    <option value="" disabled>
                      Selecciona un área...
                    </option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id} className="bg-slate-900">
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-3 p-3 bg-black/20 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={isSystemAdmin}
                    onChange={(e) => setIsSystemAdmin(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 bg-slate-900 border-white/20 rounded focus:ring-emerald-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-sm text-slate-300">
                    Otorgar privilegios de Administrador del Sistema
                  </span>
                </label>
                <button
                  disabled={isSavingRole}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all"
                >
                  {isSavingRole ? 'Guardando...' : 'Crear Rol'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">
                      Área
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">
                      Permisos
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {roles.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        No hay roles creados
                      </td>
                    </tr>
                  )}
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-white/5 group">
                      <td className="px-6 py-4 text-slate-200 font-medium">
                        {role.name}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {role.areas?.name}
                      </td>
                      <td className="px-6 py-4">
                        {role.is_system_admin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-500/10 text-slate-400 border-slate-500/20">
                            Estándar
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={async () => {
                            await deleteRole(role.id);
                            queryClient.invalidateQueries({
                              queryKey: ['rolesAndAreas'],
                            });
                            queryClient.invalidateQueries({
                              queryKey: ['roles'],
                            });
                          }}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
