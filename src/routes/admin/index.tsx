import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link } from '@builder.io/qwik-city';
import { getDb } from '../../database/db';
import { news, tourismItems, regulations, services, procedures, pageViews } from '../../database/schema';
import { count, desc, gte } from 'drizzle-orm';

export const useGetDashboardData = routeLoader$(async (event) => {
  try {
    const db = getDb(event.env);
    
    // Consultas de conteo
    const [
      newsCount, tourismCount, regsCount, servicesCount, proceduresCount,
      viewsToday, viewsMonth, popularResult
    ] = await Promise.all([
      db.select({ value: count() }).from(news).catch(() => [{ value: 0 }]),
      db.select({ value: count() }).from(tourismItems).catch(() => [{ value: 0 }]),
      db.select({ value: count() }).from(regulations).catch(() => [{ value: 0 }]),
      db.select({ value: count() }).from(services).catch(() => [{ value: 0 }]),
      db.select({ value: count() }).from(procedures).catch(() => [{ value: 0 }]),
      db.select({ value: count() }).from(pageViews).where(gte(pageViews.timestamp, new Date(new Date().setHours(0,0,0,0)))).catch(() => [{ value: 0 }]),
      db.select({ value: count() }).from(pageViews).where(gte(pageViews.timestamp, new Date(new Date().getFullYear(), new Date().getMonth(), 1))).catch(() => [{ value: 0 }]),
      db.select({ category: pageViews.category, count: count() })
        .from(pageViews)
        .groupBy(pageViews.category)
        .orderBy(desc(count()))
        .limit(1)
        .catch(() => [])
    ]);

    const totalContent = (newsCount[0]?.value || 0) + (tourismCount[0]?.value || 0) + 
                         (regsCount[0]?.value || 0) + (servicesCount[0]?.value || 0) +
                         (proceduresCount[0]?.value || 0);

    const popularSectionMap: Record<string, string> = {
        'news': 'Noticias',
        'tourism': 'Turismo',
        'regulations': 'Normativas',
        'services': 'Servicios',
        'procedures': 'Trámites',
        'home': 'Inicio',
        'claim': 'Reclamos'
    };

    const popularSection = popularResult[0]?.category ? (popularSectionMap[popularResult[0].category] || popularResult[0].category) : 'Sin datos';

    // Consultas de items recientes
    const [rNews, rTourism, rRegs, rServices, rProcedures] = await Promise.all([
        db.select().from(news).orderBy(desc(news.createdAt)).limit(2).catch(() => []),
        db.select().from(tourismItems).orderBy(desc(tourismItems.createdAt)).limit(2).catch(() => []),
        db.select().from(regulations).orderBy(desc(regulations.createdAt)).limit(2).catch(() => []),
        db.select().from(services).orderBy(desc(services.createdAt)).limit(2).catch(() => []),
        db.select().from(procedures).orderBy(desc(procedures.createdAt)).limit(2).catch(() => [])
    ]);

    const mapItem = (i: any, type: string, icon: string, adminPath: string, publicPath: string) => ({
        id: i.id,
        title: i.title,
        type,
        icon,
        adminPath,
        publicPath,
        createdAt: i.createdAt instanceof Date ? i.createdAt.getTime() : (i.createdAt ? new Date(i.createdAt).getTime() : 0)
    });

    const allRecent = [
      ...rNews.map(i => mapItem(i, 'Noticia', 'newspaper', `/admin/noticias/${i.id}`, `/noticias/${i.slug}`)),
      ...rTourism.map(i => mapItem(i, 'Turismo', 'map', `/admin/turismo/editar/${i.id}`, `/turismo/${i.slug}`)),
      ...rRegs.map(i => mapItem(i, 'Normativa', 'gavel', `/admin/normativas/${i.id}/`, `/transparencia/normativas/`)),
      ...rServices.map(i => mapItem(i, 'Servicio', 'dry_cleaning', `/admin/servicios/editar/${i.id}`, `/servicios/${i.slug}`)),
      ...rProcedures.map(i => mapItem(i, 'Trámite', 'description', `/admin/tramites/editar/${i.id}`, `/tramites/${i.slug}`))
    ].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 6);

    return {
      stats: {
        totalContent,
        viewsToday: viewsToday[0]?.value || 0,
        viewsMonth: viewsMonth[0]?.value || 0,
        popularSection
      },
      recentUpdates: JSON.parse(JSON.stringify(allRecent))
    };
  } catch (error) {
    console.error("Dashboard Loader Fatal Error:", error);
    return {
      stats: { totalContent: 0, viewsToday: 0, viewsMonth: 0, popularSection: 'Error' },
      recentUpdates: []
    };
  }
});

export default component$(() => {
  const data = useGetDashboardData();

  const formatDate = (ts: any) => {
    if (!ts) return 'N/A';
    const d = new Date(ts);
    if (isNaN(d.getTime()) || d.getTime() === 0) return 'N/A';
    return d.toLocaleDateString('es-AR');
  };

  return (
    <div class="max-w-6xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard General</h1>
        <p class="text-gray-500 mt-1">Resumen en tiempo real del estado de la plataforma comunal.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2 transition-all hover:border-primary/20">
            <div class="flex items-center justify-between">
                <span class="material-symbols-outlined text-primary bg-blue-50 p-2 rounded-lg">article</span>
                <span class="text-[10px] font-bold text-blue-500 uppercase">Activos</span>
            </div>
            <div>
                <p class="text-sm text-gray-500 font-medium">Contenido Total</p>
                <h4 class="text-3xl font-bold text-gray-900">{data.value.stats.totalContent}</h4>
            </div>
        </div>
        
        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2 transition-all hover:border-green-200">
            <div class="flex items-center justify-between">
                <span class="material-symbols-outlined text-green-600 bg-green-50 p-2 rounded-lg">visibility</span>
                <span class="text-[10px] font-bold text-green-500 uppercase">Hoy</span>
            </div>
            <div>
                <p class="text-sm text-gray-500 font-medium">Visitas</p>
                <h4 class="text-3xl font-bold text-gray-900">{data.value.stats.viewsToday}</h4>
            </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2 transition-all hover:border-amber-200">
            <div class="flex items-center justify-between">
                <span class="material-symbols-outlined text-amber-600 bg-amber-50 p-2 rounded-lg">calendar_month</span>
                <span class="text-[10px] font-bold text-amber-500 uppercase">Mes</span>
            </div>
            <div>
                <p class="text-sm text-gray-500 font-medium">Visitas</p>
                <h4 class="text-3xl font-bold text-gray-900">{data.value.stats.viewsMonth}</h4>
            </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2 transition-all hover:border-purple-200">
            <div class="flex items-center justify-between">
                <span class="material-symbols-outlined text-purple-600 bg-purple-50 p-2 rounded-lg">trending_up</span>
                <span class="text-[10px] font-bold text-purple-500 uppercase">Top</span>
            </div>
            <div>
                <p class="text-sm text-gray-500 font-medium">Sección</p>
                <h4 class="text-2xl font-bold text-gray-900 truncate">{data.value.stats.popularSection}</h4>
            </div>
        </div>
      </div>
      
      <div class="mt-12">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">history</span>
                Últimas Actualizaciones
            </h2>
            <div class="h-px flex-1 bg-gray-100 mx-6"></div>
        </div>
        
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-100">
                        <tr>
                            <th class="px-6 py-4">Contenido</th>
                            <th class="px-6 py-4">Módulo</th>
                            <th class="px-6 py-4">Fecha</th>
                            <th class="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        {data.value.recentUpdates.map((item: any) => (
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
                                    <span class="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-1 rounded">
                                        {item.type}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-500 font-medium">
                                    {formatDate(item.createdAt)}
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <Link 
                                            href={item.adminPath} 
                                            class="p-2 text-gray-400 hover:text-primary transition-colors"
                                            title="Editar"
                                        >
                                            <span class="material-symbols-outlined text-xl">edit</span>
                                        </Link>
                                        <a 
                                            href={item.publicPath} 
                                            target="_blank" 
                                            class="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                            title="Ver en la web"
                                        >
                                            <span class="material-symbols-outlined text-xl">visibility</span>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {data.value.recentUpdates.length === 0 && (
                             <tr>
                                <td colSpan={4} class="px-6 py-12 text-center text-gray-400 italic">
                                    <span class="material-symbols-outlined text-4xl block mb-2 opacity-20">inventory_2</span>
                                    No hay actividad reciente para mostrar.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
});
