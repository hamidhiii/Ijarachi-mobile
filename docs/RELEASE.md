# Rentoo — чеклист релиза в App Store / Google Play

Приложение: **Rentoo**
Компания: **Zinvo**
Bundle ID (iOS): `com.zinvo.rentoo`
Package name (Android): `com.zinvo.rentoo`

Что уже сделано в коде:

- [x] Ребрендинг (имя, scheme, bundle id, package, ключи AsyncStorage)
- [x] `app.json` заполнен: iOS `infoPlist` с permission-строками, Android `permissions`, adaptive icon
- [x] `eas.json` — три профиля: `development`, `preview`, `production`
- [x] API-слой готов к переключению на реальный бэкенд (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_MOCK_MODE`)
- [x] Все экраны декларированы в `app/_layout.tsx`
- [x] Search работает, auth-guard на публикацию объявления, подтверждение удаления

## 1. Что нужно от тебя (один раз)

### Apple Developer
- [ ] Apple Developer Account — **$99/год** → <https://developer.apple.com/programs/enroll/>
- [ ] Apple Team ID (10 символов, ABCDE12345) → записать в `eas.json` → `submit.production.ios.appleTeamId`
- [ ] Apple ID email → в `eas.json` → `appleId`
- [ ] Создать приложение в App Store Connect
  - Name: **Rentoo**
  - Primary language: Russian (Uzbekistan поддерживается отдельно)
  - Bundle ID: `com.zinvo.rentoo` (зарегистрируй его в Identifiers в developer.apple.com)
  - SKU: `rentoo-001`
- [ ] ASC App ID (9-10 цифр из App Store Connect) → в `eas.json` → `ascAppId`

### Google Play Console
- [ ] Google Play Developer Account — **$25 разово** → <https://play.google.com/console/signup>
- [ ] Создать приложение:
  - Name: **Rentoo**
  - Default language: Russian
  - App or game: App
  - Free or paid: Free
- [ ] Создать service account для EAS Submit:
  1. Google Cloud Console → Linked project → IAM → Service Accounts → Create
  2. Role: **Service Account User**
  3. Keys → Add key → JSON → скачать
  4. В Play Console → Users & permissions → Invite user → тот email → All apps → grant Release permission
  5. Положи JSON в `./secrets/google-play-service-account.json` (уже в .gitignore)

### Ассеты (от дизайнера)
- [ ] **Иконка приложения** 1024×1024 PNG без прозрачности → `./assets/images/icon.png`
- [ ] **Android adaptive icon foreground** 1024×1024 PNG с прозрачностью (центральная часть в круге 66%) → `./assets/images/android-icon-foreground.png`
- [ ] **Android adaptive icon background** 1024×1024 PNG (сплошной цвет или паттерн) → `./assets/images/android-icon-background.png`
- [ ] **Android monochrome** 1024×1024 PNG (белое на прозрачном, для темы Android 13+) → `./assets/images/android-icon-monochrome.png`
- [ ] **Splash screen** 400×400 PNG (лого по центру) → `./assets/images/splash-icon.png`
- [ ] **Favicon** 48×48 PNG → `./assets/images/favicon.png`

### Скриншоты для сторов (от дизайнера или после сборки — через симулятор)
- [ ] iPhone 6.9" (iPhone 16 Pro Max): 1320×2868 — **3-10 штук**
- [ ] iPhone 6.5" (iPhone 11 Pro Max): 1242×2688 — **3-10 штук**
- [ ] iPad Pro 13" (если поддерживаем): 2064×2752 — **3-10 штук** (у нас `supportsTablet: true`)
- [ ] Android phone: 1080×1920 — **2-8 штук**
- [ ] Feature graphic (Play Store): 1024×500

### Юридические
- [ ] **Privacy Policy URL** (обязательно для обоих сторов!)
  - Шаблон в `docs/PRIVACY.md` — адаптируй под юристов и размести на `https://rentoo.uz/privacy` или `https://zinvo.uz/privacy`
- [ ] **Terms of Service URL** — шаблон в `docs/TERMS.md`
- [ ] **Support URL** (например `https://rentoo.uz/support` или email-mailto)
- [ ] **Data Safety form** в Google Play (какие данные собираем, зачем)
- [ ] **App Privacy** в App Store Connect (тот же опрос, другой формат)

## 2. Пошагово: первая сборка

```bash
# 1. Установить CLI
npm i -g eas-cli

# 2. Залогиниться в expo.dev (бесплатный аккаунт)
eas login

# 3. Инициализировать проект на expo.dev — это проставит projectId в app.json → extra.eas
eas init

# 4. Development build (для теста на устройстве через Expo Dev Client)
eas build --profile development --platform ios
eas build --profile development --platform android

# 5. Preview build (внутренний APK / TestFlight)
eas build --profile preview --platform android    # → .apk
eas build --profile preview --platform ios        # → .ipa для TestFlight

# 6. Production build
eas build --profile production --platform ios     # → .ipa для App Store
eas build --profile production --platform android # → .aab для Google Play
```

## 3. Отправка в сторы

```bash
# iOS → TestFlight / App Store Connect
eas submit --profile production --platform ios --latest

# Android → Google Play internal track
eas submit --profile production --platform android --latest
```

После `submit`:

1. **iOS:** в App Store Connect сборка появится в TestFlight через ~15-30 мин.
   Заполни Version Information, добавь скриншоты, описание, категорию (Shopping / Lifestyle), возраст 4+, ссылки Privacy/Support → Submit for Review.
2. **Android:** в Play Console → Internal testing → Create release → Submit. Когда проверишь → Production.

## 4. Что Apple/Google точно спросят

| Вопрос | Ответ |
|---|---|
| App category | Shopping (primary), Lifestyle (secondary) |
| Age rating | 4+ (iOS), Everyone (Android) |
| Does app use encryption? | `ITSAppUsesNonExemptEncryption: false` уже стоит в `app.json` → нет |
| Collects user data? | Да: имя, телефон, фото товара, геолокация при аренде. Все для работы сервиса, не продаём. |
| Sign in required? | Да, OTP по телефону |
| Log in with demo account | Apple попросит тестовый phone + OTP — дай им мок-номер `+998901234567` и код `0000` (сейчас принимает любой код в mock; в проде нужен будет специальный "demo" флаг в бэке) |

## 5. Версионирование

В `app.json`:
- iOS: `expo.version` + `expo.ios.buildNumber` (автоинкремент в `eas.json` → `autoIncrement: true` для production уже стоит)
- Android: `expo.version` + `expo.android.versionCode` (тоже автоинкремент)

Для следующих релизов просто меняй `expo.version` (`1.0.0` → `1.0.1` → `1.1.0`) и запускай `eas build --profile production`.

## 6. После выхода API

Когда бэкенд поднимется:

1. В `eas.json` → `production.env.EXPO_PUBLIC_API_URL` вписать реальный URL (сейчас `https://api.rentoo.uz/api/v1` — поправь если другой).
2. Убедиться что `EXPO_PUBLIC_MOCK_MODE=false`.
3. В сервисах (`services/*`) если у эндпоинта изменился путь — поправить в соответствующем методе.
4. Проверить форматы ответов: `services/authService.ts`, `services/listingService.ts`, `services/rentalService.ts`, `services/chatService.ts`, `services/userService.ts` ожидают JSON в виде TS-типов из `types/*`. Если бэкенд вернёт другую форму — добавить mapper в сервисе.
5. `eas update --branch production` для OTA-обновления (без пересборки), или новый `eas build` если меняется нативная часть.

## 7. Типичные подводные камни

- **iOS отклонение за пустой privacy**: заполни все infoPlist строки (уже сделано) + загрузи Privacy URL в App Store Connect.
- **Android отклонение за permissions**: не просим лишнего — только камера, галерея, локация (объяснено в описании).
- **Test account**: Apple почти всегда просит тестовый логин. В description → "App Review Information" указать телефон + OTP.
- **Privacy Policy должен быть по HTTPS**, не HTTP, и отдавать HTML (не PDF).
