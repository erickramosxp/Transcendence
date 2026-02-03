import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from '../pages/Home';
import { EditProfile } from '../pages/EditProfile';
import { Chat } from '../pages/Chat';
import { Feed } from '../pages/Feed';
import { Search } from '../pages/Search';
import { Profile } from '../pages/Profile';
import './App.css'

function App() {

  return (
    <Routes>
      <Route path='/' element={<Home />} />
        <Route path='/feed' element={<Feed/>}/>
        <Route path='/search' element={<Search />}/>
        <Route path='/profile' element={<Profile />}/>
        <Route path='/editProfile' element={<EditProfile />}/>
        <Route path='/chat' element={<Chat />}/>
        <Route path='/search' element={<Search />}/>
    </Routes>
  )
}

export default App
