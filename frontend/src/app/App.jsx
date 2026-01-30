import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from '../pages/Home';
import { EditProfile } from '../pages/EditProfile';
import { Chat } from '../pages/Chat';
import { Feed } from '../pages/Feed';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { Search } from '../pages/Search';
import { Profile } from '../pages/Profile';
import './App.css'

function App() {

  return (
    <BrowserRouter>
      {/* <nav style={{display: 'flex', gap: '20px'}}>
        <Link to={"/"}>Home</Link>
        <Link to={"/login"}>Login</Link>
        <Link to={"/register"}>Register</Link>
        <Link to={"/feed"}>Feed</Link>
        <Link to={"/search"}>Search</Link>
        <Link to={"/profile"}>Profile</Link>
        <Link to={"/editProfile"}>EditProfile</Link>
        <Link to={"/chat"}>Chat</Link>
      </nav> */}
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/register' element={<RegisterPage/>}/>
        <Route path='/feed' element={<Feed/>}/>
        <Route path='/search' element={<Search />}/>
        <Route path='/profile' element={<Profile />}/>
        <Route path='/editProfile' element={<EditProfile />}/>
        <Route path='/chat' element={<Chat />}/>
        <Route path='/search' element={<Search />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
