import { component$, useSignal, $ } from '@builder.io/qwik';
import { routeLoader$, routeAction$, useNavigate, z, zod$ } from '@builder.io/qwik-city';
import { getDb } from '../../../../../database/db';
import { user, session as sessionTable } from '../../../../../database/schema';
import { eq } from 'drizzle-orm';
import { useAdminSession } from '../../../layout';
import { getAuth, getSessionWithLatestUser } from '../../../../../lib/auth';

// Eliminamos getSessionInAction local

export const useGetUserDetails = routeLoader$(async (event) => {
    const adminSession = await event.resolveValue(useAdminSession);
    if (!adminSession) throw event.redirect(302, '/login/');

    const userId = event.params.id;
    const db = getDb(event.env);
    
    if (adminSession.user && adminSession.user.role !== 'admin' && adminSession.user.id !== userId) {
        throw event.redirect(302, `/admin/usuarios/editar/${adminSession.user.id}/`);
    }

    const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (userData.length === 0) throw event.error(404, 'Usuario no encontrado');

    return {
        user: userData[0],
        currentAdmin: adminSession.user
    };
});

export const useUpdateUser = routeAction$(async (data, event) => {
    const session = await getSessionWithLatestUser(event);
    if (!session || !session.user) return { success: false, message: 'No autorizado' };

    const db = getDb(event.env);
    const userId = event.params.id;
    const canManageFull = session.user.role === 'admin';
    
    if (!canManageFull && session.user.id !== userId) {
        return { success: false, message: 'No tienes permiso para editar este perfil' };
    }

    const updateData: any = {
        name: data.name,
        image: data.image || null,
        updatedAt: new Date()
    };

    if (canManageFull) {
        updateData.email = data.email;
        updateData.role = data.role;
        updateData.status = data.status;
    }

    if (session.user.id === userId) {
        delete updateData.status;
        delete updateData.role;
    }

    await db.update(user).set(updateData).where(eq(user.id, userId));
    return { success: true };
}, zod$({
    name: z.string().min(2),
    email: z.string().email(),
    image: z.string().optional(),
    role: z.string(),
    status: z.string()
}));

export const useResetPassword = routeAction$(async (data, event) => {
    const session = await getSessionWithLatestUser(event);
    if (!session || !session.user) return { success: false, message: 'No autorizado' };

    const userId = event.params.id;
    const canManageFull = session.user.role === 'admin';

    if (!canManageFull && session.user.id !== userId) {
        return { success: false, message: 'No tienes permiso' };
    }

    const auth = getAuth(event.env);
    const db = getDb(event.env);

    try {
        await auth.api.setPassword({
            body: {
                userId: userId,
                password: data.password
            }
        });
    } catch (e) {
        console.error("SetPassword error:", e);
        return { success: false, message: 'Error al cambiar contraseña' };
    }

    await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
    return { success: true };
}, zod$({
    password: z.string().min(6)
}));

export default component$(() => {
    const details = useGetUserDetails();
    const updateAction = useUpdateUser();
    const resetAction = useResetPassword();
    const nav = useNavigate();
    
    const u = details.value.user;
    const isSelf = details.value.currentAdmin?.id === u.id;
    const isAdmin = details.value.currentAdmin?.role === 'admin';

    const showResetModal = useSignal(false);
    const newPassword = useSignal('');

    const handleUpdate = $(async (e: any) => {
        const formData = new FormData(e.target as HTMLFormElement);
        await updateAction.submit(formData);
    });

    return (
        <div class="max-w-4xl mx-auto">
            <div class="flex items-center gap-4 mb-8">
                <button type="button" onClick$={() => nav('/admin/usuarios/')} class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <span class="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Editar Usuario</h1>
                    <p class="text-gray-500 mt-1">Configuración de cuenta para {u.name}</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="space-y-6">
                    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                        <img 
                            src={u.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAvLSZY_DK2-s3OfIATBkbRRjXH1FYMNbA8LlJA-KPbFG5mAAy4GEfseiDqXnR9AC4HdpfQH9fhOmkN7_Zz6lHHPLIIJjSSWJEyF0wGWSpe7jZWR0sw5fpHKYNMepC6DsiWinMYzJegjlcHrUlGllEvginUnuvt3XnvnMl_qH2Stt07WjUF41P_AJlDVhZ-NtRwq-6KW2Lxyngz-bXmvm59Bg-aOLEi0PKxbfgnlCID3EmEvb7myaNFL24Zg5ocdC0QS5t8oQQmMsk"} 
                            class="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-gray-50 shadow-md"
                        />
                        <h3 class="font-bold text-lg text-gray-900">{u.name}</h3>
                        <p class="text-sm text-gray-400 mb-4">{u.email}</p>
                        
                        <div class="flex flex-col gap-2">
                            <button 
                                type="button"
                                onClick$={() => showResetModal.value = true}
                                class="w-full py-2 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-widest rounded-lg border border-amber-100 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <span class="material-symbols-outlined text-sm">lock_reset</span>
                                Resetear Contraseña
                            </button>
                        </div>
                    </div>

                    {isSelf && (
                        <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p class="text-xs text-blue-700 font-medium">
                                <span class="material-symbols-outlined text-sm align-middle mr-1">info</span>
                                Estás editando tu propia cuenta.
                            </p>
                        </div>
                    )}
                </div>

                <div class="lg:col-span-2">
                    <div class="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                        <form preventdefault:submit onSubmit$={handleUpdate} class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Nombre Completo</label>
                                    <input 
                                        name="name"
                                        value={u.name}
                                        class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                    />
                                </div>
                                <div class="space-y-2">
                                    <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Correo Electrónico</label>
                                    <input 
                                        name="email"
                                        value={u.email}
                                        readOnly={!isAdmin}
                                        class={`w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium ${!isAdmin ? 'bg-gray-50' : ''}`}
                                    />
                                </div>
                            </div>

                            <div class="space-y-2">
                                <label class="text-xs font-bold uppercase tracking-widest text-gray-400">URL Imagen de Perfil</label>
                                <input 
                                    name="image"
                                    value={u.image || ''}
                                    placeholder="https://ejemplo.com/foto.jpg"
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                />
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Rol del Usuario</label>
                                    <select 
                                        name="role"
                                        value={u.role}
                                        disabled={!isAdmin || isSelf}
                                        class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium disabled:bg-gray-50"
                                    >
                                        <option value="admin">Administrador (SuperUser)</option>
                                        <option value="editor">Editor (Acceso limitado)</option>
                                    </select>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Estado de Cuenta</label>
                                    <select 
                                        name="status"
                                        value={u.status}
                                        disabled={!isAdmin || isSelf}
                                        class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium disabled:bg-gray-50"
                                    >
                                        <option value="active">Activo</option>
                                        <option value="inactive">Inactivo / Bloqueado</option>
                                    </select>
                                </div>
                            </div>

                            <div class="pt-6 border-t border-gray-100 flex items-center justify-between">
                                <button 
                                    type="submit"
                                    disabled={updateAction.isRunning}
                                    class="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2"
                                >
                                    {updateAction.isRunning ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                                {updateAction.value?.success && (
                                    <span class="text-green-600 text-sm font-bold flex items-center gap-1 animate-fade-in">
                                        <span class="material-symbols-outlined text-lg">check_circle</span>
                                        Actualizado correctamente
                                    </span>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {showResetModal.value && (
                <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div class="p-6 bg-amber-50 border-b border-amber-100">
                            <h3 class="text-xl font-bold text-amber-800 flex items-center gap-2">
                                <span class="material-symbols-outlined">lock_reset</span>
                                Resetear Contraseña
                            </h3>
                            <p class="text-sm text-amber-700 mt-1">
                                Establece una nueva contraseña para <strong>{u.name}</strong>. Todas sus sesiones activas serán cerradas.
                            </p>
                        </div>
                        <div class="p-6 space-y-4">
                            <div class="space-y-2">
                                <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Nueva Contraseña</label>
                                <input 
                                    type="password"
                                    onInput$={(e) => newPassword.value = (e.target as HTMLInputElement).value}
                                    placeholder="Mínimo 6 caracteres"
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div class="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick$={() => showResetModal.value = false}
                                    class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-500 font-bold rounded-lg hover:bg-gray-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="button"
                                    disabled={newPassword.value.length < 6 || resetAction.isRunning}
                                    onClick$={async () => {
                                        await resetAction.submit({ password: newPassword.value });
                                        showResetModal.value = false;
                                        alert('Contraseña actualizada. El usuario deberá re-ingresar.');
                                    }}
                                    class="flex-1 px-4 py-2.5 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-all shadow-md disabled:opacity-50"
                                >
                                    {resetAction.isRunning ? 'Cambiando...' : 'Confirmar Cambio'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
