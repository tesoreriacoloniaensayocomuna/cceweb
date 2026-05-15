import { component$, useSignal } from '@builder.io/qwik';
import { routeAction$, zod$, z, useNavigate, Form, Link } from '@builder.io/qwik-city';
import { getDb } from '../../../../database/db';
import { services } from '../../../../database/schema';

export const useSaveService = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    
    try {
        const id = crypto.randomUUID();
        let slug = data.title.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
        
        // Verificamos si el slug ya existe para evitar errores de restricción UNIQUE
        const { eq } = await import('drizzle-orm');
        const existing = await db.select().from(services).where(eq(services.slug, slug)).limit(1);
        if (existing.length > 0) {
            slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
        }

        await db.insert(services).values({
            id,
            slug,
            title: data.title,
            description: data.description,
            content: data.content,
            iconUrl: data.iconName || 'dry_cleaning',
            tariffTable: data.tariffTable || null,
            requestInstructions: data.requestInstructions || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return { success: true };
    } catch (e: any) {
        console.error("SAVE SERVICE ERROR:", e);
        return { 
            success: false, 
            message: e.message?.includes('UNIQUE') ? 'Ya existe un servicio con un título similar.' : 'Error interno al guardar el servicio.' 
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
    const action = useSaveService();
    const nav = useNavigate();
    const selectedIcon = useSignal('dry_cleaning');

    return (
        <div class="max-w-5xl mx-auto">
            <div class="mb-8 flex items-center gap-4">
                <Link href="/admin/servicios/" class="p-2 hover:bg-gray-100 rounded-full transition-all">
                    <span class="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h2 class="text-h2 text-primary font-black uppercase tracking-tight">Nuevo Servicio</h2>
                    <p class="text-on-surface-variant">Crea un nuevo servicio municipal con su cuadro tarifario.</p>
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
                        ¡Servicio guardado con éxito! Redirigiendo...
                        {setTimeout(() => nav('/admin/servicios/'), 1000) && null}
                    </div>
                )}

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="md:col-span-2">
                        <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">Título del Servicio</label>
                        <input 
                            name="title" 
                            type="text" 
                            placeholder="Ej: Servicio de Agua Potable"
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
                            placeholder="Resumen del servicio para los listados..."
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
                        placeholder="Explicación detallada de qué incluye el servicio..."
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
                            placeholder="Ej: | Rango | Precio | \n|---|---| \n| 0-10m3 | $1000 |"
                            class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-sm"
                        ></textarea>
                        <p class="text-[10px] text-outline mt-1 italic">Puedes usar tablas de Markdown para mostrar los costos.</p>
                    </div>
                    <div>
                        <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">Instrucciones de Solicitud</label>
                        <textarea 
                            name="requestInstructions" 
                            rows={8}
                            placeholder="Pasos que debe seguir el vecino para solicitar el servicio..."
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
                        {action.isRunning ? 'Guardando...' : 'Guardar Servicio'}
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

