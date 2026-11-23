'use client'

import { useEffect, useRef, useState } from 'react'
import { retain, subscribe } from '@/lib/realtime'

// Met aussi à jour les compteurs de commentaires dans la liste et le détail.
export function LiveCommentCount({ dropId, initialCount, knownIds = [] }: {
  dropId: number
  initialCount: number
  knownIds?: number[]
}) {
  const [count, setCount] = useState(initialCount)
  const seenIds = useRef(new Set(knownIds))

  useEffect(() => {
    knownIds.forEach(id => seenIds.current.add(id))
  }, [knownIds])

  useEffect(() => {
    const stop = subscribe('comment:created', data => {
      const event = data as { comment?: { id: number; dropId: number } }
      const comment = event.comment
      if (!comment || comment.dropId !== dropId || seenIds.current.has(comment.id)) return
      seenIds.current.add(comment.id)
      setCount(current => current + 1)
    })
    const release = retain()
    return () => {
      stop()
      release()
    }
  }, [dropId])

  return <>{count} commentaire{count === 1 ? '' : 's'}</>
}
