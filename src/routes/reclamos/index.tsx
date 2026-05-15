import { component$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

export default component$(() => {
  return (
    <>
      <Header />
      <main class="flex-grow pt-24 px-margin max-w-7xl mx-auto w-full min-h-[60vh]">
        <h1 class="text-h1 text-primary mb-8">Centro de Reclamos</h1>
        <div class="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant text-center">
          <span class="material-symbols-outlined text-6xl text-outline mb-4">support_agent</span>
          <h3 class="text-h3 text-on-surface mb-2">Página en Construcción</h3>
          <p class="text-on-surface-variant">Pronto podrás cargar tus reclamos indicando tu ubicación y contacto aquí.</p>
        </div>
      </main>
      <Footer />
    </>
  );
});

export const head: DocumentHead = { title: "Reclamos - Colonia Ensayo" };
