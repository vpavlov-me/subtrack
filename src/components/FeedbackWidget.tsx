import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageSquare, Send } from 'lucide-react'

// Extend Window interface for PostHog
declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, any>) => void
    }
  }
}

export function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!feedback.trim()) return

    setSubmitting(true)
    try {
      // Send feedback to PostHog
      if (window.posthog) {
        window.posthog.capture('feedback_submitted', {
          feedback: feedback.trim(),
          timestamp: new Date().toISOString(),
        })
      }

      // Clear form and close modal
      setFeedback('')
      setOpen(false)
      
      // Show success message
      // You could use a toast here
      console.log('Feedback submitted successfully')
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating feedback button */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 shadow-lg"
        size="icon"
        aria-label="Send feedback"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>

      {/* Feedback modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Send Feedback
            </DialogTitle>
            <DialogDescription>
              Help us improve SubTrack by sharing your thoughts, suggestions, or reporting issues.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Your feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Tell us what you think about SubTrack..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handleSubmit} 
                disabled={!feedback.trim() || submitting}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Sending...' : 'Send Feedback'}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 