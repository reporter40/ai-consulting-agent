# Шрифты для PDF (кириллица)

В каталоге лежат **Noto Sans** (Regular, Bold) из проекта [Noto Fonts](https://github.com/googlefonts/noto-fonts).

- Лицензия: **SIL Open Font License 1.1** — см. [OFL.txt](https://github.com/googlefonts/noto-fonts/blob/main/hinted/ttf/NotoSans/OFL.txt) в upstream-репозитории.
- Файлы подтягиваются в образ Docker (`Dockerfile`: `COPY fonts`).

При отсутствии файлов генератор отчёта падает обратно на Helvetica (кириллица может отображаться некорректно).
