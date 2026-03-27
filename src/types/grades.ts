export type GradingSystemId =
  | 'ewbanks'
  | 'yds'
  | 'french'
  | 'british_tech'
  // Boulder-specific systems
  | 'v_scale'
  | 'font_boulder'

export type GradingSystemDiscipline = 'rope' | 'boulder'

export type GradingSystem = {
  id: GradingSystemId
  name: string
  shortName: string
  discipline: GradingSystemDiscipline
  grades: ReadonlyArray<string | null> // Index-aligned: grades[1] = grade at universal index 1, null = no equivalent
}
