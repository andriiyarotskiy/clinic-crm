# Clinic CRM Backend

Backend для CRM клініки на FastAPI. Проєкт запускається через Docker Compose і піднімає API, PostgreSQL, поштовий сервіс
для локальної розробки та файлове сховище MinIO.

## Dev запуск

1. Створити локальний `.env` файл:

```bash
cp .env.sample .env
```

2. Запустити проєкт:

```bash
docker compose -f docker-compose-dev.yml up --build
```

3. Відкрити новий термінал і створити першого адміністратора:

```bash
docker compose -f docker-compose-dev.yml exec web python src/create_initial_admin.py --email admin@admin.com
```

4. Ввести пароль адміністратора і повторити його для підтвердження.

## Seeding test data

CSV-файли з реальними/тестовими даними лежать у папці `backend/seed_data/`:

- `users.csv`
- `patients.csv`
- `doctors.csv`
- `treatments.csv`
- `appointments.csv`
- `visit.csv`

Ці файли використовуються для локального відтворення схожої бази даних, що вже заповнена в Supabase. Скрипт не запускає міграції — він лише заповнює вже існуючу схему.

> **Важливо:** `users.csv` не містить службового супер-адміна — його потрібно створити
> самостійно через `create_initial_admin.py` (див. крок 3 у "Dev запуск" вище). Це
> зроблено навмисно, щоб уникнути конфлікту `id` при створенні першого адміністратора
> та не зберігати службові тестові облікові дані в репозиторії.

### Перед запуском

Переконайтеся, що локальний `.env` створений і база готова до підключення. Мінімально потрібні змінні середовища з файлу `.env.sample`:

```bash
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_HOST=localhost
POSTGRES_DB_PORT=5432
POSTGRES_DB=clinic_db
```

Якщо ви запускаєте через Docker Compose, для сервісу `web` використовуються змінні `POSTGRES_HOST=db` під капотом, а локально — `localhost` або ваш локальний хост PostgreSQL.

### Запуск seed-скрипта

З каталогу `backend`:

```bash
uv run python scripts/seed_from_csv.py --csv-dir seed_data
```

Для перевірки без запису в БД:

```bash
uv run python scripts/seed_from_csv.py --csv-dir seed_data --dry-run
```

Для очистки таблиць перед завантаженням даних:

```bash
uv run python scripts/seed_from_csv.py --csv-dir seed_data --truncate --force
```

> `--truncate` видаляє вміст таблиць: `users`, `patients`, `doctors`, `appointments`, `treatments`, `visit`. Для безпечності при відсутності `--force` скрипт попросить підтвердити вводом `DELETE ALL DATA`.

### Захист від запуску на remote/production базі

Скрипт працює лише для локальних/відомо-безпечних хостів: `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`, `db`, `postgres`.
Якщо `POSTGRES_HOST` не входить у цей allowlist, запуск блокується за замовчуванням з такою помилкою:

```
RuntimeError: Refusing to run seed script: POSTGRES_HOST is not on the local allowlist
(localhost, 127.0.0.1, 0.0.0.0, ::1, db, postgres). If you really mean to run against
a remote host, pass --allow-remote explicitly.
```

**Якщо ви бачите цю помилку** і справді хочете запустити seed проти нестандартного хоста (наприклад, кастомний docker-compose з іншою назвою сервіса бази, чи VPN-тунель до якогось dev-стенду) — додайте прапорець:

```bash
uv run python scripts/seed_from_csv.py --csv-dir seed_data --allow-remote
```

Для `--truncate` на non-local хості додатково потрібен `--allow-remote-truncate` — це навмисно ускладнено, щоб випадково не видалити продові дані:

```bash
uv run python scripts/seed_from_csv.py --csv-dir seed_data --truncate --allow-remote --allow-remote-truncate
```

**Типовий хибний спрацьовування:** якщо у вас є власний `docker-compose.override.yml` з нестандартною назвою сервіса бази (наприклад, `postgres-dev` замість `db`) — це теж потрапить під блокування, хоча фактично хост локальний. У такому випадку просто додайте `--allow-remote`, це безпечно.

### Що робить скрипт

- читає CSV файли у правильному порядку залежностей (`users` → `patients` → `doctors` → `treatments` → `appointments` → `visit`);
- перетворює типи даних (дати, числа, булеві, Decimal, null/empty values);
- виконує upsert за `id` для повторних запусків;
- логує кількість рядків, завантажених у кожну таблицю;
- підтримує `--dry-run` для попередньої перевірки;
- блокує запуск проти non-local/production хостів без явного прапорця (див. вище).

### Інтеграційні тести для seeder

У проекті є інтеграційний тест `tests/test_seed_integration.py` позначений маркером `integration`.
Він виконує реальні `upsert_rows()` операції проти PostgreSQL, тому його треба запускати окремо після підняття БД (наприклад через `docker compose -f docker-compose-dev.yml up db`).

Запуск інтеграційних тестів:

```bash
# підніміть контейнер з базою
docker compose -f docker-compose-dev.yml up -d db

# запустіть тільки інтеграційні тести
.venv/bin/python -m pytest -q -m integration
```

Тест пропаде/провалиться якщо БД не доступна; він позначений як інтеграційний навмисно, щоб не впливати на швидкі unit-тести.

## Production запуск

1. Створити production env файл:

```bash
cp .env.prod.sample .env.prod
```

2. Заповнити `.env.prod` production значеннями: сильні secrets, production database password, `FRONTEND_BASE_URL`, SMTP та S3 credentials.

3. Запустити production compose:

```bash
docker compose -f docker-compose-prod.yml up --build -d
```

4. Створити першого адміністратора:

```bash
docker compose -f docker-compose-prod.yml run --rm web python src/create_initial_admin.py --email admin@admin.com
```

5. Ввести пароль адміністратора і повторити його для підтвердження.

## Доступні сторінки

- API Swagger docs: http://0.0.0.0:8000/docs
- MailHog: http://localhost:8025/
- MinIO storage: http://localhost:9001/clinic-storage

## Корисно знати

- Dev конфіг: `.env` + `docker-compose-dev.yml`
- Production конфіг: `.env.prod` + `docker-compose-prod.yml`
- У Docker Compose запускай команди через service name `web`, а не через container name.
- Email для першого адміна з прикладу: `admin@admin.com`
