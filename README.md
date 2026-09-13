# 일기장

GitHub에 Markdown으로 일기를 모으고, GitHub Pages에서 읽습니다.

## 글 쓰기

`entries/YYYY-MM-DD.md` 파일을 추가하세요. 첫 번째 `# 제목`이 글 제목이 됩니다.

```md
# 오늘의 생각

여기에 일기를 씁니다.
```

main에 push하면 전체 Markdown 글을 자동으로 빌드·배포합니다. 사이트의 ‘기록’에서 달력으로 글을 선택하고 제목·본문·날짜로 검색할 수 있고, `/#2026-09-13`처럼 링크를 공유할 수 있습니다. 제목·문단·목록·인용·링크·코드 등 Markdown을 지원합니다.

이 저장소와 배포된 글은 공개됩니다. 브라우저에서 작성하거나 저장하는 기능은 없습니다. 이전 버전의 브라우저 저장 기록은 자동으로 GitHub에 업로드하지 않습니다.

## 로컬 미리보기

```sh
npm ci
npm run build
python3 -m http.server 8080 --directory _site
```
