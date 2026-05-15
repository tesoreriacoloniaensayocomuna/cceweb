import { component$, useSignal } from '@builder.io/qwik';
import { routeLoader$, routeAction$, zod$, z, Form, Link, useNavigate } from '@builder.io/qwik-city';
import { getDb } from '../../../../../database/db';
import { services } from '../../../../../database/schema';
import { eq } from 'drizzle-orm';

export const useGetService = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const result = await db.select().from(services).where(eq(services.id, event.params.id)).limit(1);
    if (result.length === 0) throw event.error(404, 'Servicio no encontrado');
    return result[0];
});

export const useUpdateService = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    
    try {
        await db.update(services)
            .set({
                title: data.title,
                description: data.description,
                content: data.content,
                iconUrl: data.iconName || 'dry_cleaning',
                tariffTable: data.tariffTable || null,
                requestInstructions: data.requestInstructions || null,
                updatedAt: new Date(),
            })
            .where(eq(services.id, event.params.id));

        return { success: true };
    } catch (e: any) {
        console.error("UPDATE SERVICE ERROR:", e);
        return { 
            success: false, 
            message: 'Error al actualizar el servicio. Intente nuevamente.' 
        };
    }
}, zod$({
    title: z.string().min(1, 'El título es obligatorio'),
    description: z.string().min(1, 'La descripción corta es obligatoria'),
    content: z.string().min(1, 'El contenido detallado es obligatorio'),
    iconName: z.string().optional(),
    tariffTable: z.string().optional(),
    requestInstructions: z.string().optional(),
}));

const COMMON_ICONS = [
    'water_drop', 'electric_bolt', 'cleaning_services', 'medical_services', 
    'school', 'local_police', 'payments', 'description', 'construction', 
    'agriculture', 'park', 'support_agent', 'event', 'campaign', 
    'home', 'account_balance', 'recycling', 'handyman', 'commute', 'emergency'
];

export default component$(() => {
    const service = useGetService();
    const action = useUpdateService();
    const nav = useNavigate();
    const selectedIcon = useSignal(service.value.iconUrl || 'dry_cleaning');

    return (
        <div class="max-w-5xl mx-auto">
            <div class="mb-8 flex items-center gap-4">
                <Link href="/admin/servicios/" class="p-2 hover:bg-gray-100 rounded-full transition-all">
                    <span class="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h2 class="text-h2 text-primary font-black uppercase tracking-tight">Editar Servicio</h2>
                    <p class="text-on-surface-variant">Actualiza la información de {service.value.title}.</p>
                </div>
            </div>

            <Form 
                action={action} 
                class="bg-white p-8 rounded-3xl border border-outline-variant shadow-sm space-y-6"
                onSubmit$={() => {
                    if (action.value?.success) {
                        nav('/admin/servicios/');
                    }
                }}
            >
                {action.value && !action.value.success && action.value.message && (
                    <div class="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
                        <span class="material-symbols-outlined">error</span>
                        {action.value.message}
                    </div>
                )}

                {action.value?.success && (
                    <div class="p-4 bg-green-50 border border-green-100 rounded-xl text-green-600 text-sm font-bold flex items-center gap-2">
                        <span class="material-symbols-outlined">check_circle</span>
                        ¡Cambios guardados con éxito! Redirigiendo...
                        {setTimeout(() => nav('/admin/servicios/'), 1000) && null}
                    </div>
                )}

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="md:col-span-2">
                        <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">Título del Servicio</label>
                        <input 
                            name="title" 
                            type="text" 
                            value={service.value.title}
                            class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                        {action.value?.fieldErrors?.title && <p class="text-error text-xs mt-1">{action.value.fieldErrors.title}</p>}
                    </div>

                    <div class="md:col-span-2">
                        <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-3">Seleccionar Icono (Símbolo)</label>
                        <input type="hidden" name="iconName" value={selectedIcon.value} />
                        <div class="grid grid-cols-5 sm:grid-cols-10 gap-2 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant">
                            {COMMON_ICONS.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick$={() => selectedIcon.value = icon}
                                    class={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                        selectedIcon.value === icon 
                                        ? 'bg-primary text-on-primary shadow-lg scale-110' 
                                        : 'bg-white text-outline hover:bg-primary/5 hover:text-primary border border-outline-variant'
                                    }`}
                                    title={icon}
                                >
                                    <span class="material-symbols-outlined text-xl">{icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div class="md:col-span-2">
                        <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">Descripción Corta</label>
                        <textarea 
                            name="description" 
                            rows={2}
                            value={service.value.description}
                            class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                        ></textarea>
                        {action.value?.fieldErrors?.description && <p class="text-error text-xs mt-1">{action.value.fieldErrors.description}</p>}
                    </div>
                </div>

                <div>
                    <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">Contenido Detallado</label>
                    <textarea 
                        name="content" 
                        rows={6}
                        value={service.value.content}
                        class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    ></textarea>
                    {action.value?.fieldErrors?.content && <p class="text-error text-xs mt-1">{action.value.fieldErrors.content}</p>}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">Cuadro Tarifario (Markdown)</label>
                        <textarea 
                            name="tariffTable" 
                            rows={8}
                            value={service.value.tariffTable || ''}
                            class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-sm"
                        ></textarea>
                    </div>
                    <div>
                        <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">Instrucciones de Solicitud</label>
                        <textarea 
                            name="requestInstructions" 
                            rows={8}
                            value={service.value.requestInstructions || ''}
                            class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        ></textarea>
                    </div>
                </div>

                <div class="pt-4 flex gap-4">
                    <button 
                        type="submit" 
                        disabled={action.isRunning}
                        class="bg-primary text-on-primary px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 flex-1"
                    >
                        {action.isRunning ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <Link 
                        href="/admin/servicios/" 
                        class="px-8 py-4 rounded-2xl font-black uppercase tracking-widest border border-outline-variant hover:bg-surface-container transition-all text-center"
                    >
                        Cancelar
                    </Link>
                </div>
            </Form>
        </div>
    );
});

