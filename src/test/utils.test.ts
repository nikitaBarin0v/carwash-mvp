import { describe, it, expect } from "vitest"

// Тестируем функцию генерации слотов времени
function generateTimeSlots() {
  const slots: string[] = []
  for (let h = 8; h < 20; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`)
    slots.push(`${String(h).padStart(2, "0")}:30`)
  }
  return slots
}

// Тестируем функцию проверки доступности слота
function isSlotTooSoon(date: Date, time: string): boolean {
  const [hours, minutes] = time.split(":").map(Number)
  const slotDateTime = new Date(date)
  slotDateTime.setHours(hours, minutes, 0, 0)
  const oneHourFromNow = new Date()
  oneHourFromNow.setHours(oneHourFromNow.getHours() + 1)
  return slotDateTime < oneHourFromNow
}

describe("generateTimeSlots", () => {
  it("должен генерировать 24 слота", () => {
    const slots = generateTimeSlots()
    expect(slots).toHaveLength(24)
  })

  it("первый слот должен быть 08:00", () => {
    const slots = generateTimeSlots()
    expect(slots[0]).toBe("08:00")
  })

  it("последний слот должен быть 19:30", () => {
    const slots = generateTimeSlots()
    expect(slots[slots.length - 1]).toBe("19:30")
  })

  it("каждый час должен иметь слоты :00 и :30", () => {
    const slots = generateTimeSlots()
    expect(slots).toContain("10:00")
    expect(slots).toContain("10:30")
    expect(slots).toContain("15:00")
    expect(slots).toContain("15:30")
  })
})

describe("isSlotTooSoon", () => {
  it("слот в прошлом должен быть недоступен", () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isSlotTooSoon(yesterday, "10:00")).toBe(true)
  })

  it("слот через 2 часа должен быть доступен", () => {
    const today = new Date()
    const twoHoursLater = new Date()
    twoHoursLater.setHours(twoHoursLater.getHours() + 2)
    const time = `${String(twoHoursLater.getHours()).padStart(2, "0")}:00`
    expect(isSlotTooSoon(today, time)).toBe(false)
  })
})