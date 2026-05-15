import { component$, useStore, $ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import type { DocumentHead } from '@builder.io/qwik-city';
import { authClient } from '../../lib/auth-client';

export default component$(() => {
  const nav = useNavigate();
  const state = useStore({
    email: '',
    password: '',
    error: '',
    loading: false
  });

  const handleSubmit = $(async () => {
    state.error = '';
    state.loading = true;

    try {
      const { error } = await authClient.signIn.email({
        email: state.email,
        password: state.password,
      });

      if (error) {
        state.error = error.message || 'Error al iniciar sesión';
      } else {
        nav('/admin');
      }
    } catch {
      state.error = 'Ocurrió un error inesperado';
    } finally {
      state.loading = false;
    }
  });

  return (
    <div class="flex items-center justify-center min-h-screen bg-surface w-full font-['Public_Sans']">
      <div class="bg-surface-container-lowest p-8 rounded-xl shadow-lg border border-outline-variant max-w-md w-full text-center">
        <div class="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-6">
          <span class="material-symbols-outlined text-3xl">lock</span>
        </div>
        <h2 class="text-h2 text-primary mb-2">Ingreso Administradores</h2>
        <p class="text-on-surface-variant mb-6">Inicie sesión para acceder al panel de control de Colonia Ensayo.</p>
        
        {state.error && (
          <div class="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm text-left">
            {state.error}
          </div>
        )}

        <form preventdefault:submit onSubmit$={handleSubmit} class="space-y-4 text-left mb-2">
          <div>
            <label class="block text-sm font-medium text-on-surface mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required
              class="w-full px-4 py-2 rounded-lg border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="admin@coloniaensayo.gob.ar"
              value={state.email}
              onInput$={(e) => state.email = (e.target as HTMLInputElement).value}
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-on-surface mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              class="w-full px-4 py-2 rounded-lg border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="••••••••"
              value={state.password}
              onInput$={(e) => state.password = (e.target as HTMLInputElement).value}
            />
          </div>
          <button 
            type="submit" 
            disabled={state.loading}
            class="bg-primary text-white px-6 py-3 rounded-lg font-bold w-full hover:opacity-90 transition-all disabled:opacity-50 mt-4"
          >
            {state.loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Login - Colonia Ensayo",
};
