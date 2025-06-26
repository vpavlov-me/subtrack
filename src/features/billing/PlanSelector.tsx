import { Button } from '@/components/ui/button'
import { stripePromise } from '@/lib/stripe'

export default function PlanSelector() {
  async function goPro() {
    const stripe = await stripePromise
    if (!stripe) return
    const { error } = await stripe.redirectToCheckout({ lineItems:[{price:import.meta.env.VITE_STRIPE_PRICE_ID,quantity:1}], mode:'subscription', successUrl:window.location.origin+'/dashboard', cancelUrl:window.location.href, clientReferenceId:'${auth.user()?.id}' })
    if (error) console.error(error)
  }
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Choose Plan</h2>
      <div className="border p-4 rounded">
        <h3 className="font-semibold">Free</h3>
        <p>До 5 подписок. 1 команда.</p>
      </div>
      <div className="border p-4 rounded">
        <h3 className="font-semibold flex items-baseline gap-2">Pro <span className="text-sm text-zinc-500">$5 / seat / mo</span></h3>
        <p>Безлимитные подписки, команды, приоритет.</p>
        <Button className="mt-2" onClick={goPro}>Upgrade</Button>
      </div>
    </div>
  )
} 