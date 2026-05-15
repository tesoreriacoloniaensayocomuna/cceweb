import type { RequestHandler } from '@builder.io/qwik-city';
import { getDb } from '~/database/db';
import { news } from '~/database/schema';
import { uploadImageToCloudinary } from '~/lib/cloudinary';

// POST /api/admin/noticias/create
export const onPost: RequestHandler = async (event) => {
    const db = getDb(event.env);

    try {
        const formData = await event.request.formData();

        const title       = formData.get('title') as string;
        const slug        = formData.get('slug') as string;
        const content     = formData.get('content') as string;
        const excerpt     = formData.get('excerpt') as string;
        const category    = formData.get('category') as string;
        const status      = formData.get('status') as string;
        const publishedAt = formData.get('publishedAt') as string;

        if (!title || !slug || !content) {
            event.json(400, { error: 'Título, slug y contenido son obligatorios.' });
            return;
        }

        // Portada
        const coverFile = formData.get('image') as File | null;
        let imageUrl = '';
        if (coverFile && coverFile.size > 0) {
            imageUrl = await uploadImageToCloudinary(coverFile, event.env);
        }

        // Galería — getAll devuelve TODOS los archivos del campo "gallery"
        const galleryFiles = formData.getAll('gallery') as File[];
        const validGallery = galleryFiles.filter(f => f instanceof File && f.size > 0);
        const galleryUrls  = await Promise.all(validGallery.map(f => uploadImageToCloudinary(f, event.env)));

        const id  = crypto.randomUUID();
        const now = new Date();

        await db.insert(news).values({
            id,
            title,
            slug,
            content,
            excerpt: excerpt || content.substring(0, 150) + '...',
            imageUrl,
            additionalImages: galleryUrls,
            category,
            status: status as 'draft' | 'published',
            publishedAt: new Date(publishedAt),
            createdAt: now,
            updatedAt: now
        });

        event.json(200, { success: true, id });
    } catch (e: any) {
        console.error('CREATE ERROR:', e);
        if (e.message?.includes('UNIQUE constraint failed')) {
            event.json(409, { error: 'El enlace (slug) ya existe. Cambia el título.' });
        } else {
            event.json(500, { error: `Error del servidor: ${e.message}` });
        }
    }
};
