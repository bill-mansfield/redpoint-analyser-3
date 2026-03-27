import type { Annotation } from '../../types'
import type { TacticalPhase, CruxProgress, RestProgress, LinkProgress, SessionSuggestion } from './types'
import { match } from 'ts-pattern'

type SuggestionInputs = {
  currentPhase: TacticalPhase
  cruxProgress: CruxProgress[]
  restProgress: RestProgress[]
  linkProgress: LinkProgress[]
  annotations: readonly Annotation[]
}

const findAnnotation = (id: string, annotations: readonly Annotation[]): Annotation | undefined =>
  annotations.find((a) => a.id === id)

const firstUnworkedCrux = (cruxProgress: CruxProgress[], annotations: readonly Annotation[]): Annotation | undefined => {
  const unworked = cruxProgress.find((c) => !c.isWorkedOut && !c.isDialed)
  return unworked ? findAnnotation(unworked.annotationId, annotations) : undefined
}

const hardestUndialedCrux = (cruxProgress: CruxProgress[], annotations: readonly Annotation[]): Annotation | undefined => {
  const undialed = cruxProgress
    .filter((c) => !c.isDialed)
    .sort((a, b) => b.difficultyRating - a.difficultyRating)
  const top = undialed[0]
  return top ? findAnnotation(top.annotationId, annotations) : undefined
}

const firstUnestablishedRest = (restProgress: RestProgress[], annotations: readonly Annotation[]): Annotation | undefined => {
  const unestablished = restProgress.find((r) => !r.isEstablished)
  return unestablished ? findAnnotation(unestablished.annotationId, annotations) : undefined
}

const firstUnlinkedSection = (linkProgress: LinkProgress[], annotations: readonly Annotation[]): Annotation | undefined => {
  const unlinked = linkProgress.find((l) => !l.isLinked)
  return unlinked ? findAnnotation(unlinked.fromId, annotations) : undefined
}

export const suggestSessionFocus = ({
  currentPhase,
  cruxProgress,
  restProgress,
  linkProgress,
  annotations,
}: SuggestionInputs): SessionSuggestion =>
  match(currentPhase)
    .with('work_cruxes', () => {
      const target = firstUnworkedCrux(cruxProgress, annotations) ?? hardestUndialedCrux(cruxProgress, annotations)
      return {
        primary: {
          type: 'work_crux' as const,
          description: target
            ? `Work out the moves on ${target.name} — figure out beta, don't project the link yet.`
            : 'All cruxes have been worked out. Start establishing rests.',
          targetAnnotation: target,
        },
        phaseContext: 'Focus on the hardest unworked crux first. If you can\'t do the move, linking is wasted energy.',
      }
    })
    .with('establish_rests', () => {
      const target = firstUnestablishedRest(restProgress, annotations)
      const secondaryCrux = hardestUndialedCrux(cruxProgress, annotations)
      return {
        primary: {
          type: 'establish_rest' as const,
          description: target
            ? `Find your recovery position at ${target.name}. Stay until your forearms drain.`
            : 'All rests established. Move on to linking sections.',
          targetAnnotation: target,
        },
        secondary: secondaryCrux
          ? {
              type: 'work_crux' as const,
              description: `Keep working ${secondaryCrux.name} — dial the moves in isolation.`,
              targetAnnotation: secondaryCrux,
            }
          : undefined,
        phaseContext: 'Rests are weapons. A marginal rest used well beats a good rest ignored.',
      }
    })
    .with('link_sections', () => {
      const target = firstUnlinkedSection(linkProgress, annotations)
      return {
        primary: {
          type: 'link_section' as const,
          description: target
            ? `Link the section starting from ${target.name} to the next anchor point.`
            : 'All sections linked. Start low-pointing.',
          targetAnnotation: target,
        },
        phaseContext: 'Link one section at a time — crux to crux, crux to rest. No full runs yet.',
      }
    })
    .with('low_points', () => ({
      primary: {
        type: 'low_point' as const,
        description: 'Start as low as you can and climb to the top. Lower your start each session.',
        targetAnnotation: undefined,
      },
      phaseContext: 'Low-pointing builds proof. The lower you start, the more you know you can do it.',
    }))
    .with('high_points', () => ({
      primary: {
        type: 'high_point' as const,
        description: 'Climb from the ground past each crux. Focus on arriving at rests in control.',
        targetAnnotation: undefined,
      },
      phaseContext: 'You\'re nearly there. High-pointing builds the full-route mental map.',
    }))
    .with('pre_send_mindset', () => ({
      primary: {
        type: 'mindset_prep' as const,
        description: 'Complete the five readiness checks before your first attempt today.',
        targetAnnotation: undefined,
      },
      phaseContext: 'The tactical work is done. Now prepare your mind to execute what you already know.',
    }))
    .with('redpoint', () => ({
      primary: {
        type: 'send_attempt' as const,
        description: 'Go for it. You have earned this attempt.',
        targetAnnotation: undefined,
      },
      phaseContext: 'Send readiness is above threshold. Trust the process you built.',
    }))
    .exhaustive()
