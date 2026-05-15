import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div class="max-w-5xl mx-auto font-['Public_Sans']">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Configuración del Sitio</h1>
        <p class="text-gray-500 mt-2">Selecciona la sección de la página pública que deseas personalizar.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Link href="/admin/settings/navbar" class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/50 transition-all group flex items-start gap-4">
          <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
            <span class="material-symbols-outlined text-primary group-hover:text-white transition-colors">web</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800 mb-1 group-hover:text-primary transition-colors">Barra de Navegación (Navbar)</h2>
            <p class="text-sm text-gray-500 leading-relaxed">Sube el logo de la Comuna, ordena los menús y activa o desactiva el botón del Portal Ciudadano.</p>
          </div>
        </Link>

        <Link href="/admin/settings/hero" class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/50 transition-all group flex items-start gap-4">
          <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
            <span class="material-symbols-outlined text-primary group-hover:text-white transition-colors">image</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800 mb-1 group-hover:text-primary transition-colors">Sección Principal (Hero)</h2>
            <p class="text-sm text-gray-500 leading-relaxed">Cambia la imagen de fondo, el título principal de bienvenida y los botones de acceso rápido.</p>
          </div>
        </Link>

        <Link href="/admin/settings/contact" class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/50 transition-all group flex items-start gap-4">
          <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
            <span class="material-symbols-outlined text-primary group-hover:text-white transition-colors">contact_support</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800 mb-1 group-hover:text-primary transition-colors">Información de Contacto</h2>
            <p class="text-sm text-gray-500 leading-relaxed">Actualiza el teléfono, correo, dirección y los horarios de atención al público.</p>
          </div>
        </Link>

        <Link href="/admin/settings/footer" class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/50 transition-all group flex items-start gap-4">
          <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
            <span class="material-symbols-outlined text-primary group-hover:text-white transition-colors">bottom_panel_open</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800 mb-1 group-hover:text-primary transition-colors">Pie de Página (Footer)</h2>
            <p class="text-sm text-gray-500 leading-relaxed">Modifica el texto legal, los enlaces rápidos y las redes sociales de la comuna.</p>
          </div>
        </Link>

      </div>
    </div>
  );
});
