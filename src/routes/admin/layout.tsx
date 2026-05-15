import { component$, Slot, $, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, Link, useLocation, useNavigate } from '@builder.io/qwik-city';
import { getAuth, getSessionWithLatestUser } from '../../lib/auth';
import { authClient } from '../../lib/auth-client';

export const useAdminSession = routeLoader$(async (event) => {
  try {
    const session = await getSessionWithLatestUser(event);
    return session;
  } catch (e) {
    console.error("Auth session check error:", e);
    return null; 
  }
});

export default component$(() => {
    const sessionData = useAdminSession();
    const loc = useLocation();
    const nav = useNavigate();

    useVisibleTask$(({ track }) => {
        track(() => sessionData.value);
        if (sessionData.value === null) {
            // Si el servidor dice que no hay sesión, hacemos un hard redirect
            window.location.href = '/login/';
        }
    });

    const handleLogout = $(async () => {
        await authClient.signOut();
        window.location.href = '/login/';
    });

  const isActive = (path: string) => {
    const currentPath = loc.url.pathname;
    if (path === '/admin/') return currentPath === '/admin/';
    return currentPath.startsWith(path);
  };

  const linkClass = (path: string) => `flex items-center gap-3 px-4 py-2.5 transition-all duration-200 ${
    isActive(path) 
      ? 'bg-primary text-white font-bold rounded-lg shadow-sm' 
      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg'
  }`;

    if (sessionData.value === null) {
        return (
            <div class="h-screen w-full flex flex-col items-center justify-center bg-white gap-4">
                <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p class="text-xs font-bold text-primary uppercase tracking-widest animate-pulse">Verificando Sesión...</p>
            </div>
        );
    }

    return (
        <div class="flex w-full bg-gray-50 text-gray-900 antialiased min-h-screen font-['Public_Sans']">
      {/* Sidebar */}
      <aside class="h-screen w-64 fixed left-0 top-0 z-40 bg-white border-r border-gray-200 shadow-sm text-sm flex flex-col py-6 px-4">
        <div class="mb-8 px-2">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <span class="material-symbols-outlined text-white">account_balance</span>
            </div>
            <div>
              <h1 class="font-bold text-gray-900 text-lg leading-tight">Colonia Ensayo</h1>
              <p class="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Gestión Comunal</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <img alt="Admin" class="w-9 h-9 rounded-full object-cover border border-white shadow-sm" src={sessionData.value?.user?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAvLSZY_DK2-s3OfIATBkbRRjXH1FYMNbA8LlJA-KPbFG5mAAy4GEfseiDqXnR9AC4HdpfQH9fhOmkN7_Zz6lHHPLIIJjSSWJEyF0wGWSpe7jZWR0sw5fpHKYNMepC6DsiWinMYzJegjlcHrUlGllEvginUnuvt3XnvnMl_qH2Stt07WjUF41P_AJlDVhZ-NtRwq-6KW2Lxyngz-bXmvm59Bg-aOLEi0PKxbfgnlCID3EmEvb7myaNFL24Zg5ocdC0QS5t8oQQmMsk"}/>
            <div class="min-w-0">
              <p class="font-bold text-gray-900 truncate text-xs">{sessionData.value?.user?.name || 'Usuario'}</p>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  {sessionData.value?.user?.role === 'admin' ? 'Administrador' : 'Editor'}
              </p>
            </div>
          </div>
        </div>

        <nav class="flex-1 space-y-1">
          <Link class={linkClass('/admin/')} href="/admin/">
            <span class="material-symbols-outlined text-xl">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link class={linkClass('/admin/noticias/')} href="/admin/noticias/">
            <span class="material-symbols-outlined text-xl">newspaper</span>
            <span>Noticias</span>
          </Link>
          <Link class={linkClass('/admin/normativas/')} href="/admin/normativas/">
            <span class="material-symbols-outlined text-xl">gavel</span>
            <span>Normativas</span>
          </Link>
          <Link class={linkClass('/admin/identidad/')} href="/admin/identidad/">
            <span class="material-symbols-outlined text-xl">history_edu</span>
            <span>Identidad</span>
          </Link>
          <Link class={linkClass('/admin/gobierno/')} href="/admin/gobierno/">
            <span class="material-symbols-outlined text-xl">groups</span>
            <span>Gobierno</span>
          </Link>
          <Link class={linkClass('/admin/turismo/')} href="/admin/turismo/">
            <span class="material-symbols-outlined text-xl">map</span>
            <span>Turismo</span>
          </Link>
          <Link class={linkClass('/admin/servicios/')} href="/admin/servicios/">
            <span class="material-symbols-outlined text-xl">dry_cleaning</span>
            <span>Servicios</span>
          </Link>
          <Link class={linkClass('/admin/tramites/')} href="/admin/tramites/">
            <span class="material-symbols-outlined text-xl">description</span>
            <span>Trámites</span>
          </Link>
          <Link class={linkClass('/admin/proveedores/')} href="/admin/proveedores/">
            <span class="material-symbols-outlined text-xl">store</span>
            <span>Proveedores</span>
          </Link>
          <Link class={linkClass('/admin/settings/')} href="/admin/settings/">
            <span class="material-symbols-outlined text-xl">settings</span>
            <span>Configuración</span>
          </Link>
          <Link class={linkClass('/admin/usuarios/')} href="/admin/usuarios/">
            <span class="material-symbols-outlined text-xl">manage_accounts</span>
            <span>Usuarios</span>
          </Link>
        </nav>

        <div class="mt-auto pt-4 border-t border-gray-100">
          <button
            onClick$={handleLogout}
            class="flex items-center gap-3 px-4 py-2.5 w-full text-red-600 font-bold hover:bg-red-50 rounded-lg transition-colors text-xs uppercase tracking-widest">
            <span class="material-symbols-outlined text-lg">logout</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main class="ml-64 flex-1 flex flex-col min-h-screen">
        <header class="fixed top-0 left-64 right-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm flex items-center px-8">
          <div class="flex items-center justify-between w-full max-w-7xl mx-auto">
            <h2 class="text-xl font-bold text-primary">Panel de Control</h2>
            <div class="flex items-center gap-6">
                <div class="hidden lg:flex items-center gap-3 text-gray-500 bg-gray-50 px-5 py-1.5 rounded-full border border-gray-100">
                    <span class="material-symbols-outlined text-sm text-primary">calendar_today</span>
                    <div class="flex flex-col">
                        <span class="text-[10px] font-bold uppercase tracking-wider leading-none">
                            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                        <span class="text-[10px] text-gray-400 font-bold tabular-nums">
                            {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} HS
                        </span>
                    </div>
                </div>
                <a href="/" target="_blank" class="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-sm">
                  <span class="material-symbols-outlined text-sm">open_in_new</span>
                  Ver Sitio
                </a>
            </div>
          </div>
        </header>

        <div class="mt-16 p-8 w-full flex-1">
          <Slot />
        </div>
      </main>
    </div>
  );
});
