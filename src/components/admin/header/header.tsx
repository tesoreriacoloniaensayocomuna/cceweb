import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

export const AdminHeader = component$(() => {
  const dateTime = useSignal('');

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const updateDateTime = () => {
      const now = new Date();
      dateTime.value = now.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  });

  return (
    <header class="fixed top-0 left-64 right-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 h-full flex items-center justify-between font-['Public_Sans']">
        <h2 class="text-xl font-extrabold tracking-tight text-primary">Panel de Control</h2>
        <div class="flex items-center gap-4">
          <div class="flex items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <span class="material-symbols-outlined text-primary text-sm mr-2" data-icon="calendar_today">schedule</span>
            <span class="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              {dateTime.value || 'Cargando fecha...'}
            </span>
          </div>
          <a 
            href="/" 
            target="_blank"
            class="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-sm">open_in_new</span>
            Ir al Sitio Público
          </a>
        </div>
      </div>
    </header>
  );
});
