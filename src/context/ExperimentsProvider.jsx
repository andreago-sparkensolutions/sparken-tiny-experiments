import { useExperiments } from '../lib/useExperiments'
import { ExperimentsContext } from './experimentsContext'

export default function ExperimentsProvider({ children }) {
  const data = useExperiments()
  return <ExperimentsContext.Provider value={data}>{children}</ExperimentsContext.Provider>
}
