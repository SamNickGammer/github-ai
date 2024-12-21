import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'
import { Document } from '@langchain/core/documents'
import { generateEmbedding, summariseCode } from './gemini'
import { db } from "@/server/db";

export const loadGitHubRepo = async (githubUrl: string, githubToken?: string) => {
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken || '',
        branch: 'main', // default is 'main'; can be any branch name
        ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'node_modules'],
        recursive: true, //If false, only the root directory will be loaded meaning subdirectories will be ignored
        unknown: 'warn',
        maxConcurrency: 5, // if you have a lot of files, you can increase this number to speed up the loading process

    })
    const docs = await loader.load()
    return docs
}

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?:string) => {
    const docs = await loadGitHubRepo(githubUrl, githubToken)
    const allEmbeddings = await generateEmbeddings(docs)
    await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
        console.log(`Indexing ${index} of ${allEmbeddings.length}`)
        if (!embedding) return
        
        const SourceCodeEmbedding = await db.sourceCodeEmbedding.create({
            data: {
                summary: embedding.summary,
                sourceCode: embedding.sourceCode,
                fileName: embedding.fileName,
                projectId,
            }
        })

        await db.$executeRaw`
            UPDATE "SourceCodeEmbedding"
            SET "summaryEmbedding" = ${embedding.embedding}::vector
            WHERE "id" = ${SourceCodeEmbedding.id}
        `
    }))
}

async function generateEmbeddings(docs: Document[]) {
    return await Promise.all(docs.map(async doc => {
        const summary = await summariseCode(doc)
        const embedding = await generateEmbedding(summary)
        return {
            summary,
            embedding,
            sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
            fileName: doc.metadata.source,
        }
    }))
}