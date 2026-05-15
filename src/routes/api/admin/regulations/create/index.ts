import type { RequestHandler } from '@builder.io/qwik-city';
import { getDb } from '~/database/db';
import { regulations } from '~/database/schema';
import { uploadToCloudinary } from '~/lib/cloudinary';

// POST /api/admin/regulations/create
export const onPost: RequestHandler = async (event) => {
    const db = getDb(event.env);

    try {
        const formData = await event.request.formData();

        const title            = formData.get('title') as string;
        const regulationNumber = formData.get('regulationNumber') as string;
        const content          = formData.get('content') as string;
        const sanctionDate     = formData.get('sanctionDate') as string;

        if (!title || !regulationNumber || !content || !sanctionDate) {
            event.json(400, { error: 'Todos los campos (Título, Número, Contenido, Fecha) son obligatorios.' });
            return;
        }

        // PDF File
        const pdfFile = formData.get('pdf') as File | null;
        let pdfUrl = '';
        if (pdfFile && pdfFile.size > 0) {
            // Using 'image' for PDFs as it's the standard for document handling in Cloudinary
            pdfUrl = await uploadToCloudinary(pdfFile, event.env, 'image');
        }




        const id = crypto.randomUUID();

        await db.insert(regulations).values({
            id,
            title,
            regulationNumber,
            content,
            pdfUrl: pdfUrl || null,
            sanctionDate: new Date(sanctionDate),
        });

        event.json(200, { success: true, id });
    } catch (e: any) {
        console.error('REGULATION CREATE ERROR:', e);
        event.json(500, { error: `Error del servidor: ${e.message}` });
    }
};
