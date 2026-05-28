# Missing / Unconfirmed Mobile API Endpoints

Ниже список endpoints, которых нет в `Rentoo Backend API.postman_collection.json`, но мобильное приложение либо уже имеет экран под этот сценарий, либо сценарий логично понадобится позже.

## Нужны мобильному приложению

- `PATCH /api/v1/favorites/:listing_id/`
  - Не обязателен: текущий API закрывает избранное через `POST /favorites/` и `DELETE /favorites/:listing_id/`.

- `GET /api/v1/reviews/me/`
  - Не обязателен для MVP: может понадобиться, если нужен отдельный экран всех моих отзывов.

- `POST /api/v1/auth/phone/change/cancel/`
  - Не обязателен: в collection есть send/verify смены телефона, но нет отмены процесса.

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
