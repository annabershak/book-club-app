# Сайт записи на книжный клуб

Стек: Next.js + Supabase (база данных) + Stripe (оплата 5€) + Vercel (хостинг).
Всё бесплатно на старте (пока трафик небольшой).

## Шаг 1. Supabase (база данных)

1. Зайди на https://supabase.com, зарегистрируйся, создай новый проект (New Project).
   Задай пароль для базы — сохрани его отдельно (он потом не понадобится в коде, но пусть будет).
2. Подожди 1-2 минуты, пока проект создастся.
3. Открой раздел **SQL Editor** → **New query**, вставь туда содержимое файла
   `supabase-schema.sql` из этого проекта и нажми **Run**.
   Это создаст таблицы `books` и `registrations` и добавит 3 тестовые книги
   (Ольга, Белые ночи, Мемуары гейши) — потом отредактируешь под себя прямо
   в таблице Supabase (Table Editor) или через SQL.
4. Открой **Project Settings → API**. Тебе нужны три значения:
   - `Project URL` → это `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → это `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → это `SUPABASE_SERVICE_ROLE_KEY` (держи в секрете! только на сервере)

## Шаг 2. Stripe (приём оплаты)

1. Зайди на https://stripe.com и зарегистрируйся.
2. Пока не подключал реальный банк — можно тестировать в Test mode
   (переключатель вверху справа в дашборде).
3. Открой **Developers → API keys**. Скопируй **Secret key** (`sk_test_...` для теста,
   `sk_live_...` после активации боевого режима) → это `STRIPE_SECRET_KEY`.
4. Webhook (сообщает нашему сайту, что оплата прошла) настроим ПОСЛЕ деплоя на
   Vercel, потому что для него нужен реальный адрес сайта — см. Шаг 4.

## Шаг 3. Деплой на Vercel

1. Зайди на https://vercel.com, зарегистрируйся (можно через GitHub).
2. Залей этот проект (папку `book-club-app`) к себе на GitHub в новый репозиторий:
   ```bash
   cd book-club-app
   git init
   git add .
   git commit -m "init"
   # создай пустой репозиторий на github.com, затем:
   git remote add origin https://github.com/ТВОЙ_ЛОГИН/book-club-app.git
   git push -u origin main
   ```
3. В Vercel: **Add New → Project**, выбери этот репозиторий.
4. В разделе **Environment Variables** добавь все переменные из `.env.example`
   (кроме комментариев), кроме `STRIPE_WEBHOOK_SECRET` — его добавим следующим шагом.
   `NEXT_PUBLIC_SITE_URL` укажи как будущий адрес, Vercel покажет его после
   первого деплоя, например `https://book-club-app.vercel.app` — впиши его и
   пересохрани переменные (если поменял после первого деплоя, придётся
   передеплоить: **Deployments → ⋯ → Redeploy**).
5. Нажми **Deploy**. Через пару минут сайт будет доступен по ссылке от Vercel.

## Шаг 4. Webhook Stripe

1. В Stripe **Developers → Webhooks → Add endpoint**.
2. URL: `https://ТВОЙ-АДРЕС.vercel.app/api/webhook`
3. Событие для подписки: `checkout.session.completed`.
4. После создания скопируй **Signing secret** (`whsec_...`) →
   это `STRIPE_WEBHOOK_SECRET`. Добавь его в Environment Variables в Vercel
   и сделай Redeploy.

## Шаг 5. Email-подтверждения (Resend)

После оплаты сайт отправляет письмо с датой встречи, книгой и ссылкой на
WhatsApp-группу.

1. Зайди на https://resend.com, зарегистрируйся.
2. **API Keys → Create API Key** → скопируй значение (`re_...`) →
   это `RESEND_API_KEY`.
3. Без подключения своего домена письма уходят с адреса
   `onboarding@resend.dev` — этого достаточно для старта, менять
   `RESEND_FROM_EMAIL` не обязательно.
4. `WHATSAPP_GROUP_URL` — ссылка-приглашение в группу клуба (Group info →
   Invite to group via link в WhatsApp).
5. Добавь `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (если меняла) и
   `WHATSAPP_GROUP_URL` в Environment Variables в Vercel, сделай Redeploy.

## Шаг 6. Проверка

1. Открой свою ссылку — увидишь список книг с датами и местами.
2. Нажми на книгу → заполни имя, email и телефон → нажми оплатить.
3. В тестовом режиме Stripe оплата проходит тестовой картой:
   номер `4242 4242 4242 4242`, любая будущая дата, любой CVC.
4. После оплаты — вернёшься на сайт, а в Supabase в таблице `registrations`
   появится запись со статусом `paid`. Счётчик мест на главной уменьшится.
   На указанный email должно прийти письмо-подтверждение.
5. Админка: `https://ТВОЙ-АДРЕС.vercel.app/admin` — вход по паролю
   `ADMIN_PASSWORD`, который ты задал в переменных окружения. Там видно
   все имена, телефоны и статус оплаты.

## Как добавлять новые встречи/книги

Проще всего через Supabase → **Table Editor → books → Insert row**:
- `title` — название книги
- `event_date` — дата в формате ГГГГ-ММ-ДД
- `description` — короткое описание (необязательно)
- `capacity` — сколько мест
- `price_cents` — цена в центах (500 = 5€)

## Когда будешь готовы принимать реальные деньги

В Stripe пройди верификацию бизнеса (**Activate payments**), переключишься
на live-ключи (`sk_live_...`) — обнови `STRIPE_SECRET_KEY` в Vercel и создай
новый webhook уже в Live mode (тестовый и боевой webhook — разные).

## Локальный запуск (для разработки)

```bash
npm install
cp .env.example .env.local   # заполни значениями
npm run dev
```

Для проверки вебхука локально нужен Stripe CLI (`stripe listen --forward-to
localhost:3000/api/webhook`), но для реального использования это не
обязательно — webhook нужен только на задеплоенном сайте.
