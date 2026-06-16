import { useState } from 'react'
import { toast } from 'sonner'
import { useModuleAssessment, useUpsertAssessment, useDeleteAssessment } from '../../../hooks/useModuleAssessments'
import type { AssessmentOptionWithCorrect } from '../../../types/moduleAssessment'
import Modal from '../../molecules/Modal'
import Button from '../../atoms/Button'
import { Plus, Trash2 } from 'lucide-react'

interface AssessmentManagerProps {
  moduleId: number | null
  onClose: () => void
}

interface QuestionForm {
  question_text: string
  question_type: 'multiple_choice' | 'true_false'
  points: number
  order_index: number
  options: { option_text: string; is_correct: boolean }[]
}

const emptyOption = () => ({ option_text: '', is_correct: false })

function emptyQuestion(order: number): QuestionForm {
  return {
    question_text: '',
    question_type: 'multiple_choice',
    points: 1,
    order_index: order,
    options: [emptyOption(), emptyOption()],
  }
}

function AssessmentForm({
  moduleId,
  initial,
  onClose,
}: {
  moduleId: number
  initial: NonNullable<ReturnType<typeof useModuleAssessment>['data']> | null
  onClose: () => void
}) {
  const upsert = useUpsertAssessment()
  const deleteAssessment = useDeleteAssessment()

  const [passingScore, setPassingScore] = useState(initial?.passing_score ?? 70)
  const [questions, setQuestions] = useState<QuestionForm[]>(
    initial
      ? initial.questions.map((q) => ({
          question_text: q.question_text,
          question_type: q.question_type as 'multiple_choice' | 'true_false',
          points: q.points,
          order_index: q.order_index,
          options: q.options.map((o) => ({
            option_text: o.option_text,
            is_correct: (o as AssessmentOptionWithCorrect).is_correct ?? false,
          })),
        }))
      : [emptyQuestion(0)],
  )

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion(prev.length)])
  }

  function removeQuestion(idx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateQuestion(idx: number, field: Partial<QuestionForm>) {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...field } : q)))
  }

  function addOption(qIdx: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: [...q.options, emptyOption()] } : q,
      ),
    )
  }

  function removeOption(qIdx: number, oIdx: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.filter((_, j) => j !== oIdx) } : q,
      ),
    )
  }

  function updateOption(qIdx: number, oIdx: number, field: Partial<{ option_text: string; is_correct: boolean }>) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((o, j) => (j === oIdx ? { ...o, ...field } : o)) }
          : q,
      ),
    )
  }

  function setCorrectOption(qIdx: number, oIdx: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((o, j) => ({ ...o, is_correct: j === oIdx })) }
          : q,
      ),
    )
  }

  async function handleSave() {
    const valid = questions.every(
      (q) => q.question_text.trim() && q.options.some((o) => o.is_correct) && q.options.every((o) => o.option_text.trim()),
    )
    if (!valid) {
      toast.error('Completa todas las preguntas y asegúrate de marcar una opción correcta')
      return
    }
    try {
      await upsert.mutateAsync({
        moduleId,
        data: {
          passing_score: passingScore,
          questions: questions.map((q, i) => ({
            question_text: q.question_text,
            question_type: q.question_type,
            points: q.points,
            order_index: i,
            options: q.options.map((o) => ({ option_text: o.option_text, is_correct: o.is_correct })),
          })),
        },
      })
      toast.success(initial ? 'Evaluación actualizada' : 'Evaluación creada')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  async function handleDelete() {
    if (!initial) return
    try {
      await deleteAssessment.mutateAsync(initial.id)
      toast.success('Evaluación eliminada')
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  return (
    <>
      <div className="shrink-0 space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Puntaje mínimo para aprobar (%)
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {initial && (
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={handleDelete} loading={deleteAssessment.isPending}>
              Eliminar evaluación
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-y-auto flex-1 space-y-4 pr-1">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="rounded-lg border border-neutral-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Pregunta {qIdx + 1}</span>
              <button
                onClick={() => removeQuestion(qIdx)}
                className="rounded-lg p-1 text-neutral-400 hover:text-danger-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div>
              <textarea
                value={q.question_text}
                onChange={(e) => updateQuestion(qIdx, { question_text: e.target.value })}
                rows={2}
                className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Texto de la pregunta"
              />
            </div>

            <div className="flex gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Tipo</label>
                <select
                  value={q.question_type}
                  onChange={(e) => {
                    const t = e.target.value as 'multiple_choice' | 'true_false'
                    updateQuestion(qIdx, {
                      question_type: t,
                      options: t === 'true_false'
                        ? [{ option_text: 'Verdadero', is_correct: false }, { option_text: 'Falso', is_correct: false }]
                        : [emptyOption(), emptyOption()],
                    })
                  }}
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="multiple_choice">Opción múltiple</option>
                  <option value="true_false">Verdadero/Falso</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Puntos</label>
                <input
                  type="number"
                  min={1}
                  value={q.points}
                  onChange={(e) => updateQuestion(qIdx, { points: Number(e.target.value) })}
                  className="w-20 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-neutral-500">Opciones</label>
              {q.options.map((o, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qIdx}`}
                    checked={o.is_correct}
                    onChange={() => setCorrectOption(qIdx, oIdx)}
                    className="h-4 w-4 text-primary-600"
                  />
                  {q.question_type === 'true_false' ? (
                    <span className="text-sm text-neutral-700">{o.option_text}</span>
                  ) : (
                    <input
                      value={o.option_text}
                      onChange={(e) => updateOption(qIdx, oIdx, { option_text: e.target.value })}
                      className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Texto de la opción"
                    />
                  )}
                  {q.question_type !== 'true_false' && q.options.length > 2 && (
                    <button
                      onClick={() => removeOption(qIdx, oIdx)}
                      className="p-1 text-neutral-400 hover:text-danger-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {q.question_type !== 'true_false' && q.options.length < 4 && (
                <button onClick={() => addOption(qIdx)} className="text-xs text-primary-600 hover:underline">
                  + Agregar opción
                </button>
              )}
            </div>
          </div>
        ))}

        <Button variant="secondary" onClick={addQuestion}>
          <Plus className="h-4 w-4" />
          Agregar pregunta
        </Button>
      </div>

      <div className="shrink-0 flex justify-end gap-3 pt-4 border-t border-neutral-200 mt-4">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} loading={upsert.isPending}>
          {initial ? 'Guardar cambios' : 'Crear evaluación'}
        </Button>
      </div>
    </>
  )
}

export default function AssessmentManager({ moduleId, onClose }: AssessmentManagerProps) {
  const { data: assessment, isLoading } = useModuleAssessment(moduleId ?? 0, { enabled: moduleId !== null })

  return (
    <Modal open={moduleId !== null} onClose={onClose} title="Evaluación del módulo">
      {isLoading ? (
        <p className="text-sm text-neutral-500 py-4">Cargando...</p>
      ) : (
        <div className="max-h-[90vh] flex flex-col" key={moduleId ?? 'new'}>
          <AssessmentForm moduleId={moduleId!} initial={assessment ?? null} onClose={onClose} />
        </div>
      )}
    </Modal>
  )
}
