# Missing / Unconfirmed Mobile API Endpoints

Ниже список endpoints, которых нет в `Rentoo Backend API.postman_collection.json`, но мобильное приложение либо уже имеет экран под этот сценарий, либо сценарий логично понадобится позже.

## Нужны мобильному приложению

- `GET /api/v1/users/:id/`
  - Публичный профиль арендодателя для экрана seller profile.
  - Сейчас mobile временно собирает данные продавца из `GET /api/v1/listings/`.

- `GET /api/v1/users/:id/listings/` или фильтр `GET /api/v1/listings/?owner=:id`
  - Публичные объявления конкретного арендодателя.
  - Сейчас mobile временно грузит общий список и фильтрует на клиенте.

- `DELETE /api/v1/listings/:id/`
  - Удаление своего объявления из экрана "Мои объявления".
  - В collection есть detail/update, но delete не описан.

- `PATCH /api/v1/listings/:id/availability/` или документированное поле `blocked_dates`
  - Управление занятыми датами объявления.
  - Сейчас mobile отправляет `blockedDates` через update listing, но contract не описан.

- `GET /api/v1/favorites/`, `POST /api/v1/favorites/`, `DELETE /api/v1/favorites/:listing_id/`
  - Синхронизация избранного между устройствами.
  - Сейчас wishlist локальный.

- `GET /api/v1/listings/:id/reviews/` и `POST /api/v1/deals/:id/review/`
  - Отзывы и рейтинг после завершения сделки.
  - Сейчас mobile только отображает агрегированные `rating/review_count`, если они приходят в listing.

- `POST /api/v1/chat/conversations/:id/read/`
  - Сброс unread counter после открытия чата.
  - Сейчас collection дает список/сообщения, но mark-read для чата нет.

- `POST /api/v1/notifications/read-all/`
  - Массово прочитать все уведомления.
  - Сейчас mobile вызывает `/notifications/:id/read/` по одному уведомлению.

## Provider-gated, включать после договоров

Эти endpoints в collection есть, но в mobile сейчас поставлен alert/guard, потому что нет договоров с провайдерами:

- Eskiz SMS: `/auth/sms/send/`, `/auth/sms/verify/`, `/auth/register/`, `/auth/login/`
- MyID: `/myid/start/`, `/users/me/verification/`
- Click/Payme: `/deals/:id/pay/`

## Не mobile-side

Эти endpoints есть в collection, но mobile не должен напрямую ими управлять:

- `/delivery/webhook/`
- `/payments/payme/callback/`
- `/payments/click/callback/`
- `/listings/:id/moderate/`
- `/admin-api/*`
- `/api/schema/*`
