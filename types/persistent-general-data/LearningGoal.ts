export interface LearningGoal {
    id?: number

    parents: number[] // array of learning-goal ids
    blockedBy: number[] // array of learning-goal ids

    language: string // is Language.name

    unitsOfMeaning: number[] // array of unit-of-meaning ids
    

}