import { match } from 'ts-pattern'
import type { Annotation } from '../../types'

export const generateDefaultName = (type: Annotation['type'], id: string): string => {
  return match(type)
    .with('crux', () => `Crux ${id.replace('crux', '')}`)
    .with('rest', () => `Rest ${id.replace('rest', '')}`)
    .exhaustive()
}
