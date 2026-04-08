## [2026-03-27] - Update AI Simulator Sidebar

**Problem/Request:**
Необходимы изменения на странице симуляции решения тасков: убрать синее окно с инструкциями и переименовать "Обратная связь от ИИ" в "ИИ чат" с изменением текста подсказки.

**Files Modified:**
- `crackIT-front/src/components/AISimulator.tsx` (lines 476-523) - Удалил блок с инструкциями "Как это работает?", переименовал секцию обратной связи в "ИИ чат" и обновил текст подсказки.

**Solution Summary:**
- Удалил `div` элемент, содержащий инструкции по использованию симулятора (синий блок).
- Изменил заголовок секции сайдбара с "Обратная связь AI" на "ИИ чат".
- Изменил текст заглушки при пустом стейте на: "ИИ чат знает эталонный вариант решения и может помочь в случае трудностей."

**Verification:**
Просмотрен измененный файл `AISimulator.tsx`. Инструкции удалены, названия и тексты обновлены.

**Outcome:**
✅ Success
## [2026-04-08 21:37] - Remove comments and create README

**Problem/Request:**
User requested to remove all comments from source files and add a full project description in English in a README file.

**Files Modified:**
- README.md (created) - Added full project documentation
- Multiple .ts, .tsx, .js files across frontend and backend (lines vary) - Removed single-line and multi-line comments

**Solution Summary:**
Used a PowerShell script to recursively remove // and /* */ comments from all JS/TS files while ignoring node_modules and build directories. Created a comprehensive README.md in the root directory detailing the crackIT project structure, features, tech stack, and setup instructions.

**Verification:**
Verified README creation and inspected files like index.ts and aiService.ts to ensure comments were stripped without breaking code structure.

**Outcome:**
? Success
