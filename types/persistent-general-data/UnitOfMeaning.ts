export interface UnitOfMeaning {
    uid: string
    language: string // references Language.tag, 
    content: string
    wordType: string
    pronunciation?: string
    notes?: string

    // note: translations and synonyms are the same thing in our context
    translations?: string[] // uids of other UnitOfMeanings
    related?: string[] // uids of other UnitOfMeanings

    userCreated: boolean
    credit?: UnitOfMeaningCredit // license information, if needed
}

export interface UnitOfMeaningCredit {
    creationContext: string
    license?: string
    owner?:string
    ownerLink?: string
    source?:string
    sourceLink?:string
}

export interface UnitOfMeaningSummary {
    uid: string
    content: string
}