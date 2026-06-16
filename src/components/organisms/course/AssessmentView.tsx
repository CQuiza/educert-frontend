import { useState } from 'react'
import { toast } from 'sonner'
import { useModuleAssessment, useSubmitAssessment } from '../../../hooks/useModuleAssessments'
import Button from '../../atoms/Button'
import Spinner from '../../atoms/Spinner'
import AssessmentResult from './AssessmentResult'
import type { AttemptResult } from '../../../types'

interface AssessmentViewProps {
  moduleId: number
  onBack: () => void
}

export default function AssessmentView({ moduleId, onBack }: AssessmentViewProps) {
  const { data: assessment, isLoading } = useModuleAssessment(moduleId)
  const submit = useSubmitAssessment()
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<AttemptResult | null>(null)

  function setAnswer(questionId: number, optionId: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  async function handleSubmit() {
    if (!assessment) return
    const unanswered = assessment.questions.filter((q) => !(q.id in answers))
    if (unanswered.length > 0) {
      toast.error(`Faltan ${unanswered.length} pregunta(s) por responder`)
      return
    }
    try {
      const res = await submit.mutateAsync({
        assessmentId: assessment.id,
        data: {
          answers: Object.entries(answers).map(([qId, oId]) => ({
            question_id: Number(qId),
            selected_option_id: oId,
          })),
        },
      })
      setResult(res)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al enviar')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="py-8 text-center">
        <p className="text-neutral-500 mb-4">Este módulo no tiene evaluación configurada.</p>
        <Button variant="secondary" onClick={onBack}>Volver</Button>
      </div>
    )
  }

  if (result) {
    return <AssessmentResult result={result} passingScore={assessment.passing_score} onRetry={() => { setResult(null); setAnswers({}) }} onBack={onBack} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">Evaluación del módulo</p>
          <p className="text-xs text-neutral-400">
            {assessment.questions.length} pregunta(s) &middot; Mínimo {assessment.passing_score}% para aprobar
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onBack}>Volver</Button>
      </div>

      <div className="space-y-4">
        {assessment.questions.map((q, idx) => (
          <div key={q.id} className="rounded-lg border border-neutral-200 p-4">
            <p className="font-medium text-neutral-900 mb-3">
              {idx + 1}. {q.question_text}
              <span className="text-xs text-neutral-400 ml-2">({q.points} pt{q.points !== 1 ? 's' : ''})</span>
            </p>
            <div className="space-y-2">
              {q.options.map((o) => (
                <label
                  key={o.id}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                    answers[q.id] === o.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === o.id}
                    onChange={() => setAnswer(q.id, o.id)}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span className="text-sm text-neutral-700">{o.option_text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} loading={submit.isPending}>
          Enviar respuestas
        </Button>
      </div>
    </div>
  )
}
