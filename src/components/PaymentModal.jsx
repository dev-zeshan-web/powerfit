import { useState } from 'react'
import { X, Phone, CheckCircle, Copy, Upload, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const NAYAPAY_NUMBER = import.meta.env.VITE_NAYAPAY_NUMBER || '0312-6784162'
const MERCHANT_NAME = import.meta.env.VITE_NAYAPAY_NAME || 'PowerFit Gym'

export default function PaymentModal({ plan, onClose, onSuccess }) {
  const { user, profile } = useAuth()
  const [step, setStep] = useState(1) // 1=details, 2=payment, 3=confirm
  const [txnId, setTxnId] = useState('')
  const [senderNumber, setSenderNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  function copyNumber() {
    navigator.clipboard.writeText(NAYAPAY_NUMBER.replace(/-/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function submitPayment() {
    if (!txnId.trim() || !senderNumber.trim()) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      // Create membership record
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + plan.duration_days)

      const { data: membership, error: mErr } = await supabase
        .from('memberships')
        .insert({
          member_id: user.id,
          plan_id: plan.id,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'pending'
        })
        .select()
        .single()

      if (mErr) throw mErr

      // Create payment record
      const { error: pErr } = await supabase
        .from('payments')
        .insert({
          membership_id: membership.id,
          member_id: user.id,
          plan_id: plan.id,
          amount: plan.price,
          payment_method: 'nayapay',
          transaction_id: txnId,
          nayapay_number: senderNumber,
          status: 'pending',
          notes: `Payment for ${plan.name} plan`
        })

      if (pErr) throw pErr

      setStep(3)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 3000)
    } catch (err) {
      toast.error('Payment submission failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-700 rounded-3xl shadow-2xl w-full max-w-md animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="relative h-2 bg-gradient-to-r from-green-400 to-green-600" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl text-dark-800 dark:text-white">PAYMENT</h2>
              <p className="text-sm text-gray-400 font-body">{plan.name} Plan - PKR {plan.price?.toLocaleString()}</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center
            text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-600 transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${
                  step >= s ? 'bg-green-500' : 'bg-gray-200 dark:bg-dark-500'
                }`} />
              </div>
            ))}
          </div>

          {/* Step 1: Plan Details */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-5 bg-gray-50 dark:bg-dark-600 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-body text-gray-500 text-sm">Plan</span>
                  <span className="font-heading font-bold text-dark-800 dark:text-white">{plan.name}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-body text-gray-500 text-sm">Duration</span>
                  <span className="font-heading font-bold text-dark-800 dark:text-white">{plan.duration_days} Days</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-dark-500">
                  <span className="font-body font-bold text-gray-700 dark:text-gray-300">Total Amount</span>
                  <span className="font-display text-2xl text-green-600">PKR {plan.price?.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-2xl">
                <p className="text-xs text-brand-700 dark:text-brand-400 font-body leading-relaxed">
                  📋 <strong>Instructions:</strong> Send payment via NayaPay then enter your Transaction ID. 
                  Your membership will be activated within 24 hours after admin verification.
                </p>
              </div>

              <button onClick={() => setStep(2)} className="btn-primary w-full">
                Proceed to Payment
              </button>
            </div>
          )}

          {/* Step 2: NayaPay Details */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              {/* NayaPay Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <Phone className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-body uppercase tracking-wider">Send to</p>
                    <p className="font-display text-2xl tracking-wider">{NAYAPAY_NUMBER}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-xs font-body">Account Name</p>
                    <p className="font-bold font-heading">{MERCHANT_NAME}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-body">Amount</p>
                    <p className="font-display text-xl">PKR {plan.price?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <button onClick={copyNumber}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed
                border-green-400 rounded-xl text-green-600 font-body font-semibold text-sm hover:bg-green-50
                dark:hover:bg-green-900/20 transition-all">
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy NayaPay Number'}
              </button>

              <div>
                <label className="label">Transaction ID (from NayaPay)</label>
                <input
                  type="text"
                  placeholder="e.g. EP123456789"
                  value={txnId}
                  onChange={e => setTxnId(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Your NayaPay Number</label>
                <input
                  type="tel"
                  placeholder="03XX-XXXXXXX"
                  value={senderNumber}
                  onChange={e => setSenderNumber(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline flex-1">
                  Back
                </button>
                <button onClick={submitPayment} disabled={loading} className="btn-primary flex-1">
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                  ) : 'Submit Payment'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-green-500" size={40} />
              </div>
              <h3 className="font-display text-2xl text-dark-800 dark:text-white">PAYMENT SUBMITTED!</h3>
              <p className="text-gray-500 font-body text-sm leading-relaxed">
                Your payment is pending verification. Your membership will be activated within 24 hours.
                We'll send you a confirmation notification.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-600 font-body text-sm font-semibold">Awaiting Admin Verification</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
