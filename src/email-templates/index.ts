import fs from 'fs';
import path from 'path';

type TemplateData = Record<string, string | number | boolean | null | undefined>;

function safeTemplateRender(templatePath: string, data: TemplateData): string {
    try {
        const template = fs.readFileSync(templatePath, 'utf-8');
        return template.replace(/\$\{data\.(\w+)\}/g, (match, key) => {
            if (data && Object.prototype.hasOwnProperty.call(data, key)) {
                // Escape HTML to prevent XSS
                return String(data[key])
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;');
            }
            return match;
        });
    } catch (error) {
        console.error(`Template rendering error for ${templatePath}:`, error);
        throw new Error('Template rendering failed');
    }
}

export function WELCOME_TEMPLATE(data: TemplateData): string {
    return safeTemplateRender(path.join(__dirname, 'welcome.html'), data);
}