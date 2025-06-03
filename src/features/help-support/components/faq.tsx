"use client"

import { useState, useEffect } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useSupportTabsStore } from "@/app/admin/support/_store/support-store"

const FAQSection = () => {
  const {
    faqs,
    faqLoading,
    faqError,
    deletingFAQId,
    getFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    activeTab,
  } = useSupportTabsStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<{
    id: string
    question: string
    answer: string
  } | null>(null)
  const [newQuestion, setNewQuestion] = useState("")
  const [newAnswer, setNewAnswer] = useState("")

  useEffect(() => {
    if (activeTab === "Frequently Asked Questions (FAQs)") {
      console.log("Fetching FAQs for FAQ tab")
      getFAQs()
    }
  }, [activeTab, getFAQs])

  useEffect(() => {
    console.log("FAQs state updated:", faqs)
  }, [faqs])

  const handleAddFAQ = () => {
    setEditingFAQ(null)
    setNewQuestion("")
    setNewAnswer("")
    setDialogOpen(true)
  }

  const handleEditFAQ = (faq: {
    id: string
    question: string
    answer: string
  }) => {
    console.log("Editing FAQ:", faq)
    setEditingFAQ(faq)
    setNewQuestion(faq.question)
    setNewAnswer(faq.answer)
    setDialogOpen(true)
  }

  const handleSaveFAQ = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error("Question and answer are required")
      return
    }

    const faqData = {
      question: newQuestion,
      answer: newAnswer,
      category: "SUPPORT",
      isActive: true,
      lastUpdatedById: "cmaf54tao0000mstgofhtes4y",
      createdById: "cmaf54tao0000mstgofhtes4y",
    }

    console.log("Saving FAQ:", faqData, { editingFAQ })

    try {
      if (editingFAQ) {
        await updateFAQ(editingFAQ.id, faqData)
      } else {
        await createFAQ(faqData)
      }
      setDialogOpen(false)
      setNewQuestion("")
      setNewAnswer("")
      setEditingFAQ(null)
    } catch (error: any) {
      console.error("Error saving FAQ:", error)
      toast.error(`Failed to save FAQ: ${error.message || "Unknown error"}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">What to Include?</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddFAQ}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              disabled={faqLoading}
            >
              <Plus className="size-4" />
              New FAQ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingFAQ ? "Edit FAQ" : "Add New FAQ"}
              </DialogTitle>
              <DialogDescription>
                {editingFAQ
                  ? "Edit the question and answer for this FAQ."
                  : "Enter the question and answer for a new FAQ."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Enter FAQ question"
                  disabled={faqLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Enter FAQ answer"
                  disabled={faqLoading}
                />
              </div>
              <Button
                onClick={handleSaveFAQ}
                className="w-full"
                disabled={faqLoading}
              >
                {editingFAQ
                  ? faqLoading
                    ? "Updating..."
                    : "Update"
                  : faqLoading
                    ? "Creating..."
                    : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <h4 className="text-sm italic text-gray-500">
        📌 Following queries will be displayed to users in FAQs section
      </h4>

      {faqLoading && !deletingFAQId && (
        <div className="text-center">
          <svg
            className="animate-spin h-5 w-5 mx-auto text-blue-600"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
            />
          </svg>
          <p>Loading FAQs...</p>
        </div>
      )}

      {faqError && (
        <p className="text-red-600 text-center">Error: {faqError}</p>
      )}

      {!faqLoading && !faqError && faqs.length === 0 && (
        <p className="text-gray-500 text-center">
          No FAQs available. Add a new FAQ to get started.
        </p>
      )}

      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <div className="flex justify-between items-center py-2 px-4">
              <AccordionTrigger className="flex items-center gap-2 w-full text-left">
                <span className="text-blue-600">🟢</span>
                <span className="font-semibold">
                  {faq.question || "No question"}
                </span>
                {deletingFAQId === faq.id && (
                  <span className="text-gray-500 text-sm ml-2">
                    Deleting...
                  </span>
                )}
              </AccordionTrigger>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditFAQ(faq)
                  }}
                  disabled={faqLoading}
                >
                  <Pencil className="size-4 text-blue-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log("Deleting FAQ with ID:", faq.id)
                    deleteFAQ(faq.id)
                  }}
                  disabled={faqLoading}
                >
                  <Trash2 className="size-4 text-red-600" />
                </Button>
              </div>
            </div>
            <AccordionContent>
              <p className="pl-6 w-full">{faq.answer || "No answer"}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default FAQSection
