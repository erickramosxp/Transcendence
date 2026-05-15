import { Routes, Route } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { EditProfile } from '@/pages/EditProfile';
import { Chat } from '@/pages/Chat';
import { Feed } from '@/pages/Feed';
import { Search } from '@/pages/Search';
import { Profile } from '@/pages/Profile';
import { Friends } from '@/pages/Friends';
import { Notifications } from '@/pages/Notifications';
import { PrivacyPolicy } from '@/pages/LegalPrivacy';
import { TermsOfService } from '@/pages/LegalTerms';
import { PrivateLayout } from '@/app/layouts/PrivateLayout';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { PublicRoute } from '@/app/routes/PublicRoute';
import { PrivateRoute } from '@/app/routes/PrivateRoute';
import { ThemeShowcase } from '@/pages/dev/ThemeShowcase';
import './App.css'
import { NotFound } from '@/pages/NotFound';

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
        <Route path='/legal/privacy' element={<PrivacyPolicy />} />
        <Route path='/legal/terms' element={<TermsOfService />}/>
      </Route>


      <Route element={
          <PrivateRoute>
            <PrivateLayout />
          </PrivateRoute>
        }>


        <Route path='/' element={<Feed/>}/> 
        <Route path='/feed' element={<Feed/>}/> 
        <Route path='/search' element={<Search />}/>
        <Route path='/profile' element={<Profile />}/>
        <Route path='/profile/:username' element={<Profile />}/>
        <Route path='/:username' element={<Profile />}/>
        <Route path='/editProfile' element={<EditProfile />}/>
        <Route path='/chat' element={<Chat />}/>
        <Route path='/notifications' element={<Notifications />}/>
        <Route path='/friends' element={<Friends />}/>


      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
