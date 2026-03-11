import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { EditProfile } from '../pages/EditProfile';
import { Chat } from '../pages/Chat';
import { Feed } from '../pages/Feed';
import { Search } from '../pages/Search';
import { Profile } from '../pages/Profile';
import { Notifications } from '../pages/Notifications';
import { Friends } from '../pages/Friends';
import { PrivateLayout } from './layouts/PrivateLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { PublicRoute } from './routes/PublicRoute';
import { PrivateRoute } from './routes/PrivateRoute';
import './App.css'

function App() {

  return (
    <Routes>

      <Route element={<PublicLayout />}>

        <Route path='/'
          element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          }
        />
      </Route>


      <Route element={
          <PrivateRoute>
            <PrivateLayout />
          </PrivateRoute>
        }>

        <Route path='/feed' element={<Feed/>}/>
        <Route path='/search' element={<Search />}/>
        <Route path='/profile' element={<Profile />}/>
        <Route path='/editProfile' element={<EditProfile />}/>
        <Route path='/chat' element={<Chat />}/>
        <Route path='/notifications' element={<Notifications />}/>
        <Route path='/friends' element={<Friends />}/>
      </Route>
    </Routes>
  )
}

export default App
