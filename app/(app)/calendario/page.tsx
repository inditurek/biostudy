import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CalendarioClient from '@/components/calendario/CalendarioClient'
import { cargarEventosMes, cargarTodosFecha } from './actions'

export default async function CalendarioPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoy = new Date()
  const year     = hoy.getFullYear()
  const month    = hoy.getMonth()   // 0-based
  const todayStr = hoy.toISOString().slice(0, 10)  // 'YYYY-MM-DD'

  const [eventosIniciales, todosIniciales] = await Promise.all([
    cargarEventosMes(year, month),
    cargarTodosFecha(todayStr),
  ])

  return (
    <CalendarioClient
      initialYear={year}
      initialMonth={month}
      initialEventos={eventosIniciales}
      initialTodos={todosIniciales}
      initialSelectedDate={todayStr}
    />
  )
}
