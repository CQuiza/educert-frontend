import Button from '../../atoms/Button'
import { CheckCircle, XCircle, RotateCcw, ArrowLeft } from 'lucide-react'
import type { AttemptResult } from '../../../types'

interface AssessmentResultProps {
  result: AttemptResult
  passingScore: number
  onRetry: () => void
  onBack: () => void
}

export default function AssessmentResult({ result, passingScore, onRetry, onBack }: AssessmentResultProps) {
  const passed = result.passed
  const pct = Math.round(result.score)

  return (
    <div className="space-y-6">
      <div className={`rounded-xl border-2 p-6 text-center ${
        passed ? 'border-success-200 bg-success-50' : 'border-danger-200 bg-danger-50'
      }`}>
        <div className={`text-5xl font-bold mb-2 ${passed ? 'text-success-600' : 'text-danger-600'}`}>
          {pct}%
        </div>
        <div className="flex items-center justify-center gap-2 text-lg font-semibold mb-1">
          {passed ? (
            <>
              <CheckCircle className="h-6 w-6 text-success-600" />
              <span className="text-success-700">¡Aprobado!</span>
            </>
          ) : (
            <>
              <XCircle className="h-6 w-6 text-danger-600" />
              <span className="text-danger-700">No aprobado</span>
            </>
          )}
        </div>
        <p className="text-sm text-neutral-500">
          {result.earned_points} de {result.total_points} puntos &middot; Mínimo {passingScore}%
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-700">Tus respuestas:</p>
        {result.answers.map((a) => (
          <div
            key={a.question_id}
            className={`flex items-start gap-3 rounded-lg border p-3 ${
              a.is_correct ? 'border-success-200 bg-success-50/50' : 'border-danger-200 bg-danger-50/50'
            }`}
          >
            {a.is_correct ? (
              <CheckCircle className="h-5 w-5 shrink-0 text-success-600 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-danger-600 mt-0.5" />
            )}
            <div>
              <p className="text-sm text-neutral-900">{a.question_text}</p>
              <p className="text-xs text-neutral-500">
                {a.is_correct ? 'Correcto' : 'Incorrecto'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        {!passed && (
          <Button onClick={onRetry}>
            <RotateCcw className="h-4 w-4" />
            Intentar de nuevo
          </Button>
        )}
      </div>
    </div>
  )
}
