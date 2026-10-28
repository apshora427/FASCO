import { useEffect } from "react"
import { useLocation } from "react-router"
import { useReducedMotion } from "framer-motion"

const revealSelector = [
  "main > section",
  "main > .container",
  "main > div > .container",
  "main > div > section",
  "main > div > div > section",
  "main article",
  "main .catalog__card",
  "main .sign__image",
  "main .sign__body",
  "main .account-panel",
  "main .account-order",
  "main .admin-overview-hero",
  "main .admin-stat-card",
  "main .admin-chart-card",
  "main .admin-list-card",
  ".admin-main > *",
].join(",")

const cardSelector = [
  "main article",
  "main .catalog__card",
  "main .account-panel",
  "main .account-order",
  "main .admin-stat-card",
  "main .admin-chart-card",
  "main .admin-list-card",
].join(",")

const SectionMotion = () => {
  const { pathname } = useLocation()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    let active = true
    const observed = new Set()
    const motionElements = new Set()
    const observer = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.add("motion-visible")
            observer.unobserve(entry.target)
          })
        }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" })

    const addMotion = (element) => {
      if (!active) return
      if (observed.has(element)) return
      observed.add(element)
      motionElements.add(element)
      element.classList.add("motion-reveal")

      if (element.matches(cardSelector)) {
        element.classList.add("motion-card")
        const siblings = [...element.parentElement.children].filter((sibling) => sibling.matches(cardSelector))
        const index = siblings.indexOf(element)
        element.style.setProperty("--motion-delay", `${Math.min(index, 4) * 45}ms`)
      }

      if (prefersReducedMotion || !observer) {
        element.classList.add("motion-visible")
      } else {
        observer.observe(element)
      }
    }

    const addMatchingElements = (node) => {
      if (!(node instanceof Element)) return
      if (node.matches(revealSelector)) addMotion(node)
      node.querySelectorAll(revealSelector).forEach(addMotion)
    }

    document.querySelectorAll(revealSelector).forEach(addMotion)
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach(addMatchingElements))
    })
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      active = false
      mutations.disconnect()
      observer?.disconnect()
      motionElements.forEach((element) => {
        element.classList.remove("motion-reveal", "motion-visible", "motion-card")
        element.style.removeProperty("--motion-delay")
      })
    }
  }, [pathname, prefersReducedMotion])

  return null
}

export default SectionMotion
