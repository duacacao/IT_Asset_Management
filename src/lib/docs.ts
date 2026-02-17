import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const DOCS_DIRECTORY = path.join(process.cwd(), 'docs')

export interface DocMetadata {
    slug: string
    title: string
    description?: string
    section?: string
    order?: number
}

export interface DocContent extends DocMetadata {
    content: string
}

export function getAllDocs(): DocMetadata[] {
    // Check if docs directory exists
    if (!fs.existsSync(DOCS_DIRECTORY)) {
        return []
    }

    const fileNames = fs.readdirSync(DOCS_DIRECTORY)
    const allDocsData = fileNames
        .filter((fileName) => fileName.endsWith('.md'))
        .map((fileName) => {
            const slug = fileName.replace(/\.md$/, '')
            const fullPath = path.join(DOCS_DIRECTORY, fileName)
            const fileContents = fs.readFileSync(fullPath, 'utf8')
            const matterResult = matter(fileContents)

            return {
                slug,
                title: matterResult.data.title || slug,
                description: matterResult.data.description || '',
                section: matterResult.data.section || 'General',
                order: matterResult.data.order || 99,
            }
        })

    // Sort docs by order
    return allDocsData.sort((a, b) => (a.order || 99) - (b.order || 99))
}

export function getDocBySlug(slug: string): DocContent | null {
    try {
        const fullPath = path.join(DOCS_DIRECTORY, `${slug}.md`)
        if (!fs.existsSync(fullPath)) {
            // Fallback for intro if user accesses /docs root (logic handled in page)
            return null
        }

        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const matterResult = matter(fileContents)

        return {
            slug,
            content: matterResult.content,
            title: matterResult.data.title || slug,
            description: matterResult.data.description,
            section: matterResult.data.section,
            order: matterResult.data.order,
        }
    } catch (error) {
        return null
    }
}

export function getGroupedDocs() {
    const docs = getAllDocs()
    const grouped: Record<string, DocMetadata[]> = {}

    docs.forEach((doc) => {
        const section = doc.section || 'General'
        if (!grouped[section]) {
            grouped[section] = []
        }
        grouped[section].push(doc)
    })

    return grouped
}
