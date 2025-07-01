export interface Exercise {
    hash: string
    instructions: string
    content: string
    blockedBy?: string[] // hashes of other exercises
}