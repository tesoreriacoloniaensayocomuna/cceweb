import { component$ } from '@builder.io/qwik';

export const AdminFooter = component$(() => {
  return (
    <footer class="w-full py-12 mt-auto bg-gray-50 border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 font-['Public_Sans'] text-sm">
        <div>
          <span class="font-bold text-primary mb-2 block">Comuna de Colonia Ensayo</span>
          <p class="text-gray-500 max-w-sm">© 2024 Comuna de Colonia Ensayo. Hacia una gestión transparente y moderna.</p>
        </div>
        <div class="flex md:justify-end gap-8">
          <div class="flex flex-col gap-2">
            <span class="font-bold text-primary uppercase text-[11px] tracking-widest">Plataforma</span>
            <a href="#" class="text-gray-500 hover:underline decoration-primary underline-offset-4 cursor-pointer">Gobierno</a>
            <a href="#" class="text-gray-500 hover:underline decoration-primary underline-offset-4 cursor-pointer">Noticias</a>
          </div>
          <div class="flex flex-col gap-2">
            <span class="font-bold text-primary uppercase text-[11px] tracking-widest">Soporte</span>
            <a href="#" class="text-gray-500 hover:underline decoration-primary underline-offset-4 cursor-pointer">Servicios</a>
            <a href="#" class="text-gray-500 hover:underline decoration-primary underline-offset-4 cursor-pointer">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  );
});
