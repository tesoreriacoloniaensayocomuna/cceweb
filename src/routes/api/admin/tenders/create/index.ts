import type { RequestHandler } from '@builder.io/qwik-city';
import { getDb } from '~/database/db';
import { tenders } from '~/database/schema';
import { uploadImageToCloudinary } from '~/lib/cloudinary';

export const onPost: RequestHandler = async (event) => {
    const db = getDb(event.env);

    try {
        const formData = await event.request.formData();

        const title         = formData.get('title') as string;
        const tenderNumber  = formData.get('tenderNumber') as string;
        const description   = formData.get('description') as string;
        const openingDate   = formData.get('openingDate') as string;
        const status        = formData.get('status') as 'open' | 'closed' | 'awarded';

        if (!title || !tenderNumber) {
            event.json(400, { error: 'Título y número de licitación son obligatorios.' });
            return;
        }

        const pdfFile = formData.get('pdf') as File | null;
        let pdfUrl = '';
        if (pdfFile && pdfFile.size > 0) {
            pdfUrl = await uploadImageToCloudinary(pdfFile, event.env);
        }

        const id = crypto.randomUUID();
        const now = new Date();

        await db.insert(tenders).values({
            id,
            title,
            tenderNumber,
            description,
            pdfUrl,
            openingDate: openingDate ? new Date(openingDate) : null,
            status,
            createdAt: now,
            updatedAt: now
        });

        event.json(200, { success: true, id });
    } catch (e: any) {
        console.error('TENDER CREATE ERROR:', e);
        event.json(500, { error: `Error del servidor: ${e.message}` });
    }
};
