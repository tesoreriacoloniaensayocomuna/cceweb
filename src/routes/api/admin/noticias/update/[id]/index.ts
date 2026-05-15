import type { RequestHandler } from '@builder.io/qwik-city';
import { getDb } from '~/database/db';
import { news } from '~/database/schema';
import { uploadImageToCloudinary } from '~/lib/cloudinary';
import { eq } from 'drizzle-orm';

// POST /api/admin/noticias/update/[id]
export const onPost: RequestHandler = async (event) => {
    const db = getDb(event.env);
    const id = event.params.id;

    try {
        const formData = await event.request.formData();

        const title            = formData.get('title') as string;
        const slug             = formData.get('slug') as string;
        const content          = formData.get('content') as string;
        const excerpt          = formData.get('excerpt') as string;
        const category         = formData.get('category') as string;
        const status           = formData.get('status') as string;
        const publishedAt      = formData.get('publishedAt') as string;
        const existingImageUrl = formData.get('existingImageUrl') as string;
        const currentGalleryJson = formData.get('currentGalleryJson') as string;

        // Portada
        const coverFile = formData.get('image') as File | null;
        let imageUrl = existingImageUrl;
        if (coverFile && coverFile.size > 0) {
            imageUrl = await uploadImageToCloudinary(coverFile, event.env);
        }

        // Galería existente (URLs que el usuario conservó)
        let currentGallery: string[] = [];
        try { currentGallery = JSON.parse(currentGalleryJson || '[]'); } catch { currentGallery = []; }

        // Nuevas fotos — getAll devuelve TODAS
        const galleryFiles = formData.getAll('gallery') as File[];
        const validGallery = galleryFiles.filter(f => f instanceof File && f.size > 0);
        const newUrls      = await Promise.all(validGallery.map(f => uploadImageToCloudinary(f, event.env)));

        const finalGallery = [...currentGallery, ...newUrls];

        await db.update(news).set({
            title,
            slug,
            content,
            excerpt: excerpt || content.substring(0, 150) + '...',
            imageUrl,
            additionalImages: finalGallery,
            category,
            status: status as 'draft' | 'published',
            publishedAt: new Date(publishedAt),
            updatedAt: new Date()
        }).where(eq(news.id, id));

        event.json(200, { success: true, imageUrl, additionalImages: finalGallery });
    } catch (e: any) {
        console.error('UPDATE ERROR:', e);
        event.json(500, { error: `Error del servidor: ${e.message}` });
    }
};
