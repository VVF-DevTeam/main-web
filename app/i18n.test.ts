import { describe, test, expect } from "vitest";
import initTranslations from "./i18n";

describe("Testing i18n English instance creation", () => {
    test("should create an i18n instance with all matching translations", async () => {
        const i18nInstance = await initTranslations("en", ["homePage"]);
        expect(i18nInstance).toBeDefined();
        expect(i18nInstance.i18n.language).toBe("en");
        expect(i18nInstance.resources).toBeDefined();
        expect(i18nInstance.resources["en"]).toBeDefined();
        expect(i18nInstance.resources["en"].homePage).toBeDefined();
        expect((i18nInstance.resources["en"].homePage as Record<string, string>)["button-contactUs"]).toBe("Chat Now");
    })
})

describe("Testing i18n Vietnamese instance creation", () => {
    test("should create an i18n instance with all matching translations", async () => {
        const i18nInstance = await initTranslations("vi", ["homePage"]);
        expect(i18nInstance).toBeDefined();
        expect(i18nInstance.i18n.language).toBe("vi");
        expect(i18nInstance.resources).toBeDefined();
        expect(i18nInstance.resources["vi"]).toBeDefined();
        expect(i18nInstance.resources["vi"].homePage).toBeDefined();
        expect((i18nInstance.resources["vi"].homePage as Record<string, string>)["button-contactUs"]).toBe("Trò Chuyện Ngay");
    })
})

describe("Testing i18n French instance creation", () => {
    test("should create an i18n instance with all matching translations", async () => {
        const i18nInstance = await initTranslations("fr", ["homePage"]);
        expect(i18nInstance).toBeDefined();
        expect(i18nInstance.i18n.language).toBe("fr");
        expect(i18nInstance.resources).toBeDefined();
        expect(i18nInstance.resources["fr"]).toBeDefined();
        expect(i18nInstance.resources["fr"].homePage).toBeDefined();
        expect((i18nInstance.resources["fr"].homePage as Record<string, string>)["button-contactUs"]).toBe("Discuter maintenant");
    })
})