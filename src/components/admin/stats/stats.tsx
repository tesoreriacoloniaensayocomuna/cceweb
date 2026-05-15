import { component$ } from '@builder.io/qwik';

interface StatsProps {
  totalContent: number;
  viewsToday: number;
  viewsMonth: number;
  popularSection: string;
}

export const AdminStats = component$<StatsProps>((props) => {
  return (
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="material-symbols-outlined text-primary bg-blue-50 p-2 rounded-lg">article</span>
          <span class="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Activo</span>
        </div>
        <div>
          <p class="text-sm text-gray-500 font-medium">Contenido Total</p>
          <h4 class="text-2xl font-bold text-gray-900">{props.totalContent}</h4>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="material-symbols-outlined text-green-600 bg-green-50 p-2 rounded-lg">visibility</span>
        </div>
        <div>
          <p class="text-sm text-gray-500 font-medium">Visitas Hoy</p>
          <h4 class="text-2xl font-bold text-gray-900">{props.viewsToday}</h4>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="material-symbols-outlined text-amber-600 bg-amber-50 p-2 rounded-lg">calendar_month</span>
        </div>
        <div>
          <p class="text-sm text-gray-500 font-medium">Visitas del Mes</p>
          <h4 class="text-2xl font-bold text-gray-900">{props.viewsMonth}</h4>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="material-symbols-outlined text-purple-600 bg-purple-50 p-2 rounded-lg">trending_up</span>
        </div>
        <div>
          <p class="text-sm text-gray-500 font-medium">Sección Popular</p>
          <h4 class="text-xl font-bold text-gray-900 truncate">{props.popularSection}</h4>
        </div>
      </div>
    </div>
  );
});
