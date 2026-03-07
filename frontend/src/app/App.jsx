import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { EditProfile } from '../pages/EditProfile';
import { Chat } from '../pages/Chat';
import { Feed } from '../pages/Feed';
import { Search } from '../pages/Search';
import { Profile } from '../pages/Profile';
import { PrivateLayout } from './layouts/PrivateLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { PublicRoute } from './routes/PublicRoute';
import { PrivateRoute } from './routes/PrivateRoute';
import './App.css'
import { ThemeShowcase } from '@/pages/dev/ThemeShowcase';

function App() {

  return (
    <Routes>

      {import.meta.env.DEV && (
        <Route path="/dev/theme-showcase" element={<ThemeShowcase />} />
      )}

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
      </Route>
    </Routes>
  )
}

export default App
