import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link } from '@builder.io/qwik-city';
import { getDb } from '../../../database/db';
import { user } from '../../../database/schema';
import { eq, desc } from 'drizzle-orm';
import { useAdminSession } from '../layout';

export const useGetUsers = routeLoader$(async (event) => {
    const session = await event.resolveValue(useAdminSession);
    if (!session) return { items: [], currentUser: null };

    const db = getDb(event.env);
    
    // Si el usuario es EDITOR, solo devolvemos su propio usuario
    if (session.user.role !== 'admin') {
        const currentUser = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
        return { items: currentUser, currentUser: session.user };
    }

    // Si es ADMIN, devolvemos todos
    const items = await db.select().from(user).orderBy(desc(user.createdAt));
    return { items, currentUser: session.user };
});

export default component$(() => {
    const data = useGetUsers();
    const isAdmin = data.value.currentUser?.role === 'admin';

    // Si no es admin, mostramos directamente la vista de perfil (que es como un "editar mi usuario")
    if (!isAdmin) {
        return (
            <div class="max-w-4xl mx-auto">
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900">Mi Perfil</h1>
                    <p class="text-gray-500 mt-1">Gestiona tu información de acceso y perfil.</p>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div class="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                        <img 
                            src={data.value.currentUser?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAvLSZY_DK2-s3OfIATBkbRRjXH1FYMNbA8LlJA-KPbFG5mAAy4GEfseiDqXnR9AC4HdpfQH9fhOmkN7_Zz6lHHPLIIJjSSWJEyF0wGWSpe7jZWR0sw5fpHKYNMepC6DsiWinMYzJegjlcHrUlGllEvginUnuvt3XnvnMl_qH2Stt07WjUF41P_AJlDVhZ-NtRwq-6KW2Lxyngz-bXmvm59Bg-aOLEi0PKxbfgnlCID3EmEvb7myaNFL24Zg5ocdC0QS5t8oQQmMsk"} 
                            alt="Avatar" 
                            class="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-sm"
                        />
                        <div>
                            <h3 class="text-xl font-bold text-gray-900">{data.value.currentUser?.name}</h3>
                            <p class="text-gray-500">{data.value.currentUser?.email}</p>
                            <span class="mt-2 inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-100">
                                Rol: {data.value.currentUser?.role === 'admin' ? 'Administrador' : 'Editor'}
                            </span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link 
                            href={`/admin/usuarios/editar/${data.value.currentUser?.id}/`} 
                            class="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-sm"
                        >
                            <span class="material-symbols-outlined">edit</span>
                            Editar mi Información
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div class="max-w-6xl mx-auto">
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                    <p class="text-gray-500 mt-1">Crea y administra las cuentas con acceso al panel.</p>
                </div>
                <a 
                    href="/admin/usuarios/nuevo" 
                    class="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm w-fit"
                >
                    <span class="material-symbols-outlined">person_add</span>
                    Nuevo Usuario
                </a>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-100">
                            <tr>
                                <th class="px-6 py-4">Usuario</th>
                                <th class="px-6 py-4">Rol</th>
                                <th class="px-6 py-4">Estado</th>
                                <th class="px-6 py-4">Creado</th>
                                <th class="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            {data.value.items.map((u: any) => (
                                <tr key={u.id} class={`hover:bg-gray-50 transition-colors ${u.status === 'inactive' ? 'opacity-60 bg-gray-50/50' : ''}`}>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <img src={u.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAvLSZY_DK2-s3OfIATBkbRRjXH1FYMNbA8LlJA-KPbFG5mAAy4GEfseiDqXnR9AC4HdpfQH9fhOmkN7_Zz6lHHPLIIJjSSWJEyF0wGWSpe7jZWR0sw5fpHKYNMepC6DsiWinMYzJegjlcHrUlGllEvginUnuvt3XnvnMl_qH2Stt07WjUF41P_AJlDVhZ-NtRwq-6KW2Lxyngz-bXmvm59Bg-aOLEi0PKxbfgnlCID3EmEvb7myaNFL24Zg5ocdC0QS5t8oQQmMsk"} class="w-10 h-10 rounded-full object-cover shadow-sm border border-white" />
                                            <div>
                                                <p class="font-bold text-gray-900">{u.name} {u.id === data.value.currentUser?.id ? '(Tú)' : ''}</p>
                                                <p class="text-xs text-gray-400">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                                        <span class={`px-2 py-1 rounded ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100'}`}>
                                            {u.role === 'admin' ? 'Administrador' : 'Editor'}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <span class={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {u.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-500">
                                        {new Date(u.createdAt).toLocaleDateString('es-AR')}
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <Link 
                                            href={`/admin/usuarios/editar/${u.id}/`} 
                                            class="p-2 text-gray-400 hover:text-primary transition-colors inline-block"
                                            title="Gestionar Usuario"
                                        >
                                            <span class="material-symbols-outlined text-xl">tune</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});
