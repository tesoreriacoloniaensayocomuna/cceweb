import { component$, useSignal, $ } from '@builder.io/qwik';
import { routeLoader$, routeAction$, useNavigate, z, zod$ } from '@builder.io/qwik-city';
import { getAuth, getSessionWithLatestUser } from '../../../../lib/auth';
import { useAdminSession } from '../../layout';
import { getDb } from '../../../../database/db';



export const useCheckAdmin = routeLoader$(async (event) => {
    const session = await event.resolveValue(useAdminSession);
    if (!session || !session.user || session.user.role !== 'admin') {
        throw event.redirect(302, '/admin/usuarios/');
    }
    return session;
});

export const useCreateUser = routeAction$(async (data, event) => {
    const session = await getSessionWithLatestUser(event);
    if (!session || !session.user || session.user.role !== 'admin') return { success: false, message: 'No autorizado' };

    try {
        const auth = getAuth(event.env);
        

        const adminService = auth.api;
        
        if (!adminService || typeof adminService.createUser !== 'function') {
            throw new Error(`Función createUser no disponible en API. Funciones: ${Object.keys(auth.api || {}).join(", ")}`);
        }

        const newUser = await adminService.createUser({
            headers: event.request.headers,
            body: {
                email: data.email,
                password: data.password,
                name: data.name,
                role: data.role,
                status: 'active',
                emailVerified: true
            }
        });

        if (!newUser) throw new Error('Error al crear el usuario');


        const db = getDb(event.env);
        const { user: userTable } = await import('../../../../database/schema');
        const { eq } = await import('drizzle-orm');
        await db.update(userTable).set({ role: data.role }).where(eq(userTable.id, newUser.user.id));

        return { success: true, userId: newUser.user.id };
    } catch (e: any) {
        console.error("Create User Error:", e);
        return { success: false, message: e.message || 'Error desconocido' };
    }
}, zod$({
    name: z.string().min(2, "Nombre muy corto"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    role: z.enum(['admin', 'editor'])
}));

export default component$(() => {
    useCheckAdmin();
    const createAction = useCreateUser();
    const nav = useNavigate();
    const errorMsg = useSignal('');

    const handleCreate = $(async (e: any) => {
        errorMsg.value = '';
        const formData = new FormData(e.target as HTMLFormElement);
        const res = await createAction.submit(formData);
        if (res.value?.success) {
            nav('/admin/usuarios/');
        } else {
            errorMsg.value = res.value?.message || 'Error al crear el usuario';
        }
    });

    return (
        <div class="max-w-2xl mx-auto">
            <div class="flex items-center gap-4 mb-8">
                <button type="button" onClick$={() => nav('/admin/usuarios/')} class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <span class="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Nuevo Usuario</h1>
                    <p class="text-gray-500 mt-1">Registra una nueva cuenta para el panel de control.</p>
                </div>
            </div>

            <div class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                <form preventdefault:submit onSubmit$={handleCreate} class="space-y-6">
                    <div class="space-y-2">
                        <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Nombre Completo</label>
                        <input 
                            name="name"
                            required
                            placeholder="Ej: Juan Pérez"
                            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                        />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Correo Electrónico</label>
                            <input 
                                name="email"
                                type="email"
                                required
                                placeholder="usuario@coloniaensayo.gob.ar"
                                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                            />
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Rol Inicial</label>
                            <select 
                                name="role"
                                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium bg-white"
                            >
                                <option value="editor">Editor (Acceso limitado)</option>
                                <option value="admin">Administrador (Acceso total)</option>
                            </select>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Contraseña Temporal</label>
                        <input 
                            name="password"
                            type="password"
                            required
                            placeholder="Mínimo 6 caracteres"
                            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                        />
                        <p class="text-[10px] text-gray-400 italic font-medium">El usuario podrá cambiar su contraseña luego desde su perfil.</p>
                    </div>

                    {errorMsg.value && (
                        <div class="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
                            <span class="material-symbols-outlined">error</span>
                            {errorMsg.value}
                        </div>
                    )}

                    <div class="pt-6 flex gap-4">
                        <button 
                            type="button"
                            onClick$={() => nav('/admin/usuarios/')}
                            class="flex-1 px-6 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-all"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={createAction.isRunning}
                            class="flex-[2] bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            {createAction.isRunning ? 'Creando...' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});
