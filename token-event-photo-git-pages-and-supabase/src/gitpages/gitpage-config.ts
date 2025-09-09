const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const REPO_OWNER = 'Vidigal-code';
const REPO_NAME = 'token-event-challenge';
const BRANCH = 'main';

async function checkFileExists(fileName: string): Promise<boolean> {
    try {
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/images/${fileName}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github+json'
            }
        });
        return response.status === 200;
    } catch {
        return false;
    }
}

async function getFileSha(fileName: string): Promise<string | null> {
    try {
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/images/${fileName}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.sha;
        }
        return null;
    } catch {
        return null;
    }
}

export async function uploadImage(id: string, base64Image: string): Promise<string | null> {
    try {
        if (!GITHUB_TOKEN) {
            console.error('GITHUB_TOKEN not found. Make sure VITE_GITHUB_TOKEN is set in your .env file');
            return null;
        }

        const fileName = `${id}.png`;
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/images/${fileName}`;

        const fileExists = await checkFileExists(fileName);
        let sha = null;

        if (fileExists) {
            sha = await getFileSha(fileName);
            console.log(`File ${fileName} already exists, updating...`);
        }

        const requestBody: any = {
            message: `Upload da imagem ${fileName}`,
            content: base64Image.split(',')[1],
            branch: BRANCH
        };

        if (sha) {
            requestBody.sha = sha;
        }

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Erro ao fazer upload:', data);
            if (response.status === 403) {
                console.error('Permission denied. Check if the GitHub token has write access to the repository.');
            }
            return null;
        }

        const imageUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/images/${fileName}`;
        console.log(`Image uploaded successfully: ${imageUrl}`);
        return imageUrl;

    } catch (err: any) {
        console.error('uploadImage error:', err.message);
        return null;
    }
}

export async function getImageById(id: string): Promise<{ image: string } | null> {
    try {
        const fileName = `${id}.png`;
        const publicUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/images/${fileName}`;

        const response = await fetch(publicUrl, { method: 'HEAD' });
        if (!response.ok) {
            console.warn(`Image ${fileName} not found`);
            return null;
        }

        return { image: publicUrl };
    } catch (err: any) {
        console.error('getImageById error:', err.message);
        return null;
    }
}

export async function deleteImage(id: string): Promise<boolean> {
    try {
        if (!GITHUB_TOKEN) {
            console.error('GITHUB_TOKEN not found');
            return false;
        }

        const fileName = `${id}.png`;
        const sha = await getFileSha(fileName);

        if (!sha) {
            console.error(`File ${fileName} not found or unable to get SHA`);
            return false;
        }

        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/images/${fileName}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({
                message: `Delete image ${fileName}`,
                sha: sha,
                branch: BRANCH
            })
        });

        return response.ok;
    } catch (err: any) {
        console.error('deleteImage error:', err.message);
        return false;
    }
}