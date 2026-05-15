import type { RequestHandler } from '@builder.io/qwik-city';
import { getDb } from '~/database/db';
import { identityMilestones } from '~/database/schema';
import { uploadImageToCloudinary } from '~/lib/cloudinary';

export const onPost: RequestHandler = async (event) => {
    const db = getDb(event.env);

    try {
        const formData = await event.request.formData();

        const title     = formData.get('title') as string;
        const year      = formData.get('year') as string;
        const content   = formData.get('content') as string;
        const published = formData.get('published') === 'true';
        const sortOrder = parseInt(formData.get('sortOrder') as string || '0');

        if (!title || !year || !content) {
            event.json(400, { error: 'Título, año y contenido son obligatorios.' });
            return;
        }

        const imageFile = formData.get('image') as File | null;
        let imageUrl = '';
        if (imageFile && imageFile.size > 0) {
            imageUrl = await uploadImageToCloudinary(imageFile, event.env);
        }

        const id = crypto.randomUUID();
        const now = new Date();

        await db.insert(identityMilestones).values({
            id,
            title,
            year,
            content,
            imageUrl,
            published,
            sortOrder,
            createdAt: now,
            updatedAt: now
        });

        event.json(200, { success: true, id });
    } catch (e: any) {
        console.error('IDENTITY CREATE ERROR:', e);
        event.json(500, { error: `Error del servidor: ${e.message}` });
    }
};
