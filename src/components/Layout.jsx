import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import { useAuth } from '../context/AuthContext'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

export default function Layout({ children, hideFooter = false }) {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect admin and trainer away from public pages to their dashboard
  useEffect(() => {
    if (loading || !user || !profile) return
    const role = profile.role
    if (role === 'admin')   navigate('/dashboard/admin',   { replace: true })
    if (role === 'trainer') navigate('/dashboard/trainer', { replace: true })
  }, [user, profile, loading])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className="flex-1"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {!hideFooter && <Footer />}
    </div>
  )
}
