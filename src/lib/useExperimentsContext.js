import { useContext } from 'react'
import { ExperimentsContext } from '../context/experimentsContext'

export function useExperimentsContext() {
  const ctx = useContext(ExperimentsContext)
  if (!ctx) {
    throw new Error('useExperimentsContext must be used within ExperimentsProvider')
  }
  return ctx
}
