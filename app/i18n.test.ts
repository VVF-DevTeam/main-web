import { describe, it, expect } from "@jest/globals";
import initTranslations from "./i18n";

describe("Testing i18n English instance creation", () => {
    it("should create an i18n instance with all matching translations", async () => {
        const i18nInstance = await initTranslations("en", ["homePage"]);
        console.log(i18nInstance.resources["en"].homePage);
        expect(i18nInstance).toBeDefined();
        expect(i18nInstance.i18n.language).toBe("en");
        expect(i18nInstance.resources).toBeDefined();
        expect(i18nInstance.resources["en"]).toBeDefined();
        expect(i18nInstance.resources["en"].homePage).toBeDefined();
        expect((i18nInstance.resources["en"].homePage as any)['button-contactUs']).toBe("Chat Now");
    })
})

describe("Testing i18n Vietnamese instance creation", () => {
    it("should create an i18n instance with all matching translations", async () => {
        const i18nInstance = await initTranslations("vi", ["homePage"]);
        console.log(i18nInstance.resources["vi"].homePage);
        expect(i18nInstance).toBeDefined();
        expect(i18nInstance.i18n.language).toBe("vi");
        expect(i18nInstance.resources).toBeDefined();
        expect(i18nInstance.resources["vi"]).toBeDefined();
        expect(i18nInstance.resources["vi"].homePage).toBeDefined();
        expect((i18nInstance.resources["vi"].homePage as any)['button-contactUs']).toBe("Trò Chuyện Ngay");
    })
})

describe("Testing i18n French instance creation", () => {
    it("should create an i18n instance with all matching translations", async () => {
        const i18nInstance = await initTranslations("fr", ["homePage"]);
        console.log(i18nInstance.resources["fr"].homePage);
        expect(i18nInstance).toBeDefined();
        expect(i18nInstance.i18n.language).toBe("fr");
        expect(i18nInstance.resources).toBeDefined();
        expect(i18nInstance.resources["fr"]).toBeDefined();
        expect(i18nInstance.resources["fr"].homePage).toBeDefined();
        expect((i18nInstance.resources["fr"].homePage as any)['button-contactUs']).toBe("Discuter maintenant");
    })
})