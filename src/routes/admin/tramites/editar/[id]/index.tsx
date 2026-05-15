import { component$ } from '@builder.io/qwik';
import { routeLoader$, routeAction$, zod$, z, Form, Link, useNavigate } from '@builder.io/qwik-city';
import { getDb } from '../../../../../database/db';
import { procedures, services } from '../../../../../database/schema';
import { eq } from 'drizzle-orm';
import { uploadImageToCloudinary } from '~/lib/cloudinary';

export const useGetServices = routeLoader$(async (event) => {
    const db = getDb(event.env);
    return await db.select().from(services);
});

export const useGetProcedure = routeLoader$(async (event) => {
    const db = getDb(event.env);
    const result = await db.select().from(procedures).where(eq(procedures.id, event.params.id)).limit(1);
    if (result.length === 0) throw event.error(404, 'Trámite no encontrado');
    return result[0];
});

export const useUpdateProcedure = routeAction$(async (data, event) => {
    const db = getDb(event.env);
    
    try {
        let attachmentUrl = data.existingPdfUrl || null;
        const pdfFile = data.pdf as File;
        
        if (pdfFile && pdfFile.size > 0) {
            attachmentUrl = await uploadImageToCloudinary(pdfFile, event.env);
        }

        await db.update(procedures)
            .set({
                title: data.title,
                description: data.description,
                howToPerform: data.howToPerform,
                documentation: data.documentation || null,
                materials: data.materials || null,
                attachmentUrl: attachmentUrl,
                serviceId: data.serviceId || null,
                updatedAt: new Date(),
            })
            .where(eq(procedures.id, event.params.id));

        return { success: true };
    } catch (e: any) {
        console.error("UPDATE PROCEDURE ERROR:", e);
        return { 
            success: false, 
            message: 'Error al actualizar el trámite. Intente nuevamente.' 
        };
    }
}, zod$({
    title: z.string().min(1, 'El título es obligatorio'),
    description: z.string().min(1, 'La descripción corta es obligatoria'),
    howToPerform: z.string().min(1, 'Las instrucciones son obligatorias'),
    documentation: z.string().optional(),
    materials: z.string().optional(),
    existingPdfUrl: z.string().optional(),
    pdf: z.any().optional(),
    serviceId: z.string().optional(),
}));

export default component$(() => {
    const proc = useGetProcedure();
    const action = useUpdateProcedure();
    const servicesData = useGetServices();
    const nav = useNavigate();

    return (
        <div class="max-w-5xl mx-auto">
            <div class="mb-8 flex items-center gap-4">
                <Link href="/admin/tramites/" class="p-2 hover:bg-gray-100 rounded-full transition-all">
                    <span class="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h2 class="text-h2 text-primary font-black uppercase tracking-tight">Editar Trámite</h2>
                    <p class="text-on-surface-variant">Actualiza la información de {proc.value.title}.</p>
                </div>
            </div>

            <Form 
                action={action} 
                enctype="multipart/form-data"
                class="bg-white p-8 rounded-3xl border border-outline-variant shadow-sm space-y-6"
                onSubmit$={() => {
                    if (action.value?.success) {
                        nav('/admin/tramites/');
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
                        {setTimeout(() => nav('/admin/tramites/'), 1000) && null}
                    </div>
                )}

                <input type="hidden" name="existingPdfUrl" value={proc.value.attachmentUrl || ''} />

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="md:col-span-2">
                        <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">Título del Trámite</label>
                        <input 
                            name="title" 
                            type="text" 
                            value={proc.value.title}
                            class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                        {action.value?.fieldErrors?.title && <p class="text-error text-xs mt-1">{action.value.fieldErrors.title}</p>}
                    </div>

                    <div class="md:col-span-2">
                        <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">Descripción General</label>
                        <textarea 
                            name="description" 
                            rows={2}
                            value={proc.value.description}
                            class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                        ></textarea>
                        {action.value?.fieldErrors?.description && <p class="text-error text-xs mt-1">{action.value.fieldErrors.description}</p>}
                    </div>

                    <div class="md:col-span-2">
                        <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">¿Cómo se realiza?</label>
                        <textarea 
                            name="howToPerform" 
                            rows={4}
                            value={proc.value.howToPerform}
                            class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        ></textarea>
                        {action.value?.fieldErrors?.howToPerform && <p class="text-error text-xs mt-1">{action.value.fieldErrors.howToPerform}</p>}
                    </div>

                    <div>
                        <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">Documentación a Presentar</label>
                        <textarea 
                            name="documentation" 
                            rows={4}
                            value={proc.value.documentation || ''}
                            class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        ></textarea>
                    </div>

                    <div>
                        <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">Materiales Necesarios</label>
                        <textarea 
                            name="materials" 
                            rows={4}
                            value={proc.value.materials || ''}
                            class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        ></textarea>
                    </div>

                    <div>
                        <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">Formulario Adjunto (PDF)</label>
                        <div class="space-y-3">
                            {proc.value.attachmentUrl && (
                                <div class="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                                    <span class="material-symbols-outlined text-primary">description</span>
                                    <span class="text-xs font-bold text-primary truncate flex-1">Archivo actual cargado</span>
                                    <a href={proc.value.attachmentUrl} target="_blank" class="text-[10px] bg-primary text-white px-3 py-1 rounded-full uppercase tracking-widest font-black hover:opacity-90">Ver</a>
                                </div>
                            )}
                            <input 
                                name="pdf" 
                                type="file" 
                                accept="application/pdf"
                                class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                            <p class="text-[10px] text-outline italic">Sube un nuevo archivo para reemplazar el anterior.</p>
                        </div>
                    </div>

                    <div>
                        <label class="block text-label-sm font-black uppercase tracking-widest text-outline mb-2">Servicio Relacionado</label>
                        <select 
                            name="serviceId" 
                            value={proc.value.serviceId || ''}
                            class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none bg-white"
                        >
                            <option value="">Ninguno</option>
                            {servicesData.value.map(s => (
                                <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                        </select>
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
                        href="/admin/tramites/" 
                        class="px-8 py-4 rounded-2xl font-black uppercase tracking-widest border border-outline-variant hover:bg-surface-container transition-all text-center"
                    >
                        Cancelar
                    </Link>
                </div>
            </Form>
        </div>
    );
});

