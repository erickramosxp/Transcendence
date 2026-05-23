import { Routes, Route } from 'react-router-dom';
import { RouteDocumentTitle } from '@/shared/documentTitle';
import { Home } from '@/pages/Home';
import { Chat } from '@/pages/Chat';
import { Feed } from '@/pages/Feed';
import { Profile } from '@/pages/Profile';
import { Friends } from '@/pages/Friends';
import { Notifications } from '@/pages/Notifications';
import { PrivacyPolicy } from '@/pages/LegalPrivacy';
import { TermsOfService } from '@/pages/LegalTerms';
import { PrivateLayout } from '@/app/layouts/PrivateLayout';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { PublicRoute } from '@/app/routes/PublicRoute';
import { PrivateRoute } from '@/app/routes/PrivateRoute';
import { UsernameProfileRoute } from '@/app/routes/UsernameProfileRoute';
import './App.css'
import { NotFound } from '@/pages/NotFound';

function App() {


  return (
    <>
      <RouteDocumentTitle />
      <Routes>

      <Route path="/404" element={<NotFound />} />

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
        <Route path='/profile' element={<Profile />}/>
        <Route path='/profile/:username' element={<Profile />}/>
        <Route path='/chat' element={<Chat />}/>
        <Route path='/notifications' element={<Notifications />}/>
        <Route path='/friends' element={<Friends />}/>
        <Route path='/:username' element={<UsernameProfileRoute />}/>


      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  )
}

export default App
