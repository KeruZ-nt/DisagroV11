import { Building2, Mail, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { ClientHistoryModal } from './ClientHistoryModal';

export function ClientRow({
  client,
  isAdmin,
  children,
}: { client: any; isAdmin: boolean; children: React.ReactNode }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
        onClick={() => setIsHistoryOpen(true)}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
              <User className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="font-medium text-slate-200">{client.name}</div>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                {client.company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {client.company}
                  </span>
                )}
                {client.location && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {client.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="space-y-1">
            {client.email && (
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> {client.email}
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> {client.phone}
              </div>
            )}
            {!client.email && !client.phone && (
              <span className="text-sm text-slate-500 italic">Sin datos</span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 max-w-xs">
          <p
            className="text-xs text-slate-400 line-clamp-2"
            title={client.notes}
          >
            {client.notes || (
              <span className="italic opacity-50">Sin descripción</span>
            )}
          </p>
        </td>
        {isAdmin && (
          <td className="px-6 py-4">
            <span className="text-sm text-slate-300">
              {client.users?.name || (
                <span className="text-slate-500 italic">Sin asignar</span>
              )}
            </span>
          </td>
        )}
        <td className="px-6 py-4 text-sm text-slate-400">
          {new Date(client.created_at).toLocaleDateString('es-ES')}
        </td>

        {isAdmin && (
          <td
            className="px-6 py-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {children}
            </div>
          </td>
        )}
      </tr>

      {isHistoryOpen && (
        <ClientHistoryModal
          client={client}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </>
  );
}
