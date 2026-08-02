import { useReducer, useState } from 'react'
import { CombatScreen } from './components/CombatScreen'
import { GameShell } from './components/GameShell'
import { Landing } from './components/Landing'
import { Setup } from './components/Setup'
import { VictoryScreen } from './components/VictoryScreen'
import { collectIncome, createGame } from './game/engine'
import type { GameState, SetupConfig } from './game/types'

type Screen = 'landing' | 'setup' | 'game'

type Action =
  | { type: 'replace'; state: GameState | null }
  | { type: 'patch'; fn: (s: GameState) => GameState }

function reducer(state: GameState | null, action: Action): GameState | null {
  if (action.type === 'replace') return action.state
  if (!state) return state
  return action.fn(state)
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [game, dispatch] = useReducer(reducer, null)

  const startSetup = () => setScreen('setup')

  const beginGame = (config: SetupConfig) => {
    let state = createGame(config)
    state = collectIncome(state, 0)
    dispatch({ type: 'replace', state })
    setScreen('game')
  }

  const apply = (fn: (s: GameState) => GameState) => {
    dispatch({ type: 'patch', fn })
  }

  const restart = () => {
    dispatch({ type: 'replace', state: null })
    setScreen('landing')
  }

  if (screen === 'landing') {
    return <Landing onBegin={startSetup} />
  }

  if (screen === 'setup' || !game) {
    return <Setup onStart={beginGame} onBack={() => setScreen('landing')} />
  }

  if (game.phase === 'victory') {
    return <VictoryScreen state={game} onRestart={restart} />
  }

  if (game.phase === 'combat' && game.combat) {
    return <CombatScreen state={game} apply={apply} />
  }

  return <GameShell state={game} apply={apply} onResign={restart} />
}
