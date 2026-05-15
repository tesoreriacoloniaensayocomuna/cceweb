import { component$ } from '@builder.io/qwik';
import { routeLoader$, routeAction$, zod$, z, Form, Link } from '@builder.io/qwik-city';
import { getDb } from '../../../../../database/db';
import { authorities } from '../../../../../database/schema';
import { eq } from 'drizzle-orm';

export const useGetAuthority = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const result = await db.select().from(authorities).where(eq(authorities.id, event.params.id)).limit(1);
    if (result.length === 0) throw event.error(404, 'Autoridad no encontrada');
    return result[0];
});

export const useUpdateAuthority = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    await db.update(authorities)
        .set({
            name: data.name,
            role: data.role,
            category: data.category,
            photoUrl: data.photoUrl || null,
            sortOrder: data.sortOrder,
            updatedAt: new Date(),
        })
        .where(eq(authorities.id, event.params.id));

    throw event.redirect(302, '/admin/gobierno/');
}, zod$({
    name: z.string().min(1, 'El nombre es obligatorio'),
    role: z.string().min(1, 'el cargo es obligatorio'),
    category: z.string().min(1, 'La categoría es obligatoria'),
    photoUrl: z.string().optional(),
    sortOrder: z.coerce.number().default(0),
}));

export default component$(() => {
    const auth = useGetAuthority();
    const action = useUpdateAuthority();

    return (
        <div class="max-w-3xl mx-auto">
            <div class="mb-8 flex items-center gap-4">
                <Link href="/admin/gobierno/" class="p-2 hover:bg-gray-100 rounded-full transition-all">
                    <span class="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h2 class="text-h2 text-primary font-black uppercase tracking-tight">Editar Autoridad</h2>
                    <p class="text-on-surface-variant">Actualiza la información de {auth.value.name}.</p>
                </div>
            </div>

            <Form action={action} class="bg-white p-8 rounded-3xl border border-outline-variant shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                    <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">Nombre Completo</label>
                    <input 
                        name="name" 
                        type="text" 
                        value={auth.value.name}
                        class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    {action.value?.fieldErrors?.name && <p class="text-error text-xs mt-1">{action.value.fieldErrors.name}</p>}
                </div>

                <div>
                    <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">Cargo / Función</label>
                    <input 
                        name="role" 
                        type="text" 
                        value={auth.value.role}
                        class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    {action.value?.fieldErrors?.role && <p class="text-error text-xs mt-1">{action.value.fieldErrors.role}</p>}
                </div>

                <div>
                    <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">Categoría</label>
                    <select 
                        name="category" 
                        value={auth.value.category}
                        class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none bg-white"
                    >
                        <option value="Comisión Comunal">Comisión Comunal</option>
                        <option value="Secretarías y Áreas">Secretarías y Áreas</option>
                        <option value="Personal Administrativo">Personal Administrativo</option>
                        <option value="Otros">Otros</option>
                    </select>
                    {action.value?.fieldErrors?.category && <p class="text-error text-xs mt-1">{action.value.fieldErrors.category}</p>}
                </div>

                <div>
                    <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">URL de Foto (Opcional)</label>
                    <input 
                        name="photoUrl" 
                        type="url" 
                        value={auth.value.photoUrl || ''}
                        class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>

                <div>
                    <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">Orden de Aparición</label>
                    <input 
                        name="sortOrder" 
                        type="number" 
                        value={auth.value.sortOrder}
                        class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>

                <div class="md:col-span-2 pt-4 flex gap-4">
                    <button 
                        type="submit" 
                        disabled={action.isRunning}
                        class="bg-primary text-on-primary px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 flex-1"
                    >
                        {action.isRunning ? 'Actualizando...' : 'Actualizar Autoridad'}
                    </button>
                    <Link 
                        href="/admin/gobierno/" 
                        class="px-8 py-4 rounded-2xl font-black uppercase tracking-widest border border-outline-variant hover:bg-surface-container transition-all text-center"
                    >
                        Cancelar
                    </Link>
                </div>
            </Form>
        </div>
    );
});
