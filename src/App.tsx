import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { Home } from './screens/Home'
import { Search } from './screens/Search'
import { Library } from './screens/Library'
import { AlbumDetail } from './screens/AlbumDetail'
import { PlaylistDetail } from './screens/PlaylistDetail'
import { useTelegramInit } from './hooks/useTelegramChrome'

export default function App() {
  useTelegramInit()

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/album/:id" element={<AlbumDetail />} />
          <Route path="/playlist/:id" element={<PlaylistDetail />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
