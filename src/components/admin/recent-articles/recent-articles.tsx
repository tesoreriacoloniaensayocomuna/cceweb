import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

interface RecentArticlesProps {
  updates: any[];
}

export const AdminRecentArticles = component$<RecentArticlesProps>((props) => {
  return (
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead class="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-4">Título</th>
                        <th class="px-6 py-4">Módulo</th>
                        <th class="px-6 py-4">Fecha</th>
                        <th class="px-6 py-4 text-right">Acción</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    {props.updates.length === 0 ? (
                        <tr>
                            <td colSpan={4} class="px-6 py-8 text-center text-gray-500 italic">No hay actualizaciones recientes.</td>
                        </tr>
                    ) : (
                        props.updates.map((item) => (
                            <tr key={item.id + item.type} class="hover:bg-gray-50 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded bg-primary/5 flex items-center justify-center">
                                            <span class="material-symbols-outlined text-primary text-lg">{item.icon}</span>
                                        </div>
                                        <p class="font-bold text-gray-800 line-clamp-1">{item.title}</p>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                        {item.type}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-500">
                                    {new Date(item.createdAt).toLocaleDateString('es-AR')}
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <Link href={item.adminPath} class="text-primary font-bold text-xs hover:underline">
                                        Gestionar
                                    </Link>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
});
