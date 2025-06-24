/**
 * Code for uploading and accessing images in Supabase Storage.
 * WARNING: This code is for TESTING and prototyping purposes only.
 * It should not be used in production without proper validation and security.
 *
 * Use the publicly exposed anon key, which may be insecure.
 * For production, protect your keys and implement rules and authentication.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =  'https://mfxwldulvbkrvhryoxos.supabase.co';
const supabaseKey =  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1meHdsZHVsdmJrcnZocnlveG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MjQxNzMsImV4cCI6MjA2NjMwMDE3M30.3jS0QvZF7c_sPsCAhXbW37rIBxttRU-UXnvY-2ZVCp0';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadImage(id: string, base64Image: string): Promise<string | null> {
    try {
        const base64Data = base64Image.replace(/^data:image\/png;base64,/, '');
        const binary = atob(base64Data);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([array], { type: 'image/png' });

        const { error } = await supabase.storage
            .from('photos')
            .upload(`public/${id}.png`, blob, {
                contentType: 'image/png',
                upsert: true,
            });

        if (error) {
            console.error('Upload error:', error.message);
            throw new Error(`Upload failed: ${error.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(`public/${id}.png`);

        return publicUrl;
    } catch (err: any) {
        console.error('UploadImage error:', err.message);
        return null;
    }
}

export async function getImageById(id: string): Promise<{ image: string } | null> {
    try {
        const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(`public/${id}.png`);

        if (!publicUrl) {
            throw new Error('Public URL not found for the image.');
        }

        return { image: publicUrl };
    } catch (err: any) {
        console.error('GetImageById error:', err.message);
        return null;
    }
}
