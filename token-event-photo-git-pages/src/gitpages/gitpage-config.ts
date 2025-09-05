const GITHUB_TOKEN = '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';
const REPO_OWNER = 'Vidigal-code';
const REPO_NAME = 'token-event-challenge';
const BRANCH = 'main';


export async function uploadImage(id: string, base64Image: string): Promise<string | null> {
    try {
        const fileName = `${id}.png`;
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/images/${fileName}`;

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github+json'
            },
            body: JSON.stringify({
                message: `Upload da imagem ${fileName}`,
                content: base64Image.split(',')[1],
                branch: BRANCH
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Erro ao fazer upload:', data);
            return null;
        }

        return `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/images/${fileName}`;
    } catch (err: any) {
        console.error('uploadImage error:', err.message);
        return null;
    }
}


export async function getImageById(id: string): Promise<{ image: string } | null> {
    try {
        const fileName = `${id}.png`;
        const publicUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/images/${fileName}`;
        return { image: publicUrl };
    } catch (err: any) {
        console.error('getImageById error:', err.message);
        return null;
    }
}
