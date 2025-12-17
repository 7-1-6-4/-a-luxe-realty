import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            A-LUXE <span className="text-amber-400">REALTY</span>
          </h1>
          <p className="text-gray-400 text-lg">Reset Your Password</p>
        </div>
        
        <div className="flex justify-center">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}