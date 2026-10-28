import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router"
import { toast } from "react-toastify"
import { LuStar } from "react-icons/lu"
import { createProductReview, getProductReviews } from "../api/backend"
import { UseUser } from "../context/UserContext"

export default function ProductReviews({ productId, onReviewSubmitted }) {
  const { currentUser } = UseUser()
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState("")

  const loadReviews = useCallback(async () => {
    setLoading(true)
    setLoadError("")
    const result = await getProductReviews(productId)
    if (result?.success && Array.isArray(result.reviews)) {
      setReviews(result.reviews)
    } else {
      setLoadError(result?.message || "Reviews could not be loaded.")
    }
    setLoading(false)
  }, [productId])

  useEffect(() => { loadReviews() }, [loadReviews])

  const submit = async (event) => {
    event.preventDefault()
    if (!currentUser) {
      toast.info("Sign in to leave a product review.")
      return
    }
    if (!comment.trim()) {
      toast.error("Write a short comment before submitting.")
      return
    }
    setSubmitting(true)
    const result = await createProductReview(productId, { rating, comment: comment.trim() })
    if (result?.success) {
      setReviews((current) => [result.review, ...current])
      setComment("")
      onReviewSubmitted?.(result.product)
      toast.success("Your review was added.")
    } else {
      toast.error(result?.message || "Could not submit your review.")
    }
    setSubmitting(false)
  }

  return (
    <section className="mt-14 border-t border-[#ededed] pt-10 dark:border-[#2a2a2a]" aria-labelledby="product-reviews-heading">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="product-reviews-heading" className="font-Display text-2xl font-bold text-black dark:text-white">Customer reviews</h2>
          <p className="mt-1 text-sm text-[#888]">Reviews are available to customers with a delivered order.</p>
        </div>
        {!currentUser && (
          <Link className="text-sm font-medium underline underline-offset-4" to="/login" state={{ from: `/product/${productId}` }}>
            Sign in to review
          </Link>
        )}
      </div>

      {currentUser && (
        <form className="mb-8 grid gap-4 rounded-xl border border-[#ececec] p-5 dark:border-[#333]" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-medium text-[#484848] dark:text-[#ddd]">
            Your rating
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  aria-pressed={rating === value}
                  onClick={() => setRating(value)}
                  className="p-1 text-[#fca120]"
                >
                  <LuStar size={22} className={value <= rating ? "fill-current" : ""} />
                </button>
              ))}
            </span>
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#484848] dark:text-[#ddd]">
            Your review
            <textarea
              className="min-h-24 rounded-lg border border-[#ddd] bg-white p-3 text-sm text-black outline-none focus:border-black dark:border-[#333] dark:bg-[#141414] dark:text-white"
              maxLength={1000}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="What did you think about this product?"
              required
            />
          </label>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-[#888]">{comment.length}/1000</span>
            <button type="submit" disabled={submitting} className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-[#fca120] dark:text-black">
              {submitting ? "Submitting…" : "Submit review"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-6 text-sm text-[#888]" role="status">Loading reviews…</p>
      ) : loadError ? (
        <div className="py-4 text-sm text-rose-600" role="alert">
          {loadError} <button type="button" className="underline" onClick={loadReviews}>Retry</button>
        </div>
      ) : reviews.length === 0 ? (
        <p className="py-6 text-sm text-[#888]">No reviews yet.</p>
      ) : (
        <ul className="divide-y divide-[#ededed] dark:divide-[#2a2a2a]">
          {reviews.map((review) => (
            <li key={review._id} className="py-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-black dark:text-white">{review.name}</p>
                <time className="text-xs text-[#888]" dateTime={review.createdAt}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </time>
              </div>
              <p className="mt-2 flex items-center gap-1 text-[#fca120]" aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, index) => <LuStar key={index} size={15} className={index < review.rating ? "fill-current" : ""} />)}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#555] dark:text-[#ccc]">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
