import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Spinner, PageSpinner } from "@/components/shared/Spinner"

describe("Spinner", () => {
  it("должен рендериться без ошибок", () => {
    const { container } = render(<Spinner />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it("должен применять размер sm", () => {
    const { container } = render(<Spinner size="sm" />)
    expect(container.firstChild).toHaveClass("w-4", "h-4")
  })

  it("должен применять размер lg", () => {
    const { container } = render(<Spinner size="lg" />)
    expect(container.firstChild).toHaveClass("w-12", "h-12")
  })
})

describe("PageSpinner", () => {
  it("должен показывать текст Загрузка...", () => {
    render(<PageSpinner />)
    expect(screen.getByText("Загрузка...")).toBeInTheDocument()
  })
})