import type { RequestHandler } from '@builder.io/qwik-city';
import { getDb } from '~/database/db';
import { identityMilestones } from '~/database/schema';
import { uploadImageToCloudinary } from '~/lib/cloudinary';
import { eq } from 'drizzle-orm';

export const onPost: RequestHandler = async (event) => {
    const db = getDb(event.env);
    const id = event.params.id;

    try {
        const formData = await event.request.formData();

        const title            = formData.get('title') as string;
        const year             = formData.get('year') as string;
        const content          = formData.get('content') as string;
        const published        = formData.get('published') === 'true';
        const sortOrder        = parseInt(formData.get('sortOrder') as string || '0');
        const existingImageUrl = formData.get('existingImageUrl') as string;

        if (!title || !year || !content) {
            event.json(400, { error: 'Título, año y contenido son obligatorios.' });
            return;
        }

        const imageFile = formData.get('image') as File | null;
        let imageUrl = existingImageUrl;
        if (imageFile && imageFile.size > 0) {
            imageUrl = await uploadImageToCloudinary(imageFile, event.env);
        }

        await db.update(identityMilestones).set({
            title,
            year,
            content,
            imageUrl,
            published,
            sortOrder,
            updatedAt: new Date()
        }).where(eq(identityMilestones.id, id));

        event.json(200, { success: true, imageUrl });
    } catch (e: any) {
        console.error('IDENTITY UPDATE ERROR:', e);
        event.json(500, { error: `Error del servidor: ${e.message}` });
    }
};
