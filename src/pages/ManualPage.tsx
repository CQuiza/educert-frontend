import { useState } from 'react'
import { Shield, Star, ChevronDown, ChevronRight, BookOpen } from 'lucide-react'
import { config } from '../config'

const sections = {
  superuser: {
    title: 'Manual para Superusuario',
    icon: Star,
    color: 'text-warning-600',
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    items: [
      {
        title: 'Gestión de Usuarios',
        content: (
          <div className="space-y-2">
            <p><strong>Crear usuario:</strong> Todos los campos son obligatorios excepto el segundo apellido. El sistema envía automáticamente un correo con las credenciales al email registrado. Solo un superusuario puede crear a otro superusuario.</p>
            <p><strong>Editar usuario:</strong> Se puede modificar cualquier campo. Solo un superusuario puede cambiar el rol de un usuario a superusuario o editar a otro superusuario.</p>
            <p><strong>Desactivar usuario</strong> (recomendado en lugar de eliminar): En la edición del usuario, cambiar el campo "Activo" a "No". El usuario no podrá iniciar sesión pero toda su información (certificados, progreso, inscripciones) se conserva íntegramente en el sistema.</p>
            <p><strong>Eliminar usuario:</strong> Solo disponible para superusuarios y administradores. Al eliminar:</p>
            <ul className="list-disc list-inside ml-2 text-sm text-neutral-600 space-y-1">
              <li>Se guarda un volcado JSON completo (datos personales, certificados, inscripciones, progreso, cursos como docente) en la tabla de auditoría de usuarios.</li>
              <li>Los certificados, inscripciones a cursos y progreso del usuario se eliminan en cascada.</li>
              <li>Si el usuario es docente de algún curso, ese curso queda sin docente asignado (teacher_id = NULL).</li>
              <li>No se puede eliminar si el usuario tiene tipos de certificado creados o registros de auditoría asociados. En ese caso, desactívelo en lugar de eliminarlo.</li>
            </ul>
            <p><strong>Superusuarios:</strong> No pueden ser eliminados. Debe haber al menos un superusuario activo. Solo otro superusuario puede verlos, editarlos o crear nuevos.</p>
          </div>
        ),
      },
      {
        title: 'Roles y Permisos',
        content: (
          <div className="space-y-3">
            <p>Cada rol tiene acceso a diferentes funcionalidades:</p>
            <div className="grid gap-3">
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="font-semibold text-neutral-900">⭐ Superusuario</p>
                <p className="text-sm text-neutral-600">Acceso total a todas las funcionalidades. Puede crear/editar/eliminar cualquier recurso, incluyendo otros superusuarios. Puede habilitar u ocultar el rol de docente mediante la variable de entorno <code className="text-xs bg-neutral-100 px-1 py-0.5 rounded">VITE_SHOW_TEACHER_ROLE</code>.</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="font-semibold text-neutral-900">🛡️ Administrador</p>
                <p className="text-sm text-neutral-600">Gestiona usuarios (excepto superusuarios), cursos, tipos de certificado, emite certificados y accede a la auditoría. No puede crear/editar/ver superusuarios. Opcionalmente se le puede ocultar la pestaña Cursos con la variable <code className="text-xs bg-neutral-100 px-1 py-0.5 rounded">VITE_HIDE_COURSES_FOR_ADMIN</code>.</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="font-semibold text-neutral-900">👨‍🏫 Docente</p>
                <p className="text-sm text-neutral-600">Gestiona módulos, lecciones y tareas dentro de los cursos que tiene asignados. Ve sus propios certificados. Solo visible si el superusuario activa el rol mediante <code className="text-xs bg-neutral-100 px-1 py-0.5 rounded">VITE_SHOW_TEACHER_ROLE=True</code>.</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="font-semibold text-neutral-900">🎓 Estudiante</p>
                <p className="text-sm text-neutral-600">Ve los cursos en los que está inscrito, accede a módulos y lecciones, realiza tareas (solo lectura, no puede subir archivos) y consulta sus certificados emitidos.</p>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: 'Gestión de Certificados',
        content: (
          <div className="space-y-2">
            <p><strong>Workflow para emitir un certificado:</strong></p>
            <ol className="list-decimal list-inside ml-2 text-sm text-neutral-600 space-y-1">
              <li>Crear un <strong>Tipo de certificado</strong> (si no existe): nombre, tipo (básico/avanzado/diplomado), horas, vigencia. Esto define la validez del certificado.</li>
              <li>El <strong>Usuario</strong> debe estar creado en el sistema con sus datos (nombre, identificación, correo).</li>
              <li>Ir a la sección <strong>Certificados → "Adicionar Nuevo Certificado"</strong>. Seleccionar el usuario y el tipo de certificado. Opcionalmente se puede especificar una fecha de emisión.</li>
              <li>El sistema genera automáticamente un UUID único, código QR y PDF del certificado.</li>
            </ol>
            <p className="mt-2"><strong>Revocación de certificados:</strong> En la sección Certificados, usar el botón de editar (lápiz) sobre un certificado y cambiar su estado a "revoked". El certificado seguirá siendo consultable pero aparecerá como revocado, manteniendo su integridad como registro histórico.</p>
            <p><strong>Búsqueda pública:</strong> Cualquier persona puede buscar certificados por número de identificación en la página /search sin necesidad de autenticación.</p>
          </div>
        ),
      },
      {
        title: 'Cursos',
        content: (
          <div className="space-y-2">
            <p><strong>Creación de cursos:</strong> Los administradores y superusuarios crean cursos de forma independiente. Un curso puede tener opcionalmente:</p>
            <ul className="list-disc list-inside ml-2 text-sm text-neutral-600 space-y-1">
              <li><strong>Docente asignado:</strong> Solo visible si el rol docente está habilitado. El docente podrá gestionar módulos y lecciones del curso.</li>
              <li><strong>Tipo de certificado asociado:</strong> Relaciona el curso con un tipo de certificado, útil para emitir certificados automáticos al completar.</li>
            </ul>
            <p><strong>Estados:</strong> draft (borrador, no visible), published (publicado, visible en el catálogo público), archived (archivado, oculto). Los cursos publicados aparecen en el catálogo sin autenticación.</p>
            <p><strong>Módulos y Lecciones:</strong> Cada curso puede tener múltiples módulos, y cada módulo múltiples lecciones. Las lecciones pueden incluir texto, imágenes, videos y archivos adjuntos. También se pueden crear tareas por lección con archivos subidos a MinIO o enlaces de Google Drive.</p>
            <p><strong>Asignar cursos a estudiantes:</strong> Desde la sección Usuarios, usando el botón de cursos en cada usuario, se pueden asignar cursos publicados. El estudiante verá solo los cursos en los que está inscrito.</p>
          </div>
        ),
      },
      {
        title: 'Auditoría',
        content: (
          <div className="space-y-2">
            <p>La sección Auditoría tiene 4 pestañas con información de solo lectura:</p>
            <ul className="list-disc list-inside ml-2 text-sm text-neutral-600 space-y-1">
              <li><strong>Certificados:</strong> Registro de todas las acciones sobre certificados: emisión, revocación, expiración. Incluye acción, certificado afectado, usuario que realizó la acción y fecha.</li>
              <li><strong>Trabajos:</strong> Historial de trabajos en segundo plano como expiración de certificados y backups. Muestra tarea, estado, inicio, fin y detalles.</li>
              <li><strong>Usuarios eliminados:</strong> Volcado JSON completo con todos los datos y relaciones de usuarios eliminados (certificados, inscripciones, progreso, cursos como docente). Permite reconstruir la información histórica.</li>
              <li><strong>Correos:</strong> Registro de envío de correos electrónicos (credenciales, notificaciones de emisión y expiración). Muestra destinatario, tipo, estado (sent/pending/failed) y error si ocurrió.</li>
            </ul>
          </div>
        ),
      },
    ],
  },
  admin: {
    title: 'Manual para Administrador',
    icon: Shield,
    color: 'text-primary-600',
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    items: [
      {
        title: 'Gestión de Usuarios',
        content: (
          <div className="space-y-2">
            <p><strong>Crear usuario:</strong> Todos los campos son obligatorios excepto el segundo apellido. Se envía un correo automático con las credenciales. No se puede crear usuarios con rol superusuario.</p>
            <p><strong>Editar usuario:</strong> Se puede modificar cualquier campo excepto el rol de un usuario a superusuario. Los superusuarios no son visibles para administradores.</p>
            <p><strong>Desactivar usuario:</strong> En la edición, cambiar "Activo" a "No". El usuario no podrá iniciar sesión pero se conservan todos sus datos y relaciones.</p>
            <p><strong>Eliminar usuario:</strong> Al eliminar un usuario se guarda un volcado JSON de toda su información. No se puede eliminar si tiene tipos de certificado creados o registros de auditoría asociados.</p>
          </div>
        ),
      },
      {
        title: 'Tipos de Certificado',
        content: (
          <div className="space-y-2">
            <p>Los tipos de certificado definen la plantilla que usará el sistema al emitir un certificado. Cada tipo tiene:</p>
            <ul className="list-disc list-inside ml-2 text-sm text-neutral-600 space-y-1">
              <li><strong>Nombre:</strong> Identificador del tipo (ej. "Diplomado en Python").</li>
              <li><strong>Tipo:</strong> basic, advanced o diploma. Cada uno tiene valores por defecto de horas y vigencia.</li>
              <li><strong>Horas:</strong> Duración académica del certificado.</li>
              <li><strong>Vigencia:</strong> Período de validez del certificado (ej. 2 años).</li>
              <li><strong>Referencia:</strong> Campo opcional para código interno o referencia del tipo.</li>
            </ul>
            <p className="mt-2">Los tipos de certificado se usan al emitir certificados y al asignarlos opcionalmente a cursos.</p>
          </div>
        ),
      },
      {
        title: 'Emisión y Revocación de Certificados',
        content: (
          <div className="space-y-2">
            <p><strong>Emitir certificado:</strong></p>
            <ol className="list-decimal list-inside ml-2 text-sm text-neutral-600 space-y-1">
              <li>Asegúrese de tener un <strong>Tipo de certificado</strong> creado.</li>
              <li>Asegúrese de que el <strong>Usuario</strong> destinatario esté registrado.</li>
              <li>Vaya a <strong>Certificados → "Adicionar Nuevo Certificado"</strong>.</li>
              <li>Seleccione el usuario (búsqueda por nombre o identidad) y el tipo de certificado.</li>
              <li>Opcional: ajuste la fecha de emisión.</li>
              <li>El sistema genera el PDF, código QR y UUID automáticamente.</li>
            </ol>
            <p className="mt-2"><strong>Revocar certificado:</strong> Edite el certificado (icono de lápiz) y cambie el estado a "revoked". Esto lo marca como revocado pero mantiene el registro histórico. No se puede eliminar certificados.</p>
          </div>
        ),
      },
      {
        title: 'Auditoría',
        content: (
          <div className="space-y-2">
            <p>La sección Auditoría tiene 4 pestañas con información de solo lectura:</p>
            <ul className="list-disc list-inside ml-2 text-sm text-neutral-600 space-y-1">
              <li><strong>Certificados:</strong> Historial completo de acciones sobre certificados: emisiones, cambios de estado, expiraciones. Solo lectura.</li>
              <li><strong>Trabajos:</strong> Historial de trabajos en segundo plano como expiración de certificados y backups.</li>
              <li><strong>Usuarios eliminados:</strong> Volcado JSON de toda la información de usuarios eliminados.</li>
              <li><strong>Correos:</strong> Registro de envío de correos electrónicos con estado (sent/pending/failed) y error si ocurrió.</li>
            </ul>
            <p className="mt-2">Cuando un usuario es eliminado, también se guarda un volcado JSON en la tabla de auditoría de usuarios con toda su información histórica.</p>
          </div>
        ),
      },
      {
        title: 'Buenas Prácticas',
        content: (
          <div className="space-y-2 text-sm text-neutral-600">
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Desactivar en lugar de eliminar:</strong> Siempre que sea posible, desactive un usuario en lugar de eliminarlo. Esto preserva la integridad de los certificados emitidos, inscripciones a cursos, progreso y registros históricos.</li>
              <li><strong>Revocar en lugar de eliminar:</strong> Si un certificado ya no debe ser válido, cámbielo a estado "revoked". Esto mantiene el registro para auditoría pero invalida el certificado.</li>
              <li><strong>Archivar cursos:</strong> En lugar de eliminar cursos, cámbielos a estado "archived". Los estudiantes inscritos conservan su acceso pero el curso no aparece en el catálogo público.</li>
              <li><strong>Tipos de certificado:</strong> No elimine tipos de certificado que estén en uso por certificados emitidos o cursos. En su lugar, cree un nuevo tipo si necesita modificar parámetros.</li>
              <li><strong>Verificar emisión:</strong> Antes de emitir un certificado, verifique que el tipo de certificado tenga los valores correctos de horas y vigencia.</li>
            </ul>
          </div>
        ),
      },
    ],
  },
}

export default function ManualPage() {
  const [role, setRole] = useState<'superuser' | 'admin'>('superuser')
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0]))

  function toggleItem(idx: number) {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const current = sections[role]

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Manual de Uso</h1>
          <p className="mt-1 text-sm text-neutral-500">Guía completa de la plataforma {config.appName}</p>
        </div>
      </div>

      <div className="mb-6 flex gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-1">
        <button
          onClick={() => setRole('superuser')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            role === 'superuser'
              ? 'bg-white text-warning-700 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Star className="h-4 w-4" />
          Superusuario
        </button>
        <button
          onClick={() => setRole('admin')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            role === 'admin'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Shield className="h-4 w-4" />
          Administrador
        </button>
      </div>

      <div className="space-y-3">
        {current.items.map((item, i) => {
          const open = openItems.has(i)
          const Icon = (item as { icon?: typeof BookOpen }).icon || (i === 0 ? BookOpen : current.icon)
          return (
            <div key={i} className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              <button
                onClick={() => toggleItem(i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-neutral-50"
              >
                <span className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${current.color}`} />
                  <span className="font-semibold text-neutral-900">{item.title}</span>
                </span>
                {open ? <ChevronDown className="h-5 w-5 text-neutral-400 shrink-0" /> : <ChevronRight className="h-5 w-5 text-neutral-400 shrink-0" />}
              </button>
              {open && (
                <div className="border-t border-neutral-100 px-5 py-4 text-sm text-neutral-700 leading-relaxed">
                  {item.content}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
