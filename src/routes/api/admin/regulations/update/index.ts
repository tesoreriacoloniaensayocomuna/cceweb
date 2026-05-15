import type { RequestHandler } from '@builder.io/qwik-city';
import { getDb } from '~/database/db';
import { regulations } from '~/database/schema';
import { eq } from 'drizzle-orm';
import { uploadToCloudinary } from '~/lib/cloudinary';

// POST /api/admin/regulations/update
export const onPost: RequestHandler = async (event) => {
    const db = getDb(event.env);

    try {
        const formData = await event.request.formData();
        const id = formData.get('id') as string;

        if (!id) {
            event.json(400, { error: 'ID de normativa no proporcionado.' });
            return;
        }

        const title            = formData.get('title') as string;
        const regulationNumber = formData.get('regulationNumber') as string;
        const content          = formData.get('content') as string;
        const sanctionDate     = formData.get('sanctionDate') as string;
        const existingPdfUrl   = formData.get('existingPdfUrl') as string;

        if (!title || !regulationNumber || !content || !sanctionDate) {
            event.json(400, { error: 'Todos los campos son obligatorios.' });
            return;
        }

        // PDF File
        const pdfFile = formData.get('pdf') as File | null;
        let pdfUrl = existingPdfUrl;
        if (pdfFile && pdfFile.size > 0) {
            // Using 'image' for PDFs as it's the standard for document handling in Cloudinary
            pdfUrl = await uploadToCloudinary(pdfFile, event.env, 'image');
        }


        await db.update(regulations).set({
            title,
            regulationNumber,
            content,
            pdfUrl: pdfUrl || null,
            sanctionDate: new Date(sanctionDate),
        }).where(eq(regulations.id, id));

        event.json(200, { success: true });
    } catch (e: any) {
        console.error('REGULATION UPDATE ERROR:', e);
        event.json(500, { error: `Error del servidor: ${e.message}` });
    }
};
