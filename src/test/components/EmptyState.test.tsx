import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { EmptyState } from "@/components/shared/EmptyState"

describe("EmptyState", () => {
  it("должен отображать иконку, заголовок и описание", () => {
    render(
      <EmptyState
        icon="🚗"
        title="Записей пока нет"
        description="Вы ещё не записывались на мойку"
      />
    )

    expect(screen.getByText("🚗")).toBeInTheDocument()
    expect(screen.getByText("Записей пока нет")).toBeInTheDocument()
    expect(screen.getByText("Вы ещё не записывались на мойку")).toBeInTheDocument()
  })

  it("не должен показывать кнопку если action не передан", () => {
    render(
      <EmptyState
        icon="📅"
        title="Нет данных"
        description="Данных пока нет"
      />
    )

    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("должен показывать кнопку если action передан", () => {
    const handleClick = vi.fn()

    render(
      <EmptyState
        icon="🚗"
        title="Записей пока нет"
        description="Запишитесь на мойку"
        action={{ label: "Записаться", onClick: handleClick }}
      />
    )

    expect(screen.getByText("Записаться")).toBeInTheDocument()
  })

  it("должен вызывать onClick при нажатии на кнопку", () => {
    const handleClick = vi.fn()

    render(
      <EmptyState
        icon="🚗"
        title="Записей пока нет"
        description="Запишитесь на мойку"
        action={{ label: "Записаться", onClick: handleClick }}
      />
    )

    fireEvent.click(screen.getByText("Записаться"))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})