import { component$, $ } from '@builder.io/qwik';
import { Link, useLocation, useNavigate } from '@builder.io/qwik-city';
import { authClient } from '../../../lib/auth-client';

export const AdminSidebar = component$(() => {
  const loc = useLocation();
  const nav = useNavigate();

  const handleLogout = $(async () => {
    await authClient.signOut();
    nav('/admin/login/');
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

  return (
    <aside class="h-screen w-64 fixed left-0 top-0 z-40 bg-white border-r border-gray-200 shadow-sm font-['Public_Sans'] text-sm flex flex-col py-6 px-4">
      <div class="mb-8 px-2">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span class="material-symbols-outlined text-white">account_balance</span>
          </div>
          <div>
            <h1 class="font-bold text-gray-900 text-lg leading-tight">Colonia Ensayo</h1>
            <p class="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Gestión Comunal</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <img alt="Administrador" class="w-9 h-9 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvLSZY_DK2-s3OfIATBkbRRjXH1FYMNbA8LlJA-KPbFG5mAAy4GEfseiDqXnR9AC4HdpfQH9fhOmkN7_Zz6lHHPLIIJjSSWJEyF0wGWSpe7jZWR0sw5fpHKYNMepC6DsiWinMYzJegjlcHrUlGllEvginUnuvt3XnvnMl_qH2Stt07WjUF41P_AJlDVhZ-NtRwq-6KW2Lxyngz-bXmvm59Bg-aOLEi0PKxbfgnlCID3EmEvb7myaNFL24Zg5ocdC0QS5t8oQQmMsk"/>
          <div class="min-w-0">
            <p class="font-bold text-gray-900 truncate text-xs">Admin Comuna</p>
            <p class="text-[10px] text-gray-500 truncate">Administrador</p>
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
  );
});
