import Header from './components/Header'
import Names from './components/games/Names'

function App() {
  return (
    <>
      <Header />
      <main className="mb-auto">
        <Names />
      </main>
      <footer className="flex items-center justify-center	bg-neutral">
        <p className="my-5 text-neutral-content">2021</p>
      </footer>
    </>
  )
}

export default App
