import { useParams } from 'react-router-dom'
import AssessmentView from '../components/organisms/course/AssessmentView'
import Card from '../components/molecules/Card'

export default function AssessmentTakePage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const moduleIdNum = Number(moduleId)

  return (
    <div className="p-6 lg:p-8">
      <Card>
        <AssessmentView moduleId={moduleIdNum} onBack={() => window.history.back()} />
      </Card>
    </div>
  )
}
