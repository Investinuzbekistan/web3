# Invest in Uzbekistan — Investor Explorer

Interaktiv vosita: 14 hudud xaritasi, sektor matritsasi, yoʻl konfiguratori, valyuta kalkulyatori.

> **Konsept/demo loyiha.** Bu sayt agentlik tomonidan yuritilmaydi.
> Rasmiy maʼlumot: <https://invest.gov.uz>

**Stack:** Svelte 5 (runes) · TypeScript · Vite · D3 (geo) · PWA

## Ishga tushirish

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview
```

`dist/` — mustaqil statik bundle. `base` nisbiy, shuning uchun u domen
ildizida ham, sub-papkada ham ishlaydi. `.github/workflows/deploy.yml` har
push'da uni GitHub Pages'ga chiqaradi (Settings → Pages → Source: GitHub Actions).

## Maʼlumot

Sahifadagi **hech bir raqam kodda yozilmagan**. Hammasi ishga tushganda
`public/data/content.json` dan yuklanadi, har birining yonida manba va sana
koʻrsatiladi, footerda esa toʻliq manbalar roʻyxati bor.

Raqamni oʻzgartirish uchun `public/data/content.json` ni tahrirlang va
`sources` ga mos yozuv qoʻshing. Manbasiz raqam qoʻshilmaydi.

Til: `uz` (default), `ru`, `en`. Tanlov URL'da (`?lang=en`) va
`localStorage`da saqlanadi.

## Eslatma

Bu repo uchta konseptdan biri. Umumiy faktlar bazasi, brend quvuri va logo
manbalari alohida monorepo'da turadi va bu yerga koʻchirib chiqarilgan —
`content.json` oʻzgarsa, uchala repo ham yangilanishi kerak.

Litsenziyalar va atributlar: `CREDITS.md`.
