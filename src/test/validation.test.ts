import { describe, it, expect } from "vitest"
import { z } from "zod"

const bookingSchema = z.object({
  client_name: z.string().min(2, "Минимум 2 символа"),
  client_phone: z.string().min(10, "Введите корректный номер"),
  car_brand: z.string().min(2, "Введите марку автомобиля"),
  car_model: z.string().min(1, "Введите модель автомобиля"),
})

describe("bookingSchema", () => {
  it("должен пройти валидацию с корректными данными", () => {
    const result = bookingSchema.safeParse({
      client_name: "Иван Иванов",
      client_phone: "+7 (999) 000-00-00",
      car_brand: "Toyota",
      car_model: "Camry",
    })
    expect(result.success).toBe(true)
  })

  it("должен отклонить имя короче 2 символов", () => {
    const result = bookingSchema.safeParse({
      client_name: "И",
      client_phone: "+7 (999) 000-00-00",
      car_brand: "Toyota",
      car_model: "Camry",
    })

    expect(result.success).toBe(false)

    // Используем parse() который бросает ошибку — проще для проверки сообщений
    const errors = bookingSchema
      .safeParse({ client_name: "И", client_phone: "+7 (999) 000-00-00", car_brand: "Toyota", car_model: "Camry" })

    if (!errors.success) {
      const messages = errors.error.issues.map(e => e.message)
      expect(messages).toContain("Минимум 2 символа")
    }
  })

  it("должен отклонить телефон короче 10 символов", () => {
    const result = bookingSchema.safeParse({
      client_name: "Иван",
      client_phone: "123",
      car_brand: "Toyota",
      car_model: "Camry",
    })

    expect(result.success).toBe(false)

    if (!result.success) {
      const messages = result.error.issues.map(e => e.message)
      expect(messages).toContain("Введите корректный номер")
    }
  })

  it("должен отклонить пустую марку автомобиля", () => {
    const result = bookingSchema.safeParse({
      client_name: "Иван",
      client_phone: "+7 (999) 000-00-00",
      car_brand: "",
      car_model: "Camry",
    })
    expect(result.success).toBe(false)
  })

  it("должен отклонить пустую модель автомобиля", () => {
    const result = bookingSchema.safeParse({
      client_name: "Иван",
      client_phone: "+7 (999) 000-00-00",
      car_brand: "Toyota",
      car_model: "",
    })
    expect(result.success).toBe(false)
  })
})